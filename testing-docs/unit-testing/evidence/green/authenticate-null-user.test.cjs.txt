const authenticate = require('../../middleware/authenticate');
const supabase = require('../../supabaseClient');
const { context, denied } = require('../helpers/fixtures.cjs');

// TDD regression: absent identity data should fail closed as unauthorized,
// without treating missing identity as an internal server exception.
test.each([null, undefined])('TDD-AUTH-01 missing identity data %s returns 401', async data => {
  const ctx = context();
  supabase.auth.getUser.mockResolvedValue({ data, error: null });
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 401, 'Unauthorized: Invalid token');
  expect(supabase.from).not.toHaveBeenCalled();
  expect(ctx.req.user).toBeUndefined();
  expect(console.error).not.toHaveBeenCalled();
});

