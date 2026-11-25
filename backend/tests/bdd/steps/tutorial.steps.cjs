const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const { profile, enrollment } = require('../../helpers/fixtures.cjs');
const { U, C, V, CREATED, OTHER, VIDEO_URL } = require('../support/platform.cjs');
Given('an isolated tutorial platform with an existing course and video', function () {
  assert.equal(this.fixture.courses.size, 1);
  assert(this.fixture.videos.has(V));
  assert.deepEqual(this.fixture.audit, []);
});
Given('I am a/an {string}', function (actor) {
  assert(['guest', 'student', 'admin', 'invalid identity'].includes(actor));
  this.fixture.user = actor === 'guest' ? null : { ...profile(), role: actor === 'admin' ? 'admin' : 'student' };
  this.authorization = actor === 'guest' ? null : actor === 'invalid identity' ? 'Bearer invalid-bdd-fixture' : 'Bearer bdd-fixture-identity';
});
Given('my payment status is {string}', function (status) {
  assert(['paid', 'unpaid'].includes(status)); assert(this.fixture.user);
  this.fixture.user.is_paid = status === 'paid';
});
Given("I am enrolled in the video's course", function () { this.fixture.enrollments = [enrollment()]; });
Given("my enrollment in the video's course is {string}", function (status) {
  assert(['present', 'absent'].includes(status));
  this.fixture.enrollments = status === 'present' ? [enrollment()] : [];
});
Given('the only enrollment belongs to {string}', function (owner) {
  assert(['another course', 'another student'].includes(owner));
  this.fixture.enrollments = [owner === 'another course'
    ? { student_id: U, course_id: OTHER } : { student_id: OTHER, course_id: C }];
});
When('I request the course video', async function () { await this.request('GET', '/api/videos/' + V + '/watch'); });
When('I request a video that does not exist', async function () { await this.request('GET', '/api/videos/' + OTHER + '/watch'); });
Then('the response status should be {int}', function (status) { assert.equal(this.response.status, status); });
Then('the response error should be {string}', function (message) { assert.deepEqual(this.response.body, { error: message }); });
Then('the private video link should not be disclosed', function () {
  assert(!Object.hasOwn(this.response.body, 'youtube_url'));
  assert(!JSON.stringify(this.response.body).includes(VIDEO_URL));
});
Then('I should receive only the permitted video details', function () {
  assert.deepEqual(this.response.body, { id: V, title: 'QA synthetic lesson', description: 'Fixture only', youtube_url: VIDEO_URL });
});
Given('the course repository will fail the {string} operation', function (operation) {
  assert(['view', 'create', 'edit', 'delete'].includes(operation));
  this.fixture.repositoryFailure = operation;
});
When('I attempt to {string} a course', async function (operation) {
  assert(['view', 'create', 'edit', 'delete'].includes(operation));
  const collection = '/api/admin/courses', item = collection + '/' + C;
  if (operation === 'view') await this.request('GET', collection);
  if (operation === 'create') await this.request('POST', collection, { title: 'QA created course', description: 'Fixture only', is_published: false });
  if (operation === 'edit') await this.request('PUT', item, { title: 'QA updated course' });
  if (operation === 'delete') await this.request('DELETE', item);
});
Then('the management catalogue should include the existing unpublished course', function () {
  assert.deepEqual(this.response.body, this.initialCourses);
  assert.equal(this.response.body[0].is_published, false);
});
Then('the created course should be returned and saved in the isolated catalogue', function () {
  assert.equal(this.fixture.courses.size, 2);
  assert.deepEqual(this.response.body, {
    id: CREATED, created_at: '2026-01-02T00:00:00.000Z', title: 'QA created course',
    description: 'Fixture only', is_published: false,
  });
  assert.deepEqual(this.fixture.courses.get(CREATED), this.response.body);
  assert.deepEqual(this.fixture.courses.get(C), this.initialCourses[0]);
});
Then('the existing course should have the requested title', function () {
  const expected = { ...this.initialCourses[0], title: 'QA updated course' };
  assert.equal(this.fixture.courses.size, 1);
  assert.deepEqual(this.response.body, expected);
  assert.deepEqual(this.fixture.courses.get(C), expected);
});
Then('the existing course should be removed from the isolated catalogue', function () {
  assert.deepEqual(this.response.body, { success: true });
  assert.equal(this.fixture.courses.size, 0);
});
Then('the course catalogue should match its initial state', function () {
  assert.deepEqual([...this.fixture.courses.values()], this.initialCourses);
});
Then('no course management query should reach the repository', function () {
  assert.equal(this.fixture.audit.filter(query => query.table === 'courses').length, 0);
});

