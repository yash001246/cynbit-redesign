import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/store/memoryStore.js';

let server, url;
before(async () => {
  server = createApp({ store: createMemoryStore() }).listen(0);
  await new Promise((r) => server.once('listening', r));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (p, body) => fetch(url + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const good = { level: 'some', goal: 'job', interests: ['api', 'deploy'], languages: ['python'], hoursPerDay: 2, startDate: new Date().toISOString().slice(0, 10) };

test('health and options', async () => {
  assert.equal((await (await fetch(url + '/api/health')).json()).ok, true);
  const o = await (await fetch(url + '/api/options')).json();
  assert.equal(o.interests.length, 6);
});

test('create, fetch and attach a lead', async () => {
  const res = await post('/api/paths', good);
  assert.equal(res.status, 201);
  const { id, result } = await res.json();
  assert.match(id, /^[a-f0-9]{10}$/);
  assert.equal(result.topLab, 'backend');

  const got = await fetch(`${url}/api/paths/${id}`);
  assert.equal(got.status, 200);
  assert.equal((await got.json()).saved, false);

  const lead = await post(`/api/paths/${id}/lead`, { name: 'Asha', email: 'asha@example.com', college: 'SKIT' });
  assert.equal(lead.status, 200);
  assert.equal((await (await fetch(`${url}/api/paths/${id}`)).json()).saved, true);
});

test('bad input returns field errors', async () => {
  const res = await post('/api/paths', { ...good, interests: [] });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).fields.interests);
});

test('unknown and malformed ids are 404, bad lead is 400', async () => {
  assert.equal((await fetch(`${url}/api/paths/abcdef0123`)).status, 404);
  assert.equal((await fetch(`${url}/api/paths/../etc`)).status, 404);
  const { id } = await (await post('/api/paths', good)).json();
  assert.equal((await post(`/api/paths/${id}/lead`, { name: 'x', email: 'bad' })).status, 400);
});

test('malformed JSON is a 400, unknown api route a 404', async () => {
  const res = await fetch(url + '/api/paths', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
  assert.equal(res.status, 400);
  assert.equal((await fetch(url + '/api/nope')).status, 404);
});
