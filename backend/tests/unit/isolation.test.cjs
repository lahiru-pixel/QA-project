test('HARNESS-01 SDK module is replaced by functions, with no real client', () => {
  const supabase = require('../../supabaseClient');
  expect(jest.isMockFunction(supabase.auth.getUser)).toBe(true);
  expect(jest.isMockFunction(supabase.from)).toBe(true);
});
test('HARNESS-02 fetch is denied before a network request', () => {
  expect(() => fetch('https://example.invalid')).toThrow('Unit tests prohibit network access');
});
test.each(['node:http', 'node:https'])('HARNESS-03 %s requests are denied', protocol => {
  expect(() => require(protocol).request('https://example.invalid')).toThrow('Unit tests prohibit network access');
});
test('HARNESS-04 direct TCP connections are denied', () => {
  const socket = new (require('node:net').Socket)();
  expect(() => socket.connect(1, '127.0.0.1')).toThrow('Unit tests prohibit network access');
  socket.destroy();
});

