const U = '00000000-0000-4000-8000-000000000003';
const C = '00000000-0000-4000-8000-000000000002';
const V = '00000000-0000-4000-8000-000000000001';
const profile = () => ({ id: U, role: 'student', is_paid: true });
const enrollment = () => ({ student_id: U, course_id: C });
const returnedError = { message: 'QA synthetic returned error' };
function context(overrides = {}) {
  const req = { headers: { authorization: 'Bearer qa-fixture-marker' },
    params: { courseId: C }, baseUrl: '/api/courses', ...overrides };
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return { req, res, next: jest.fn() };
}
function query(result, rejection) {
  const q = {};
  for (const method of ['select', 'eq', 'order']) q[method] = jest.fn().mockReturnValue(q);
  const settle = () => rejection ? Promise.reject(rejection) : Promise.resolve(result);
  q.single = jest.fn(settle);
  q.then = (resolve, reject) => settle().then(resolve, reject);
  return q;
}
function denied(ctx, status, error) {
  expect(ctx.res.status).toHaveBeenCalledTimes(1);
  expect(ctx.res.status).toHaveBeenCalledWith(status);
  expect(ctx.res.json).toHaveBeenCalledTimes(1);
  expect(ctx.res.json).toHaveBeenCalledWith({ error });
  expect(ctx.next).not.toHaveBeenCalled();
}
function allowed(ctx) {
  expect(ctx.next).toHaveBeenCalledTimes(1);
  expect(ctx.next).toHaveBeenCalledWith();
  expect(ctx.res.status).not.toHaveBeenCalled();
  expect(ctx.res.json).not.toHaveBeenCalled();
}
module.exports = { U, C, V, profile, enrollment, returnedError, context, query, denied, allowed };

