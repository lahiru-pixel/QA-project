const isEnrolled = require('../../middleware/isEnrolled');
const supabase = require('../../supabaseClient');
const { U, C, V, profile, enrollment, returnedError, context, query, denied, allowed } = require('../helpers/fixtures.cjs');
const VIDEO = { course_id: C };
const errors = {
  user: 'Unauthorized', pay: 'Forbidden: User has not paid', video: 'Video not found',
  id: 'Course ID missing for enrollment check', member: 'Forbidden: Not enrolled in this course',
  exception: 'Internal server error checking enrollment',
};
const cases = [
  { id: '01', name: 'missing user', user: null, code: 401, error: 'user' },
  { id: '02', name: 'admin bypasses payment and missing IDs', user: { id: U, role: 'admin', is_paid: false }, params: {} },
  { id: '03', name: 'unpaid student', user: { ...profile(), is_paid: false }, code: 403, error: 'pay' },
  { id: '04', name: 'explicit course success', member: { data: enrollment(), error: null } },
  { id: '05', name: 'video returned error', videoContext: true, video: { data: null, error: returnedError }, code: 404, error: 'video' },
  { id: '06', name: 'missing video row', videoContext: true, video: { data: null, error: null }, code: 404, error: 'video' },
  { id: '07', name: 'video exists but enrollment absent', videoContext: true, video: { data: VIDEO, error: null }, member: { data: null, error: null }, code: 403, error: 'member' },
  { id: '08', name: 'video and enrollment success', videoContext: true, video: { data: VIDEO, error: null }, member: { data: enrollment(), error: null } },
  { id: '09', name: 'fallback course route id', params: { id: C }, member: { data: enrollment(), error: null } },
  { id: '10', name: 'all identifiers absent', params: {}, code: 400, error: 'id' },
  { id: '11', name: 'video has no course id', videoContext: true, video: { data: { course_id: null }, error: null }, code: 400, error: 'id' },
  { id: '12', name: 'enrollment returned error', member: { data: null, error: returnedError }, code: 403, error: 'member' },
  { id: '13', name: 'video promise rejects', videoContext: true, rejectVideo: true, code: 500, error: 'exception' },
  { id: '14', name: 'enrollment promise rejects', rejectMember: true, code: 500, error: 'exception' },
  { id: '15', name: 'video URL without id', baseUrl: '/api/videos', params: {}, code: 400, error: 'id' },
  { id: '16', name: 'explicit course wins over video id', baseUrl: '/api/videos', params: { courseId: C, id: V }, member: { data: enrollment(), error: null } },
  { id: '17', name: 'invalid UUID forwarded then returned error', params: { courseId: 'not-a-uuid' }, expectedCourse: 'not-a-uuid', member: { data: null, error: returnedError }, code: 403, error: 'member' },
  { id: '18', name: 'unexpected paid role characterization', user: { ...profile(), role: 'teacher' }, member: { data: enrollment(), error: null } },
  { id: '19', name: 'truthy non-Boolean payment characterization', user: { ...profile(), is_paid: 'false' }, member: { data: enrollment(), error: null } },
  { id: '20', name: 'missing payment flag', user: { id: U, role: 'student' }, code: 403, error: 'pay' },
  { id: '21', name: 'video error wins over data', videoContext: true, video: { data: VIDEO, error: returnedError }, code: 404, error: 'video' },
  { id: '22', name: 'enrollment error wins over data', member: { data: enrollment(), error: returnedError }, code: 403, error: 'member' },
];
test.each(cases)('WB-ENR-$id $name', async spec => {
  const ctx = context({
    user: Object.hasOwn(spec, 'user') ? spec.user : profile(),
    params: spec.params || (spec.videoContext ? { id: V } : { courseId: C }),
    baseUrl: spec.baseUrl || (spec.videoContext ? '/api/videos' : '/api/courses'),
  });
  const failure = new Error('QA lookup rejection');
  const queries = {};
  if (spec.video || spec.rejectVideo) queries.videos = query(spec.video, spec.rejectVideo ? failure : undefined);
  if (spec.member || spec.rejectMember) queries.enrollments = query(spec.member, spec.rejectMember ? failure : undefined);
  supabase.from.mockImplementation(table => {
    if (!queries[table]) throw new Error('Unexpected query table: ' + table);
    return queries[table];
  });
  await isEnrolled(ctx.req, ctx.res, ctx.next);
  if (spec.code) denied(ctx, spec.code, errors[spec.error]); else allowed(ctx);
  expect(supabase.from.mock.calls.map(call => call[0])).toEqual(Object.keys(queries));
  if (queries.videos) {
    expect(queries.videos.select).toHaveBeenCalledWith('course_id');
    expect(queries.videos.eq).toHaveBeenCalledWith('id', V);
    expect(queries.videos.single).toHaveBeenCalledTimes(1);
  }
  if (queries.enrollments) {
    expect(queries.enrollments.select).toHaveBeenCalledWith('*');
    expect(queries.enrollments.eq.mock.calls).toEqual([['student_id', U], ['course_id', spec.expectedCourse || C]]);
    expect(queries.enrollments.single).toHaveBeenCalledTimes(1);
  }
  if (spec.code === 500) expect(console.error).toHaveBeenCalledWith('Enrollment middleware error:', failure);
  else expect(console.error).not.toHaveBeenCalled();
});

