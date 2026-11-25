const router = require('../../routes/students');
const supabase = require('../../supabaseClient');
const { U, C, profile, context, query, returnedError, denied } = require('../helpers/fixtures.cjs');
const list = router.stack.find(layer => layer.route?.path === '/courses').route.stack[0].handle;
test.each([
  ['STUDENT-01 empty enrollment list', [], []],
  ['STUDENT-02 filter null course joins', [{ courses: null }, { courses: { id: C } }], [{ id: C }]],
])('%s', async (name, data, expected) => {
  const ctx = context({ user: profile() }), q = query({ data, error: null });
  supabase.from.mockReturnValue(q);
  await list(ctx.req, ctx.res, ctx.next);
  expect(supabase.from).toHaveBeenCalledWith('enrollments');
  expect(q.select).toHaveBeenCalledWith('course_id, enrolled_at, courses(*)');
  expect(q.eq).toHaveBeenCalledWith('student_id', U);
  expect(ctx.res.json).toHaveBeenCalledWith(expected);
  expect(ctx.res.status).not.toHaveBeenCalled();
  expect(ctx.next).not.toHaveBeenCalled();
});
test.each(['returned', 'rejected'])('STUDENT-03 %s dependency failure', async mode => {
  const ctx = context({ user: profile() }), failure = new Error('QA student lookup failure');
  supabase.from.mockReturnValue(mode === 'returned' ? query({ data: null, error: returnedError }) : query(null, failure));
  await list(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Failed to fetch student courses');
  expect(console.error).toHaveBeenCalledWith(mode === 'returned' ? returnedError : failure);
});
test('STUDENT-04 null enrollment collection is handled as an exception', async () => {
  const ctx = context({ user: profile() });
  supabase.from.mockReturnValue(query({ data: null, error: null }));
  await list(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Failed to fetch student courses');
  expect(console.error).toHaveBeenCalledWith(expect.any(TypeError));
});

