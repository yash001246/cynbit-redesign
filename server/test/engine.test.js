import test from 'node:test';
import assert from 'node:assert/strict';
import { recommend, addDays } from '../src/engine/recommend.js';
import { validateAnswers, validateLead } from '../src/engine/validate.js';

const base = { level: 'some', goal: 'job', interests: ['ui'], languages: ['js'], hoursPerDay: 2, startDate: '2026-11-02', examStart: null };

test('design-minded beginner is matched to a gentle lab', () => {
  const r = recommend({ ...base, level: 'beginner', interests: ['design', 'ui'], goal: 'portfolio' });
  assert.ok(['uiux', 'frontend'].includes(r.topLab));
});

test('AI + Python + experienced ranks the AI lab first', () => {
  const r = recommend({ ...base, level: 'solid', interests: ['ai', 'api'], languages: ['python'] });
  assert.equal(r.topLab, 'ai');
});

test('API + Python ranks the backend lab first', () => {
  const r = recommend({ ...base, interests: ['api', 'deploy'], languages: ['python'] });
  assert.equal(r.topLab, 'backend');
});

test('top match scores 100 and only top three get plans', () => {
  const r = recommend(base);
  assert.equal(r.matches[0].fit, 100);
  assert.equal(Object.keys(r.plans).length, 3);
  assert.equal(r.matches.length, 6);
});

test('plan covers 60 days with five contiguous phases', () => {
  const p = recommend(base).plans[recommend(base).topLab];
  assert.equal(p.phases.length, 5);
  assert.equal(p.phases[0].startDate, '2026-11-02');
  assert.equal(p.endDate, addDays('2026-11-02', 59));
  assert.equal(p.freeze, null);
});

test('exam freeze shifts later phases by 14 days', () => {
  const a = { ...base, examStart: '2026-11-22' }; // sprint day 21
  const p = recommend(a).plans[recommend(a).topLab];
  assert.equal(p.freeze.startDate, '2026-11-22');
  assert.equal(p.freeze.endDate, '2026-12-05');
  assert.equal(p.endDate, addDays('2026-11-02', 59 + 14));
  assert.equal(p.phases[0].endDate, '2026-11-08'); // before the freeze: unchanged
  assert.equal(p.phases[4].endDate, p.endDate);
});

test('exam date outside the sprint adds a note but no freeze', () => {
  const a = { ...base, examStart: '2027-06-01' };
  const p = recommend(a).plans[recommend(a).topLab];
  assert.equal(p.freeze, null);
  assert.equal(p.notes.length, 1);
});

test('level adds tips and stretch goals', () => {
  assert.ok(recommend({ ...base, level: 'beginner' }).plans.fullstack.phases[0].tip);
  assert.ok(recommend({ ...base, level: 'solid' }).plans.fullstack.phases[2].stretch);
});

test('validation accepts a good payload and fills defaults', () => {
  const v = validateAnswers({ level: 'some', goal: 'job', interests: ['ui'], languages: ['js'] }, '2026-11-02');
  assert.ok(v.ok);
  assert.equal(v.value.startDate, '2026-11-02');
  assert.equal(v.value.hoursPerDay, 2);
});

test('validation rejects bad input with field errors', () => {
  const v = validateAnswers({ level: 'wizard', goal: 'job', interests: [], languages: ['cobol'], hoursPerDay: 9, startDate: '2026-02-30' }, '2026-11-02');
  assert.equal(v.ok, false);
  for (const k of ['level', 'interests', 'languages', 'hoursPerDay', 'startDate']) assert.ok(v.errors[k], k);
});

test('lead validation normalises email and rejects junk', () => {
  assert.equal(validateLead({ name: ' Asha ', email: 'ASHA@Mail.com' }).value.email, 'asha@mail.com');
  assert.equal(validateLead({ name: '', email: 'nope' }).ok, false);
});
