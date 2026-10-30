import { LABS, PHASES, INTERESTS, LANGUAGES, SPRINT_DAYS, FREEZE_DAYS } from './catalog.js';

const label = (list, id) => list.find((x) => x.id === id)?.label ?? id;
const DAY = 86400000;
const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`);

export const addDays = (iso, n) => new Date(toMs(iso) + n * DAY).toISOString().slice(0, 10);
export const diffDays = (a, b) => Math.round((toMs(a) - toMs(b)) / DAY);

export function scoreLab(lab, a) {
  let raw = 0;
  const reasons = [];
  for (const i of a.interests) {
    const w = lab.tags[i] ?? 0;
    raw += w * 2;
    if (w >= 2) reasons.push(`Strong overlap with "${label(INTERESTS, i).toLowerCase()}"`);
  }
  for (const l of a.languages) {
    const w = lab.langs[l] ?? 0;
    raw += w;
    if (w >= 2) reasons.push(`Builds on your ${label(LANGUAGES, l)}`);
  }
  raw += lab.goalFit[a.goal] ?? 0;
  if (a.level === 'beginner') {
    raw -= (lab.difficulty - 1) * 1.5;
    if (lab.difficulty === 1) reasons.push('Gentler ramp-up for newer developers');
  } else if (a.level === 'solid') {
    raw += (lab.difficulty - 1);
    if (lab.difficulty === 3) reasons.push('Stretches an experienced builder');
  }
  return { raw: Math.max(raw, 0), reasons };
}

export function buildPlan(lab, a) {
  const examIdx = a.examStart ? diffDays(a.examStart, a.startDate) : null;
  const freezeIdx = examIdx !== null && examIdx >= 0 && examIdx < SPRINT_DAYS ? examIdx : null;
  const dateOfDay = (n) => {
    const idx = n - 1;
    return addDays(a.startDate, idx + (freezeIdx !== null && idx >= freezeIdx ? FREEZE_DAYS : 0));
  };

  const phases = PHASES.map((p, i) => ({
    id: p.id, title: p.title, weeks: p.weeks, focus: p.focus,
    milestone: lab.milestones[i],
    startDay: p.days[0], endDay: p.days[1],
    startDate: dateOfDay(p.days[0]), endDate: dateOfDay(p.days[1]),
    tip: a.level === 'beginner' && i === 0
      ? 'Spend your first two sessions on Git and terminal basics before the sprint task.' : null,
    stretch: a.level === 'solid' ? p.stretch : null,
  }));

  const notes = [];
  if (a.hoursPerDay < 1.5) notes.push('The programme assumes about 1.5-2 hours a day. At your pace, plan to batch tasks on weekends.');
  if (a.examStart && freezeIdx === null) notes.push('Your exam date falls outside the 60-day sprint, so no pause is needed.');
  if (freezeIdx !== null) notes.push(`Your ${FREEZE_DAYS}-day exam freeze starts on ${addDays(a.startDate, freezeIdx)} and moves your finish date back.`);

  return {
    labId: lab.id, hoursPerDay: a.hoursPerDay, startDate: a.startDate,
    endDate: dateOfDay(SPRINT_DAYS), totalDays: SPRINT_DAYS,
    freeze: freezeIdx === null ? null : { startDate: addDays(a.startDate, freezeIdx), endDate: addDays(a.startDate, freezeIdx + FREEZE_DAYS - 1), startDay: freezeIdx + 1 },
    phases, notes,
  };
}

export function recommend(a) {
  const ranked = LABS.map((lab) => ({ lab, ...scoreLab(lab, a) }))
    .sort((x, y) => y.raw - x.raw || x.lab.difficulty - y.lab.difficulty || x.lab.id.localeCompare(y.lab.id));
  const best = ranked[0].raw || 1;
  const matches = ranked.map(({ lab, raw, reasons }) => ({
    id: lab.id, name: lab.name, project: lab.project, stack: lab.stack, blurb: lab.blurb,
    fit: Math.round((raw / best) * 100), reasons: reasons.slice(0, 3),
  }));
  const plans = {};
  for (const m of matches.slice(0, 3)) plans[m.id] = buildPlan(LABS.find((l) => l.id === m.id), a);
  return { matches, plans, topLab: matches[0].id };
}
