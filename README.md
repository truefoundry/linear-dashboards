# Linear Productivity Dashboard

A developer productivity dashboard that connects to Linear via OAuth and visualises team velocity, project allocation, estimation efficiency, and per-developer throughput.

## Features

- **Team selector** — switch between any Linear team in your workspace
- **Timeline selector** — 2 / 4 / 6 / 8 / 12 week windows (defaults to 6)
- **Team velocity trend** — weekly bar (issue count) + line (story points)
- **Project allocation** — horizontal bar chart of issues and points per project
- **Efficiency trend** — estimated points delivered, issues completed, and % of issues carrying an estimate
- **Per-developer velocity** — multi-line chart switchable between story points and issue count, with a summary table

## Security

- OAuth read-only scope (`read`) — the app never asks for write access
- Access tokens are stored server-side in the JWT session cookie (HTTP-only, signed with `NEXTAUTH_SECRET`)
- All Linear API calls are made from Next.js API routes — the token is never exposed to the browser
- No credentials or personal data are persisted to any database

## Setup

### 1. Create a Linear OAuth application

1. Go to **Linear → Settings → API → OAuth applications → Create application**
2. Set the callback URL to `http://localhost:3000/api/auth/callback/linear`
3. Copy the **Client ID** and **Client Secret**

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
LINEAR_CLIENT_ID=<your client id>
LINEAR_CLIENT_SECRET=<your client secret>
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.

## Production deployment

For Vercel or any other host, set the four environment variables and update `NEXTAUTH_URL` to your production domain. The Linear OAuth callback URL must also be updated in your Linear app settings.
