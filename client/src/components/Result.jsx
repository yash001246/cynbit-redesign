import { useMemo, useState } from 'react';
import { saveLead } from '../api.js';

const fmt = (iso, withYear) => new Date(`${iso}T00:00:00Z`)
  .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: withYear ? 'numeric' : undefined, timeZone: 'UTC' });

function dayCells(plan) {
  const cells = [];
  const end = Date.parse(`${plan.endDate}T00:00:00Z`);
  for (let t = Date.parse(`${plan.startDate}T00:00:00Z`); t <= end; t += 86400000) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const frozen = plan.freeze && iso >= plan.freeze.startDate && iso <= plan.freeze.endDate;
    const phase = plan.phases.find((p) => iso >= p.startDate && iso <= p.endDate);
    cells.push({ iso, frozen, phase: phase?.id ?? 5 });
  }
  return cells;
}

function Calendar({ plan }) {
  const cells = useMemo(() => dayCells(plan), [plan]);
  return (
    <figure className="cal">
      <div className="cal-grid" role="img"
        aria-label={`${plan.totalDays} sprint days from ${fmt(plan.startDate)} to ${fmt(plan.endDate)}${plan.freeze ? `, with an exam freeze from ${fmt(plan.freeze.startDate)} to ${fmt(plan.freeze.endDate)}` : ''}`}>
        {cells.map((c) => (
          <i key={c.iso} className={c.frozen ? 'cell freeze' : `cell p${c.phase}`} title={`${fmt(c.iso)}${c.frozen ? ' (exam freeze)' : ''}`} />
        ))}
      </div>
      <figcaption>
        {plan.phases.map((p) => <span key={p.id} className="key"><i className={`cell p${p.id}`} />{p.title}</span>)}
        {plan.freeze && <span className="key"><i className="cell freeze" />Exam freeze</span>}
      </figcaption>
    </figure>
  );
}

function LeadForm({ id, saved }) {
  const [f, setF] = useState({ name: '', email: '', college: '' });
  const [state, setState] = useState(saved ? 'done' : 'idle');
  const [fields, setFields] = useState({});
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setState('busy'); setErr(''); setFields({});
    try { await saveLead(id, f); setState('done'); }
    catch (ex) { setErr(ex.message); setFields(ex.fields || {}); setState('idle'); }
  };

  if (state === 'done') return <p className="ok" role="status">Saved. The BitElevate team can now follow up with this plan in hand.</p>;
  return (
    <form className="lead" onSubmit={submit} noValidate>
      <h3>Send this plan to the BitElevate team</h3>
      <label>Name<input value={f.name} autoComplete="name" onChange={(e) => setF({ ...f, name: e.target.value })} />{fields.name && <span className="err">{fields.name}</span>}</label>
      <label>Email<input type="email" value={f.email} autoComplete="email" onChange={(e) => setF({ ...f, email: e.target.value })} />{fields.email && <span className="err">{fields.email}</span>}</label>
      <label>College <small>(optional)</small><input value={f.college} onChange={(e) => setF({ ...f, college: e.target.value })} /></label>
      {err && <p className="err banner" role="alert">{err}</p>}
      <button className="btn" disabled={state === 'busy'}>{state === 'busy' ? 'Sending...' : 'Send my plan'}</button>
    </form>
  );
}

export default function Result({ data, onRestart }) {
  const { id, result, saved } = data;
  const top3 = result.matches.slice(0, 3);
  const [sel, setSel] = useState(result.topLab);
  const [copied, setCopied] = useState(false);
  const lab = result.matches.find((m) => m.id === sel);
  const plan = result.plans[sel];

  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt('Copy this link', window.location.href); }
  };

  return (
    <div className="result">
      <section className="hero">
        <h1>{lab.name}</h1>
        <p className="finish">Start {fmt(plan.startDate, true)}. Finish <strong>{fmt(plan.endDate, true)}</strong>{plan.freeze ? ' (after your exam freeze)' : ''}.</p>
        <p>{lab.blurb} You will work on <strong>{lab.project}</strong>, {plan.hoursPerDay} hours a day.</p>
        <div className="tabs" role="tablist" aria-label="Your best-fit labs">
          {top3.map((m) => (
            <button key={m.id} role="tab" aria-selected={sel === m.id} className={sel === m.id ? 'tab on' : 'tab'} onClick={() => setSel(m.id)}>
              {m.name}<span>{m.fit}% fit</span>
            </button>
          ))}
        </div>
      </section>

      <Calendar plan={plan} />
      {plan.notes.map((n) => <p key={n} className="note">{n}</p>)}

      <ol className="phases">
        {plan.phases.map((p) => (
          <li key={p.id} className={`ph p${p.id}`}>
            <div className="when"><strong>{fmt(p.startDate)} to {fmt(p.endDate)}</strong><span>{p.weeks}</span></div>
            <div>
              <h2>{p.title}</h2>
              <p>{p.milestone}</p>
              <p className="focus">Focus: {p.focus}</p>
              {p.tip && <p className="tip">{p.tip}</p>}
              {p.stretch && <p className="tip">Stretch goal: {p.stretch}</p>}
            </div>
          </li>
        ))}
      </ol>

      <section className="why">
        <h2>Why this lab</h2>
        {lab.reasons.length ? <ul>{lab.reasons.map((r) => <li key={r}>{r}</li>)}</ul> : <p>It is the closest overall match to your answers.</p>}
        <p className="hint">Fit is relative: your best match scores 100%.</p>
        <details>
          <summary>See all six labs ranked</summary>
          <ul className="bars">
            {result.matches.map((m) => (
              <li key={m.id}><span>{m.name}</span><b style={{ '--w': `${m.fit}%` }} aria-label={`${m.fit}% fit`} /><em>{m.fit}%</em></li>
            ))}
          </ul>
        </details>
      </section>

      <section className="actions">
        <a className="btn" href={`https://www.cynbit.in/bitelevate?lab=${sel}`}>Enrol in this lab</a>
        <button className="btn ghost" onClick={copy}>{copied ? 'Link copied' : 'Copy link to this plan'}</button>
        <button className="btn ghost" onClick={onRestart}>Start over</button>
      </section>

      <LeadForm id={id} saved={saved} />
    </div>
  );
}
