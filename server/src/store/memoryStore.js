import { randomBytes } from 'node:crypto';

/** Dev/test store. Same interface as mongoStore. */
export function createMemoryStore() {
  const rows = new Map();
  return {
    kind: 'memory',
    async create({ answers, result }) {
      const id = randomBytes(5).toString('hex');
      rows.set(id, { id, answers, result, lead: null, createdAt: new Date().toISOString() });
      return rows.get(id);
    },
    async findById(id) { return rows.get(id) ?? null; },
    async attachLead(id, lead) {
      const row = rows.get(id);
      if (!row) return null;
      row.lead = { ...lead, createdAt: new Date().toISOString() };
      return row;
    },
  };
}
