# Data Model: Google OAuth Authentication

**Branch**: `001-google-oauth-auth` | **Date**: 2026-05-15

## Entities

### User (platform-managed)

Managed entirely by Supabase Auth. No custom migration required.

| Field        | Type      | Source        | Notes                                   |
| ------------ | --------- | ------------- | --------------------------------------- |
| `id`         | UUID      | Supabase Auth | Primary key, auto-generated             |
| `email`      | string    | Google OAuth  | Provided by Google on first sign-in     |
| `name`       | string    | Google OAuth  | User's display name from Google profile |
| `avatar_url` | string    | Google OAuth  | Profile photo URL from Google           |
| `created_at` | timestamp | Supabase Auth | Account creation time                   |

Accessible in the app via `useSupabaseUser()`. Fields are available on the `user.user_metadata` object.

### Session (platform-managed)

Managed entirely by Supabase Auth. No custom migration required.

| Field           | Type      | Source        | Notes                                                  |
| --------------- | --------- | ------------- | ------------------------------------------------------ |
| `access_token`  | JWT       | Supabase Auth | Short-lived (1 hour default), auto-refreshed           |
| `refresh_token` | string    | Supabase Auth | Used to renew the access token within the 7-day window |
| `expires_at`    | timestamp | Supabase Auth | Access token expiry                                    |

Accessible via `useSupabaseSession()`. Stored in browser `localStorage` by the Supabase JS client.

## Migrations

**None required.** This feature uses only Supabase Auth's built-in `auth.users` and `auth.sessions` tables. No application-level schema changes are needed.

## State Transitions

```
[Unauthenticated]
       │
       │  signInWithOAuth({ provider: 'google' })
       ▼
[Redirected to Google]
       │
       │  User approves → Supabase callback
       ▼
[OAuth Code Received at /confirm]
       │
       │  exchangeCodeForSession (auto, via @nuxtjs/supabase plugin)
       ▼
[Authenticated] ──── refresh_token still valid ────▶ [Authenticated]
       │
       │  session expires (7 days) OR user clears storage
       ▼
[Unauthenticated]
```
