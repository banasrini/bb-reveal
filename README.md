# Baby Reveal Poll

A playful gender reveal voting app for Baby Ng. Visitors vote Team Boy 🌿 or Team Girl 🪸, watch an arc-jump animation, and leave messages for the parents.

---

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Turso credentials (see below)
npm run dev
```

Open http://localhost:3000.

---

## Turso database setup

1. Install the Turso CLI and log in:
   ```bash
   brew install tursodatabase/tap/turso
   turso auth login
   ```

2. Create a database:
   ```bash
   turso db create bb-reveal
   ```

3. Get the URL and a token:
   ```bash
   turso db show bb-reveal --url
   turso db tokens create bb-reveal
   ```

4. The schema is created automatically on first request (via `CREATE TABLE IF NOT EXISTS`). No manual migration needed.

---

## Setting env vars on Vercel

In your Vercel project → Settings → Environment Variables, add:

| Name | Value |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | your token |

---

## Swapping parent images

Replace these two files in `/public`:

- `dad.jpg` — solo photo of Allan (circular crop, face centered)
- `mom.jpg` — solo photo of Sanjana

> **Note:** The current `dad.jpg` is a couples photo. For the best look, replace it with a solo photo of Allan so the circular crop shows just his face.

---

## Customizing names / last name

Edit `lib/config.ts`:

```ts
export const BABY_LAST_NAME = 'Ng'; // ← change this
export const DAD_NAME = 'Allan';
export const MOM_NAME = 'Sanjana';
```

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Or push to GitHub and import the repo on vercel.com.
