# Navigation Contract: Auth Route Guard

**Branch**: `001-google-oauth-auth` | **Date**: 2026-05-15

## Overview

This contract defines the routing behaviour enforced by the `@nuxtjs/supabase` redirect middleware. It is the authoritative reference for how auth state maps to navigation outcomes.

## Route Classification

| Route        | Auth Required | Description                    |
| ------------ | ------------- | ------------------------------ |
| `/`          | No            | Login page (public)            |
| `/confirm`   | No            | OAuth callback page (excluded) |
| `/dashboard` | Yes           | Dashboard (protected)          |
| All others   | Yes           | Protected by default           |

## Redirect Rules

| Trigger                                               | Outcome                                      |
| ----------------------------------------------------- | -------------------------------------------- |
| Unauthenticated user navigates to any protected route | Redirect to `/`                              |
| Authenticated user navigates to `/`                   | Redirect to `/dashboard`                     |
| Unauthenticated user navigates to `/confirm`          | No redirect (excluded from guard)            |
| OAuth callback lands on `/confirm` with `code` param  | Session exchanged → redirect to `/dashboard` |
| Session expires mid-session                           | Next navigation redirects to `/`             |

## Configuration (nuxt.config.ts)

```ts
supabase: {
  redirect: true,
  redirectOptions: {
    login: '/',
    callback: '/confirm',
    exclude: ['/confirm'],
  },
}
```

## Invariants

- No protected route content is rendered before auth state is confirmed.
- The `/confirm` route is never itself auth-protected (prevents redirect loop during OAuth callback).
- Authenticated users are always sent to `/dashboard` after login — never to the originally requested route (per spec FR-003).
