const authenticate = require('../../middleware/authenticate');
const supabase = require('../../supabaseClient');
const { U, profile, returnedError, context, query, denied, allowed } = require('../helpers/fixtures.cjs');
const validIdentity = () => supabase.auth.getUser.mockResolvedValue({ data: { user: { id: U } }, error: null });

test.each([
  ['WB-AUT-01 missing header', undefined],
  ['WB-AUT-02 wrong scheme', 'Basic synthetic'],
])('%s', async (name, authorization) => {
  const ctx = context({ headers: { authorization } });
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 401, 'Missing or invalid authorization header');
  expect(supabase.auth.getUser).not.toHaveBeenCalled();
  expect(supabase.from).not.toHaveBeenCalled();
  expect(ctx.req.user).toBeUndefined();
});
test.each([
  ['WB-AUT-03 returned error wins over user', { data: { user: { id: U } }, error: returnedError }],
  ['WB-AUT-04 absent user', { data: { user: null }, error: null }],
])('%s', async (name, result) => {
  const ctx = context();
  supabase.auth.getUser.mockResolvedValue(result);
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 401, 'Unauthorized: Invalid token');
  expect(supabase.from).not.toHaveBeenCalled();
  expect(ctx.req.user).toBeUndefined();
});
test.each([
  ['WB-AUT-05 profile error wins', () => ({ data: profile(), error: returnedError })],
  ['WB-AUT-06 absent profile', () => ({ data: null, error: null })],
])('%s', async (name, result) => {
  const ctx = context(); validIdentity();
  supabase.from.mockReturnValue(query(result()));
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 401, 'Profile not found');
  expect(ctx.req.user).toBeUndefined();
});
test('WB-AUT-07 verified profile is attached and next called once', async () => {
  const ctx = context(), record = profile(), q = query({ data: record, error: null });
  validIdentity(); supabase.from.mockReturnValue(q);
  await authenticate(ctx.req, ctx.res, ctx.next);
  allowed(ctx);
  expect(ctx.req.user).toBe(record);
  expect(supabase.auth.getUser).toHaveBeenCalledWith('qa-fixture-marker');
  expect(supabase.from).toHaveBeenCalledWith('profiles');
  expect(q.select).toHaveBeenCalledWith('*');
  expect(q.eq).toHaveBeenCalledWith('id', U);
  expect(q.single).toHaveBeenCalledTimes(1);
});
test.each([
  ['WB-AUT-08 rejected authentication', 'auth'],
  ['WB-AUT-09 rejected profile lookup', 'profile'],
])('%s', async (name, stage) => {
  const ctx = context(), error = new Error('QA dependency failure');
  if (stage === 'auth') supabase.auth.getUser.mockRejectedValue(error);
  else { validIdentity(); supabase.from.mockReturnValue(query(null, error)); }
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Internal server error during authentication');
  expect(console.error).toHaveBeenCalledWith('Auth middleware error:', error);
  expect(ctx.req.user).toBeUndefined();
  if (stage === 'auth') expect(supabase.from).not.toHaveBeenCalled();
});
test('WB-AUT-10 empty bearer value reaches mocked token rejection', async () => {
  const ctx = context({ headers: { authorization: 'Bearer ' } });
  supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: returnedError });
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 401, 'Unauthorized: Invalid token');
  expect(supabase.auth.getUser).toHaveBeenCalledWith('');
  expect(supabase.from).not.toHaveBeenCalled();
});
test('WB-AUT-12 non-string direct-call header is handled as an exception', async () => {
  const ctx = context({ headers: { authorization: 42 } });
  await authenticate(ctx.req, ctx.res, ctx.next);
  denied(ctx, 500, 'Internal server error during authentication');
  expect(console.error).toHaveBeenCalledWith('Auth middleware error:', expect.any(TypeError));
  expect(supabase.auth.getUser).not.toHaveBeenCalled();
});

