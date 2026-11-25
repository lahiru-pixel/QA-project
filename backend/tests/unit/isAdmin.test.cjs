const isAdmin = require('../../middleware/isAdmin');
const { context, denied, allowed, U } = require('../helpers/fixtures.cjs');
test.each([
  ['WB-ADM-01 missing user', undefined],
  ['WB-ADM-02 student', { id: U, role: 'student' }],
  ['WB-ADM-04 missing role', { id: U }],
  ['WB-ADM-05 wrong role casing', { id: U, role: 'Admin' }],
])('%s is denied', (name, user) => {
  const ctx = context({ user });
  isAdmin(ctx.req, ctx.res, ctx.next);
  denied(ctx, 403, 'Forbidden: Admin access required');
});
test('WB-ADM-03 admin proceeds without a response', () => {
  const ctx = context({ user: { id: U, role: 'admin' } });
  isAdmin(ctx.req, ctx.res, ctx.next);
  allowed(ctx);
});

