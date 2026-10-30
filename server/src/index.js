import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createMemoryStore } from './store/memoryStore.js';
import { createMongoStore } from './store/mongoStore.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 5000;
const uri = process.env.MONGODB_URI?.trim();

const store = uri ? await createMongoStore(uri) : createMemoryStore();
if (!uri) console.warn('MONGODB_URI not set: using the in-memory store (data is lost on restart).');

createApp({ store, clientDir: path.resolve(here, '../../client/dist') })
  .listen(port, () => console.log(`Pathfinder API on :${port} (${store.kind} store)`));
