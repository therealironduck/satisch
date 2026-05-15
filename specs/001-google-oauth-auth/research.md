# Research: Google OAuth Authentication

**Branch**: `001-google-oauth-auth` | **Date**: 2026-05-15

## Decision Log

### 1. Auth Module Strategy

**Decision**: Use `@nuxtjs/supabase` built-in redirect middleware — do not write a custom global middleware.

**Rationale**: The module (v2.0.8) is already installed and provides `redirect: true` + `redirectOptions` in `nuxt.config.ts`. This handles unauthenticated redirect to the login page and authenticated redirect away from login automatically. A custom middleware would duplicate this logic and create a maintenance surface.

**Alternatives considered**:

- Custom `app/middleware/auth.global.ts` — rejected; redundant when the module provides first-class redirect support.
- Nuxt `routeRules` with server-side guards — rejected; incompatible with `ssr: false`.

---

### 2. OAuth Callback Handling (PKCE Flow)

**Decision**: Add an `app/pages/confirm.vue` page. In SPA mode, `@nuxtjs/supabase` v2 uses Supabase Auth v2's PKCE flow by default. The module's client-side plugin detects the `code` query parameter on the callback URL and calls `exchangeCodeForSession` automatically. The `confirm.vue` page only needs to show a loading state during this exchange; no manual SDK call is required in the page itself.

**Rationale**: Supabase PKCE flow requires the OAuth callback to land on a page where the Supabase JS client can run. In SPA mode this is the `confirm.vue` page. The module's plugin handles the code exchange, then the redirect middleware takes over and sends the user to `/dashboard`.

**Alternatives considered**:

- Manual `exchangeCodeForSession` in `confirm.vue` — viable fallback if the auto-exchange does not fire; can be added during implementation if needed.
- Using implicit flow (hash-based token) — deprecated by Supabase; rejected.

---

### 3. Route Protection Scope

**Decision**: Configure `redirectOptions.login = '/'` and `redirectOptions.callback = '/confirm'`. Add `redirectOptions.exclude = ['/confirm']` so the callback page is not itself protected (it runs before the session exists).

**Rationale**: The `exclude` list prevents an infinite redirect loop where an unauthenticated user arriving at `/confirm` (mid-OAuth flow) gets redirected back to `/`. The login page at `/` is the exception handled by the module automatically (authenticated users visiting `/` are sent to the callback/default route).

**Alternatives considered**:

- Excluding only `/` — insufficient; `/confirm` must also be excluded.

---

### 4. Prerendered Index Route Compatibility

**Decision**: The prerendered `/` route (login page) is fully compatible with client-side auth middleware. The prerendered HTML is the login UI. On hydration, the module's middleware checks auth state and redirects authenticated users to `/dashboard`.

**Rationale**: `ssr: false` means prerendering produces a static HTML shell only. JavaScript runs on the client. The auth check is a client-side operation and does not conflict with the prerendered HTML.

**Alternatives considered**:

- Removing prerender for `/` — unnecessary; prerender improves initial load time for unauthenticated visitors and is safe to keep.

---

### 5. Session Lifetime

**Decision**: Session lifetime (7 days) is a Supabase Auth project setting configured in the Supabase dashboard (`Authentication → Settings → JWT Expiry`), not in application code. The `@nuxtjs/supabase` module auto-refreshes sessions using Supabase's `persistSession: true` default. No code change is needed.

**Rationale**: Centralising the session lifetime in Supabase dashboard keeps it auditable and changeable without a code deploy.

---

### 6. Login Page UI Components

**Decision**: Build the login card using `UCard` from `@nuxt/ui` v4. Use `UButton` with `color="white"` and a leading Google G icon for the "Continue with Google" CTA. The hexagon logo is a custom SVG or a Nuxt UI icon. Use standard Tailwind dark background (`bg-neutral-950`) for the page and a constrained card width (`max-w-sm`).

**Rationale**: Constitution IV requires `@nuxt/ui` components wherever suitable. `UCard` and `UButton` are the correct primitives for this layout.

---

### 7. Environment Variables

**Decision**: `SUPABASE_URL` and `SUPABASE_KEY` (anon key) are required by `@nuxtjs/supabase`. They are set in `.env` (not committed). An `.env.example` with placeholder values is committed.

**Rationale**: Standard practice; module auto-reads these variables via its Nuxt config integration.

---

## No NEEDS CLARIFICATION Remaining

All technical decisions are resolved. The tech stack is fixed by the constitution and the already-installed module. No ambiguities block implementation.
