import { useEffect, useState } from 'react';
import Quiz from './components/Quiz.jsx';
import Result from './components/Result.jsx';
import { getPath } from './api.js';

const readId = () => window.location.hash.match(/^#\/p\/([a-f0-9]{10})$/)?.[1] ?? null;

export default function App() {
  const [id, setId] = useState(readId);
  const [data, setData] = useState(null);
  const [state, setState] = useState('idle'); // idle | loading | missing | error

  useEffect(() => {
    const onHash = () => { setId(readId()); setData(null); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!id || data?.id === id) return;
    let live = true;
    setState('loading');
    getPath(id)
      .then((d) => { if (live) { setData(d); setState('idle'); } })
      .catch((e) => { if (live) setState(e.status === 404 ? 'missing' : 'error'); });
    return () => { live = false; };
  }, [id, data]);

  const onCreated = (d) => { setData(d); window.location.hash = `#/p/${d.id}`; window.scrollTo(0, 0); };
  const restart = () => { window.location.hash = ''; setData(null); setState('idle'); };

  return (
    <>
      <header className="bar">
        <a className="brand" href="#/" onClick={restart}>BitElevate <span>Pathfinder</span></a>
        <a className="bar-link" href="https://www.cynbit.in/bitelevate">About the programme</a>
      </header>
      <main id="main">
        {!id && <Quiz onCreated={onCreated} />}
        {id && state === 'loading' && <p className="status" role="status">Loading your plan...</p>}
        {id && state === 'missing' && (
          <div className="status">
            <h1>We can't find that plan</h1>
            <p>The link may be mistyped. Answer the questions again to get a new one.</p>
            <button className="btn" onClick={restart}>Build a new plan</button>
          </div>
        )}
        {id && state === 'error' && (
          <div className="status" role="alert">
            <h1>The plan didn't load</h1>
            <p>The server did not respond. Reload the page to try again.</p>
          </div>
        )}
        {id && data && state === 'idle' && <Result data={data} onRestart={restart} />}
      </main>
    </>
  );
}
