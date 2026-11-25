const assert = require('node:assert/strict');
const { U, C, V, profile, enrollment } = require('../../helpers/fixtures.cjs');
const CREATED = '00000000-0000-4000-8000-000000000004';
const OTHER = '00000000-0000-4000-8000-000000000099';
const VIDEO_URL = 'https://youtu.be/abcdefghijk';
let activeFixture;
function seed() {
  return {
    user: profile(), enrollments: [enrollment()], audit: [], repositoryFailure: null,
    videos: new Map([[V, { id: V, course_id: C, title: 'QA synthetic lesson', description: 'Fixture only', youtube_url: VIDEO_URL }]]),
    courses: new Map([[C, { id: C, title: 'QA existing course', description: 'Synthetic fixture', is_published: false, created_at: '2026-01-01T00:00:00.000Z' }]]),
  };
}
const operations = { view: 'select', create: 'insert', edit: 'update', delete: 'delete' };
const mock = {
  auth: {
    async getUser(marker) {
      const f = activeFixture;
      assert(f, 'No active scenario');
      return marker === 'bdd-fixture-identity' && f.user
        ? { data: { user: { id: f.user.id } }, error: null }
        : { data: { user: null }, error: { message: 'QA invalid fixture identity' } };
    },
  },
  from(table) {
    assert(['profiles', 'videos', 'enrollments', 'courses'].includes(table), 'Unexpected table');
    const f = activeFixture;
    assert(f, 'No active scenario');
    f.audit.push({ table });
    const filters = {};
    let projection = '*', operation = 'select', payload, memo;
    const matches = row => Object.entries(filters).every(([key, value]) => row[key] === value);
    const project = row => projection === '*' ? { ...row } : Object.fromEntries(projection.split(',').map(s => s.trim()).map(key => [key, row[key]]));
    function execute(single) {
      if (memo) return memo;
      memo = Promise.resolve().then(() => {
        if (table === 'courses' && operations[f.repositoryFailure] === operation)
          return { data: null, error: { message: 'QA simulated repository failure' } };
        let rows;
        if (table === 'profiles') rows = f.user ? [f.user] : [];
        if (table === 'videos') rows = [...f.videos.values()];
        if (table === 'enrollments') rows = f.enrollments;
        if (table === 'courses') {
          if (operation === 'insert') {
            assert.equal(payload.length, 1);
            const row = { id: CREATED, created_at: '2026-01-02T00:00:00.000Z', ...payload[0] };
            f.courses.set(row.id, row); rows = [row];
          } else if (operation === 'update') {
            rows = [...f.courses.values()].filter(matches).map(row => ({ ...row, ...payload }));
            for (const row of rows) f.courses.set(row.id, row);
          } else if (operation === 'delete') {
            for (const row of [...f.courses.values()].filter(matches)) f.courses.delete(row.id);
            return { data: null, error: null };
          } else rows = [...f.courses.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
        }
        rows = rows.filter(matches).map(project);
        return single
          ? { data: rows[0] || null, error: rows.length ? null : { message: 'QA fixture row absent' } }
          : { data: rows, error: null };
      });
      return memo;
    }
    const q = {
      select(fields = '*') { projection = fields; return this; },
      eq(key, value) { filters[key] = value; return this; },
      order() { return this; },
      insert(value) { assert.equal(table, 'courses'); operation = 'insert'; payload = value; return this; },
      update(value) { assert.equal(table, 'courses'); operation = 'update'; payload = value; return this; },
      delete() { assert.equal(table, 'courses'); operation = 'delete'; return this; },
      single() { return execute(true); },
      then(resolve, reject) { return execute(false).then(resolve, reject); },
    };
    return q;
  },
};
// Same pre-import replacement approach as the existing black-box HTTP runner.
// Resolve never evaluates the real credential-reading module.
const clientPath = require.resolve('../../../supabaseClient');
assert(!require.cache[clientPath], 'BDD must start before the production SDK is imported');
require.cache[clientPath] = { id: clientPath, filename: clientPath, loaded: true, exports: mock };
const express = require('express');
const videoRouter = require('../../../routes/videos');
const adminRouter = require('../../../routes/admin');
function appFor(fixture) {
  activeFixture = fixture;
  const app = express();
  app.use(express.json());
  app.use('/api/videos', videoRouter);
  app.use('/api/admin', adminRouter);
  return app;
}
module.exports = { seed, appFor, clear: () => { activeFixture = undefined; }, U, C, V, CREATED, OTHER, VIDEO_URL };

