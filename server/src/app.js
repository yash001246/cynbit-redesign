import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { INTERESTS, LEVELS, GOALS, LANGUAGES } from './engine/catalog.js';
import { validateAnswers, validateLead } from './engine/validate.js';
import { recommend } from './engine/recommend.js';

const ID_RE = /^[a-f0-9]{10}$/;
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function createApp({ store, clientDir } = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  const origins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(cors(origins?.length ? { origin: origins } : undefined));
  app.use(express.json({ limit: '10kb' }));

  const writeLimit = rateLimit({
    windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Too many requests. Try again in a minute.' },
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true, store: store.kind }));
  app.get('/api/options', (_req, res) =>
    res.json({ interests: INTERESTS, levels: LEVELS, goals: GOALS, languages: LANGUAGES }));

  app.post('/api/paths', writeLimit, wrap(async (req, res) => {
    const v = validateAnswers(req.body);
    if (!v.ok) return res.status(400).json({ error: 'Check your answers.', fields: v.errors });
    const row = await store.create({ answers: v.value, result: recommend(v.value) });
    res.status(201).json({ id: row.id, answers: row.answers, result: row.result });
  }));

  app.get('/api/paths/:id', wrap(async (req, res) => {
    if (!ID_RE.test(req.params.id)) return res.status(404).json({ error: 'Path not found.' });
    const row = await store.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Path not found.' });
    res.json({ id: row.id, answers: row.answers, result: row.result, saved: Boolean(row.lead) });
  }));

  app.post('/api/paths/:id/lead', writeLimit, wrap(async (req, res) => {
    if (!ID_RE.test(req.params.id)) return res.status(404).json({ error: 'Path not found.' });
    const v = validateLead(req.body);
    if (!v.ok) return res.status(400).json({ error: 'Check your details.', fields: v.errors });
    const row = await store.attachLead(req.params.id, v.value);
    if (!row) return res.status(404).json({ error: 'Path not found.' });
    res.json({ ok: true });
  }));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  if (clientDir && fs.existsSync(path.join(clientDir, 'index.html'))) {
    app.use(express.static(clientDir, { maxAge: '1h', index: false }));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
  });
  return app;
}
