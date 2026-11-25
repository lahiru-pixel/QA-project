// Direct unit invocation of existing route functions; this does not test HTTP wiring.
const router = require('../../routes/courses');
const supabase = require('../../supabaseClient');
const { C, context, query, returnedError, denied } = require('../helpers/fixtures.cjs');
const handler = routePath => router.stack.find(layer => layer.route?.path === routePath && layer.route.methods.get).route.stack[0].handle;
const list = handler('/'), details = handler('/:id');

test.each([{ data: [] }, { data: [{ id: C, title: 'QA course' }] }])('COURSE-01 list returns mocked dataset $data', async ({ data }) => {
  const ctx = context(), q = query({ data, error: null });
  supabase.from.mockReturnValue(q);
  await list(ctx.req, ctx.res, ctx.next);
  expect(supabase.from).toHaveBeenCalledWith('courses');
  expect(q.select).toHaveBeenCalledWith('*');
  expect(q.eq).toHaveBeenCalledWith('is_published', true);
  expect(q.order).toHaveBeenCalledWith('created_at', { ascending: false });
  expect(ctx.res.json).toHaveBeenCalledWith(data);
  expect(ctx.res.status).not.toHaveBeenCalled();
  expect(ctx.next).not.toHaveBeenCalled();
});
test.each(['returned', 'rejected'])('COURSE-02 list %s failure', async mode => {
  const ctx = context(), failure = new Error('QA course failure');
  supabase.from.mockReturnValue(mode === 'returned' ? query({ data: null, error: returnedError }) : query(null, failure));
  await list(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Failed to fetch courses');
  expect(console.error).toHaveBeenCalledWith(mode === 'returned' ? returnedError : failure);
});
test.each([
  ['returned error', { data: { id: C }, error: returnedError }],
  ['missing row', { data: null, error: null }],
])('COURSE-03 details %s returns 404 before video lookup', async (name, result) => {
  const ctx = context({ params: { id: C } });
  supabase.from.mockReturnValue(query(result));
  await details(ctx.req, ctx.res, ctx.next);
  denied(ctx, 404, 'Course not found');
  expect(supabase.from.mock.calls).toEqual([['courses']]);
});
test('COURSE-04 detail projection excludes private youtube_url', async () => {
  const ctx = context({ params: { id: C } }), course = { id: C, title: 'QA course' };
  const videos = [{ id: 'qa-video', title: 'QA lesson' }];
  const cq = query({ data: course, error: null }), vq = query({ data: videos, error: null });
  supabase.from.mockReturnValueOnce(cq).mockReturnValueOnce(vq);
  await details(ctx.req, ctx.res, ctx.next);
  expect(supabase.from.mock.calls).toEqual([['courses'], ['videos']]);
  expect(cq.eq).toHaveBeenCalledWith('id', C);
  expect(vq.select).toHaveBeenCalledWith('id, title, description, order_index, duration_text, created_at');
  expect(vq.eq).toHaveBeenCalledWith('course_id', C);
  expect(vq.order).toHaveBeenCalledWith('order_index', { ascending: true });
  expect(ctx.res.json).toHaveBeenCalledWith({ ...course, videos });
  expect(ctx.res.status).not.toHaveBeenCalled();
  expect(ctx.next).not.toHaveBeenCalled();
});
test.each(['returned', 'rejected'])('COURSE-05 video-list %s failure returns 500', async mode => {
  const ctx = context({ params: { id: C } }), failure = new Error('QA video-list failure');
  supabase.from.mockReturnValueOnce(query({ data: { id: C }, error: null }))
    .mockReturnValueOnce(mode === 'returned' ? query({ data: null, error: returnedError }) : query(null, failure));
  await details(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Failed to fetch course details');
  expect(console.error).toHaveBeenCalledWith(mode === 'returned' ? returnedError : failure);
});
test('COURSE-06 rejected course lookup returns 500', async () => {
  const ctx = context({ params: { id: C } }), failure = new Error('QA course lookup failure');
  supabase.from.mockReturnValue(query(null, failure));
  await details(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Failed to fetch course details');
  expect(supabase.from).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledWith(failure);
});

