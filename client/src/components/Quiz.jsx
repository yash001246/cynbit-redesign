import { useEffect, useState } from 'react';
import { getOptions, createPath } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

function Choice({ legend, hint, error, children }) {
  return (
    <fieldset className={error ? 'q has-error' : 'q'}>
      <legend>{legend}</legend>
      {hint && <p className="hint">{hint}</p>}
      <div className="chips">{children}</div>
      {error && <p className="err" role="alert">{error}</p>}
    </fieldset>
  );
}

const Chip = ({ on, onClick, children, radio }) => (
  <button type="button" className={on ? 'chip on' : 'chip'} role={radio ? 'radio' : undefined}
    aria-checked={radio ? on : undefined} aria-pressed={radio ? undefined : on} onClick={onClick}>
    {children}
  </button>
);

export default function Quiz({ onCreated }) {
  const [opts, setOpts] = useState(null);
  const [loadErr, setLoadErr] = useState('');
  const [a, setA] = useState({ level: '', goal: '', interests: [], languages: [], hoursPerDay: 2, startDate: today(), examStart: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [fields, setFields] = useState({});

  useEffect(() => { getOptions().then(setOpts).catch((e) => setLoadErr(e.message)); }, []);

  const toggle = (key, id) => setA((s) => ({
    ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id],
  }));
  const ready = a.level && a.goal && a.interests.length && a.languages.length;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setFields({});
    try {
      onCreated(await createPath({ ...a, examStart: a.examStart || undefined }));
    } catch (ex) {
      setErr(ex.message); setFields(ex.fields || {});
    } finally { setBusy(false); }
  };

  if (loadErr) return <p className="status" role="alert">{loadErr}</p>;
  if (!opts) return <p className="status" role="status">Loading questions...</p>;

  return (
    <form className="quiz" onSubmit={submit} noValidate>
      <div className="intro">
        <h1>Get a 60-day plan built around your exam calendar</h1>
        <p>Six quick questions. You get a ranked lab match and a dated roadmap you can share with your mentor or your college.</p>
      </div>

      <Choice legend="Where are you today?" error={fields.level}>
        {opts.levels.map((o) => <Chip radio key={o.id} on={a.level === o.id} onClick={() => setA({ ...a, level: o.id })}>{o.label}</Chip>)}
      </Choice>
      <Choice legend="What do you want to build?" hint="Pick everything that appeals." error={fields.interests}>
        {opts.interests.map((o) => <Chip key={o.id} on={a.interests.includes(o.id)} onClick={() => toggle('interests', o.id)}>{o.label}</Chip>)}
      </Choice>
      <Choice legend="What do you already code in?" error={fields.languages}>
        {opts.languages.map((o) => <Chip key={o.id} on={a.languages.includes(o.id)} onClick={() => toggle('languages', o.id)}>{o.label}</Chip>)}
      </Choice>
      <Choice legend="What do you need from this?" error={fields.goal}>
        {opts.goals.map((o) => <Chip radio key={o.id} on={a.goal === o.id} onClick={() => setA({ ...a, goal: o.id })}>{o.label}</Chip>)}
      </Choice>

      <div className="row">
        <label>Hours per day
          <select value={a.hoursPerDay} onChange={(e) => setA({ ...a, hoursPerDay: Number(e.target.value) })}>
            {[1, 1.5, 2, 3, 4].map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          {fields.hoursPerDay && <span className="err">{fields.hoursPerDay}</span>}
        </label>
        <label>Start date
          <input type="date" value={a.startDate} onChange={(e) => setA({ ...a, startDate: e.target.value })} />
          {fields.startDate && <span className="err">{fields.startDate}</span>}
        </label>
        <label>First exam day <small>(optional)</small>
          <input type="date" value={a.examStart} min={a.startDate} onChange={(e) => setA({ ...a, examStart: e.target.value })} />
          {fields.examStart && <span className="err">{fields.examStart}</span>}
        </label>
      </div>

      {err && <p className="err banner" role="alert">{err}</p>}
      <button className="btn" disabled={!ready || busy}>{busy ? 'Building your plan...' : 'Build my plan'}</button>
      {!ready && <p className="hint">Answer the first four questions to continue.</p>}
    </form>
  );
}
