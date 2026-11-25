// Register before any production module import. Never load the real SDK client.
jest.mock('../supabaseClient', () => ({
  auth: { getUser: jest.fn() },
  from: jest.fn(),
}));
const supabase = require('../supabaseClient');

beforeEach(() => {
  jest.resetAllMocks();
  supabase.from.mockImplementation(() => { throw new Error('Unexpected mocked database query'); });
  supabase.auth.getUser.mockImplementation(() => { throw new Error('Unexpected mocked authentication'); });
  const deny = () => { throw new Error('Unit tests prohibit network access'); };
  jest.spyOn(global, 'fetch').mockImplementation(deny);
  jest.spyOn(require('node:http'), 'request').mockImplementation(deny);
  jest.spyOn(require('node:http'), 'get').mockImplementation(deny);
  jest.spyOn(require('node:https'), 'request').mockImplementation(deny);
  jest.spyOn(require('node:https'), 'get').mockImplementation(deny);
  jest.spyOn(require('node:net').Socket.prototype, 'connect').mockImplementation(deny);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

