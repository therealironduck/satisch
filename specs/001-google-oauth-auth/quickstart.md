# Quickstart: Google OAuth Authentication

**Branch**: `001-google-oauth-auth` | **Date**: 2026-05-15

## Prerequisites

- Supabase project with Google OAuth provider already configured (done — confirmed by user)
- Node.js + Bun installed

## Environment Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:

   ```
   SUPABASE_URL=https://<your-project-ref>.supabase.co
   SUPABASE_KEY=<your-anon-public-key>
   ```

   Find these in your Supabase dashboard under **Project Settings → API**.

3. In the Supabase dashboard, ensure the OAuth redirect URL is allowlisted:
   - **Authentication → URL Configuration → Redirect URLs**
   - Add: `http://localhost:3000/confirm` (for local dev)
   - Add your production URL's `/confirm` route when deploying

## Run the Dev Server

```bash
bun run dev
```

Navigate to `http://localhost:3000` — you should see the login screen.

## Test the Auth Flow

1. Click **Continue with Google**
2. Complete Google's auth flow
3. You are redirected to `http://localhost:3000/confirm`, then to `/dashboard`
4. Refresh the page — you remain authenticated

## Session Lifetime

Sessions last 7 days, configured in Supabase dashboard under **Authentication → Settings → JWT Expiry**. The Supabase JS client auto-refreshes tokens in the background.

## Verify Type-Checking and Lint

```bash
bun run typecheck
bun run lint
```

Both must pass before the feature is considered complete.
