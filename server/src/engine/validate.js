import { INTERESTS, LEVELS, GOALS, LANGUAGES } from './catalog.js';

const ids = (list) => new Set(list.map((x) => x.id));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

/** Returns { ok: true, value } or { ok: false, errors: { field: message } }. */
export function validateAnswers(body, today = todayIso()) {
  const errors = {};
  const b = body && typeof body === 'object' ? body : {};

  const level = String(b.level ?? '');
  if (!ids(LEVELS).has(level)) errors.level = 'Choose your current level.';

  const goal = String(b.goal ?? '');
  if (!ids(GOALS).has(goal)) errors.goal = 'Choose your main goal.';

  const pickMany = (key, list, msg) => {
    const raw = Array.isArray(b[key]) ? b[key] : [];
    const allowed = ids(list);
    const clean = [...new Set(raw.map(String))].filter((x) => allowed.has(x));
    if (clean.length === 0 || clean.length !== new Set(raw.map(String)).size) errors[key] = msg;
    return clean;
  };
  const interests = pickMany('interests', INTERESTS, 'Pick at least one interest.');
  const languages = pickMany('languages', LANGUAGES, 'Pick at least one language option.');

  const hoursPerDay = Number(b.hoursPerDay ?? 2);
  if (!(hoursPerDay >= 1 && hoursPerDay <= 4)) errors.hoursPerDay = 'Daily hours must be between 1 and 4.';

  const startDate = b.startDate ? String(b.startDate) : today;
  const yearMs = 365 * 86400000;
  if (!isIsoDate(startDate)) errors.startDate = 'Use a valid start date.';
  else if (Math.abs(Date.parse(`${startDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) > yearMs)
    errors.startDate = 'Start date must be within a year of today.';

  let examStart = null;
  if (b.examStart) {
    examStart = String(b.examStart);
    if (!isIsoDate(examStart)) errors.examStart = 'Use a valid exam date.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { level, goal, interests, languages, hoursPerDay, startDate, examStart } };
}

export function validateLead(body) {
  const errors = {};
  const b = body && typeof body === 'object' ? body : {};
  const name = String(b.name ?? '').trim();
  const email = String(b.email ?? '').trim().toLowerCase();
  const college = String(b.college ?? '').trim();
  if (!name || name.length > 80) errors.name = 'Enter your name (80 characters max).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.email = 'Enter a valid email address.';
  if (college.length > 120) errors.college = 'College name is too long.';
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, email, college } };
}
