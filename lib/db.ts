import { createClient } from '@libsql/client';

function getClient() {
  const url = process.env.BB_TURSO_URL;
  if (!url) throw new Error('BB_TURSO_URL is not set');
  return createClient({ url, authToken: process.env.BB_TURSO_TOKEN });
}

let client: ReturnType<typeof createClient> | null = null;
function db() {
  if (!client) client = getClient();
  return client;
}

export async function initDb() {
  const c = db();
  await c.batch(
    [
      `CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_key TEXT NOT NULL UNIQUE,
        vote TEXT NOT NULL CHECK (vote IN ('boy','girl')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    ],
    'write'
  );
}

let initialized = false;
export async function getDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
  return db();
}
