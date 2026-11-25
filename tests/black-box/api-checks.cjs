// Run from repository root: node tests/black-box/api-checks.cjs
// Real Express routes/middleware; in-memory Supabase dependency, never a database.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const backendRequire = createRequire(path.join(root, 'backend/package.json'));
const express = backendRequire('express');
const videoId = '00000000-0000-4000-8000-000000000001';
const courseId = '00000000-0000-4000-8000-000000000002';
const userId = '00000000-0000-4000-8000-000000000003';
let fixture = {};
const mock = {
  auth: { getUser: async token => token === 'fixture-identity'
    ? { data: { user: { id: userId } }, error: null }
    : { data: { user: null }, error: { message: 'Synthetic invalid identity' } } },
  from(table) {
    if (!['profiles', 'videos', 'enrollments'].includes(table)) throw new Error('Unexpected mock table');
    const filters = {}; let projection = '*';
    return {
      select(fields) { projection = fields; return this; },
      eq(key, value) { filters[key] = value; return this; },
      async single() {
        let data = null;
        if (table === 'profiles' && !fixture.missingProfile && filters.id === userId)
          data = { id: userId, role: fixture.role, is_paid: fixture.paid };
        if (table === 'videos' && filters.id === videoId)
          data = { id: videoId, course_id: courseId, title: 'QA synthetic lesson', description: 'Fixture only', youtube_url: 'https://youtu.be/abcdefghijk' };
        if (table === 'enrollments' && fixture.enrolled && filters.student_id === userId && filters.course_id === courseId)
          data = { student_id: userId, course_id: courseId };
        if (data && projection !== '*') data = Object.fromEntries(projection.split(',').map(x => x.trim()).map(k => [k, data[k]]));
        return { data, error: data ? null : { message: 'Synthetic missing record' } };
      }
    };
  }
};
// Resolve the filename without executing the credential-reading production module.
const clientPath = backendRequire.resolve('./supabaseClient.js');
require.cache[clientPath] = { id: clientPath, filename: clientPath, loaded: true, exports: mock };
const app = express();
app.use(express.json());
app.use('/api/videos', backendRequire('./routes/videos.js'));
const definitions = [
  { id: 'DT-01', authenticated: false, role: null, paid: null, enrolled: null, header: null, expectedStatus: 401, expectedError: 'Missing or invalid authorization header' },
];
let index = 2;
for (const role of ['student', 'admin']) for (const paid of [false, true]) for (const enrolled of [false, true]) {
  const allowed = role === 'admin' || (paid && enrolled);
  definitions.push({ id: `DT-${String(index++).padStart(2, '0')}`, authenticated: true, role, paid, enrolled,
    header: 'fixture', expectedStatus: allowed ? 200 : 403,
    expectedError: allowed ? null : !paid ? 'Forbidden: User has not paid' : 'Forbidden: Not enrolled in this course' });
}
definitions.push(
  { id: 'EP-AUTH-01', role: 'student', paid: true, enrolled: true, header: 'basic', expectedStatus: 401, expectedError: 'Missing or invalid authorization header' },
  { id: 'EP-AUTH-02', role: 'student', paid: true, enrolled: true, header: 'invalid', expectedStatus: 401, expectedError: 'Unauthorized: Invalid token' },
  { id: 'EP-AUTH-03', role: 'student', paid: true, enrolled: true, header: 'fixture', missingProfile: true, expectedStatus: 401, expectedError: 'Profile not found' },
  { id: 'EDGE-01', role: 'student', paid: true, enrolled: true, header: 'fixture', missingVideo: true, expectedStatus: 404, expectedError: 'Video not found' },
  { id: 'EDGE-02', role: 'student', paid: false, enrolled: true, header: 'fixture', missingVideo: true, expectedStatus: 403, expectedError: 'Forbidden: User has not paid' }
);
const server = app.listen(0, '127.0.0.1', async () => {
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const originalFetch = global.fetch;
    global.fetch = (url, options) => {
      if (new URL(url).origin !== origin) throw new Error('Non-test network target rejected');
      return originalFetch(url, { ...options, redirect: 'error' });
    };
    const results = [];
    for (const test of definitions) {
      fixture = test;
      const headers = {};
      if (test.header) headers.Authorization = test.header === 'fixture' ? 'Bearer fixture-identity' : test.header === 'basic' ? 'Basic synthetic' : 'Bearer invalid-fixture';
      const endpoint = `/api/videos/${test.missingVideo ? '00000000-0000-4000-8000-000000000099' : videoId}/watch`;
      const response = await fetch(origin + endpoint, { headers });
      const actualBody = await response.json();
      const urlPresent = Object.hasOwn(actualBody, 'youtube_url');
      const expectedAllowed = test.expectedStatus === 200;
      const pass = response.status === test.expectedStatus && urlPresent === expectedAllowed &&
        (expectedAllowed ? actualBody.id === videoId && actualBody.youtube_url === 'https://youtu.be/abcdefghijk' &&
          Object.keys(actualBody).sort().join(',') === 'description,id,title,youtube_url' : actualBody.error === test.expectedError);
      results.push({ id: test.id, conditions: { authenticated: test.authenticated ?? (test.header === 'fixture'), role: test.role, paid: test.paid, enrolled: test.enrolled, missingProfile: !!test.missingProfile, missingVideo: !!test.missingVideo }, method: 'GET', endpoint,
        expected: { status: test.expectedStatus, error: test.expectedError, urlPresent: expectedAllowed }, actual: { status: response.status, body: actualBody, urlPresent }, status: pass ? 'Pass' : 'Fail' });
    }
    const sourceFiles = ['backend/routes/videos.js', 'backend/middleware/authenticate.js', 'backend/middleware/isEnrolled.js'];
    const evidence = { executedAt: new Date().toISOString(), node: process.version, scope: 'Real Express HTTP route and middleware with in-memory Supabase; not real auth, database, or RLS', sourceHashes: Object.fromEntries(sourceFiles.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')])), results };
    const output = path.join(root, 'testing-docs/evidence/black-box/api-results.json');
    if (fs.existsSync(output)) throw new Error('Evidence exists; archive it before a new run');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ evidence: path.relative(root, output), executed: results.length, passed: results.filter(r => r.status === 'Pass').length, failed: results.filter(r => r.status === 'Fail').length }));
    process.exitCode = results.some(r => r.status !== 'Pass') ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { server.close(); }
});
