# IIIT Work — AI Synergy Command Center

A responsive shared workspace for Satyam, Anvi, Yashi, and Riddima to track hackathon tasks, phase progress, team workload, decisions, and evidence links.

## Features

- Dashboard with overall completion, active work, review queue, and recent activity
- Shared task board with owner/status filters, search, due dates, phase, and evidence links
- Eight-stage hackathon roadmap with editable phase statuses
- Team workload view for all four members
- Decision/evidence/assumption/open-question log
- Responsive dark UI for desktop and mobile
- Vercel serverless API with Neon Serverless Postgres JSONB persistence
- Local browser preview fallback if the database is not configured

## Deploy to Vercel

1. Import `sharnasatyam6-droid/IIIT_work` into Vercel.
2. Add a Neon Postgres database to your Vercel project, or create a Neon database and copy its connection string.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL`: Neon Postgres connection string (required for shared, cross-device data)
   - `TEAM_ACCESS_CODE`: optional private code required for writes. Choose a non-trivial value and share it only with the four team members.
4. Redeploy after adding variables.

The API accepts `DATABASE_URL`, `POSTGRES_URL`, or `NEON_DATABASE_URL`. On first API request it creates the `iiit_work_workspace` table and inserts the starter tasks. No manual SQL migration is required.

## Local development

Install Node.js, then run:

```bash
npm install
npx vercel dev
```

Set environment variables locally in a `.env.local` file. Do not commit database URLs or access codes.

## Important behavior

- If the database environment variable is missing, the UI switches to local preview mode and saves in that browser only. It is not shared between teammates until Neon is connected.
- If `TEAM_ACCESS_CODE` is configured, read access is available to people with the URL; writes require the code. This is a lightweight team gate, not individual-account authentication.
- The starter task ownership is only a suggested split. Edit tasks to match the team's actual agreement.
- The activity feed and decision log record workspace actions; maintain genuine AI interaction logs separately and do not fabricate transcripts.

## Stack

Vanilla HTML/CSS/JavaScript · Vercel Node.js Function · Neon Serverless Postgres
