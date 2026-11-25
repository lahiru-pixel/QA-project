const { World, setWorldConstructor, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const net = require('node:net');
const platform = require('./platform.cjs');
class TutorialWorld extends World {
  constructor(options) {
    super(options);
    this.fixture = platform.seed();
    this.initialCourses = structuredClone([...this.fixture.courses.values()]);
    this.requests = [];
    this.authorization = null;
  }
  async request(method, route, body) {
    const target = new URL(route, this.origin);
    assert.equal(target.origin, this.origin, 'Only the scenario server is allowed');
    const headers = { 'Content-Type': 'application/json' };
    if (this.authorization) headers.Authorization = this.authorization;
    const response = await fetch(target, { method, headers, body: body ? JSON.stringify(body) : undefined, redirect: 'error' });
    this.response = { status: response.status, body: await response.json() };
    // Never attach headers or identity markers.
    this.requests.push({ method, path: target.pathname, body: body || null, response: this.response });
  }
}
setWorldConstructor(TutorialWorld);
setDefaultTimeout(10000);
Before(async function () {
  this.server = platform.appFor(this.fixture).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { this.server.once('listening', resolve); this.server.once('error', reject); });
  const port = this.server.address().port;
  this.origin = 'http://127.0.0.1:' + port;
  this.originalFetch = global.fetch;
  this.originalConnect = net.Socket.prototype.connect;
  const origin = this.origin, originalFetch = this.originalFetch, originalConnect = this.originalConnect;
  global.fetch = (url, options) => {
    assert.equal(new URL(url).origin, origin, 'BDD blocks external fetch');
    return originalFetch(url, { ...options, redirect: 'error' });
  };
  net.Socket.prototype.connect = function (...args) {
    const first = Array.isArray(args[0]) ? args[0][0] : args[0];
    const options = typeof first === 'object' ? first : { port: first, host: typeof args[1] === 'string' ? args[1] : undefined };
    assert.equal(options.host || options.hostname, '127.0.0.1', 'BDD blocks non-loopback sockets');
    assert.equal(Number(options.port), port, 'BDD blocks non-scenario ports');
    return originalConnect.apply(this, args);
  };
  // A guard check occurs before any native transport can be invoked.
  assert.throws(() => global.fetch('https://example.invalid'), /BDD blocks external fetch/);
});
After(async function () {
  try {
    await this.attach(JSON.stringify({
      scope: 'Real Express routers and middleware; synthetic in-memory Supabase',
      requests: this.requests,
      coursesBefore: this.initialCourses,
      coursesAfter: [...this.fixture.courses.values()],
      repositoryQueries: this.fixture.audit,
    }, null, 2), 'application/json');
  } finally {
    if (this.originalFetch) global.fetch = this.originalFetch;
    if (this.originalConnect) net.Socket.prototype.connect = this.originalConnect;
    if (this.server) {
      this.server.closeAllConnections();
      await new Promise((resolve, reject) => this.server.close(error => error ? reject(error) : resolve()));
    }
    platform.clear();
  }
});

