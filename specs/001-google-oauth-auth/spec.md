# Feature Specification: Google OAuth Authentication

**Feature Branch**: `001-google-oauth-auth`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "Implement Google OAuth using supabase. The whole app must be behind a login, so the initial screen should just be a login. Add a "/dashboard" route which shows a placeholder for now. Google oauth is already configured within Supabase. If you need anything from me ask"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Sign In with Google (Priority: P1)

A visitor arrives at the application and sees only a login screen. They click "Sign in with Google", are redirected to Google's authentication flow, and upon successful authentication are redirected to the dashboard.

**Why this priority**: This is the core access gate — without authentication, no part of the app is usable. All other stories depend on this working first.

**Independent Test**: Can be fully tested by visiting the app root, clicking "Sign in with Google", completing Google OAuth, and verifying the user lands on `/dashboard`.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to any route in the app, **When** they are not authenticated, **Then** they are redirected to the login screen
2. **Given** a visitor is on the login screen, **When** they click "Sign in with Google" and complete Google's auth flow, **Then** they are redirected to `/dashboard`
3. **Given** a visitor is on the login screen, **When** they click "Sign in with Google" and cancel/deny Google's auth flow, **Then** they are returned to the login screen with no error state leaking sensitive info

---

### User Story 2 - Protected Dashboard Access (Priority: P2)

An authenticated user navigates to `/dashboard` and sees a placeholder page confirming they are logged in and the route is accessible.

**Why this priority**: The dashboard is the post-login destination and validates that route protection works correctly.

**Independent Test**: Can be fully tested by authenticating, navigating to `/dashboard`, and verifying the placeholder content is visible.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate to `/dashboard`, **Then** they see the dashboard placeholder page
2. **Given** an unauthenticated user, **When** they attempt to navigate directly to `/dashboard`, **Then** they are redirected to the login screen

---

### User Story 3 - Session Persistence (Priority: P3)

An authenticated user refreshes the page or closes and reopens the browser, and their session is preserved — they remain on the dashboard without needing to log in again.

**Why this priority**: Session persistence is required for a usable app experience, but can be validated after the core login and routing flows are confirmed.

**Independent Test**: Can be fully tested by logging in, refreshing the page, and verifying the user remains authenticated and on the dashboard.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/dashboard`, **When** they refresh the page, **Then** they remain authenticated and the dashboard is shown
2. **Given** an authenticated user, **When** their session expires, **Then** they are redirected to the login screen on their next navigation

---

### Edge Cases

- What happens when Google OAuth returns an error (e.g., invalid state, network failure)? The user should see a generic error message on the login screen and be able to retry.
- What happens when a user navigates to a non-existent route while unauthenticated? They should be redirected to the login screen.
- What happens when a user navigates to a non-existent route while authenticated? Standard 404 handling applies.
- What happens if the OAuth callback URL is tampered with? The authentication must fail safely without granting access.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display only a login screen as the initial/root view for all unauthenticated users; the screen is a centered card on a dark background containing: the app logo (hexagon icon) beside "satisch." in the header; the headline "Plan factories, together."; the subtitle "A realtime planner for ambitious build runs. Sign in to pick up where your save left off."; a full-width "Continue with Google" button with the Google G icon; and a footer version/build string
- **FR-002**: System MUST provide a "Continue with Google" button (with Google G icon) on the login screen that initiates the Google OAuth flow
- **FR-003**: System MUST always redirect authenticated users to `/dashboard` after successful login, regardless of the route they originally attempted to access
- **FR-004**: System MUST protect all application routes — any unauthenticated access attempt MUST redirect to the login screen
- **FR-005**: System MUST expose a `/dashboard` route that displays a placeholder page for authenticated users
- **FR-006**: System MUST persist user sessions for 7 days — authenticated users must not be required to log in again on page refresh or browser reopen within that period
- **FR-007**: System MUST handle OAuth errors gracefully and return the user to the login screen

### Key Entities

- **User Session**: Represents an authenticated user's active session, including identity from Google and session token managed by Supabase Auth
- **Route Guard**: A mechanism that checks authentication state before rendering any protected route and redirects unauthenticated users to login

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete the full sign-in flow (login screen → Google auth → dashboard) in under 30 seconds under normal network conditions
- **SC-002**: 100% of unauthenticated route access attempts are redirected to the login screen — no protected content is ever visible without a valid session
- **SC-003**: Users remain authenticated across page refreshes and browser reopens without being prompted to log in again for up to 7 days from their last sign-in
- **SC-004**: OAuth error scenarios return the user to a functional login screen within 3 seconds, with no application crash or blank page

## Clarifications

### Session 2026-05-15

- Q: After a successful Google login, where should the user be redirected? → A: Always redirect to `/dashboard` after login, regardless of where the user came from
- Q: What should the login screen display beyond the sign-in button? → A: Centered card on dark background; app logo (hexagon icon) + "satisch." name; headline "Plan factories, together."; subtitle "A realtime planner for ambitious build runs. Sign in to pick up where your save left off."; full-width "Continue with Google" button with Google G icon; footer with version/build string
- Q: How long should an authenticated session last before the user must log in again? → A: 7 days — persistent session, standard web app default

## Assumptions

- Google OAuth provider is already configured and enabled in the Supabase project settings — no provider setup is required as part of this feature
- The app runs in SPA mode (SSR disabled), so route protection is handled client-side via navigation guards
- The index/root route (`/`) serves as the login screen; authenticated users visiting `/` are redirected to `/dashboard`
- A single user role applies — all authenticated users have access to the same areas of the app (no role-based access control in scope)
- Mobile responsiveness of the login screen is in scope but no specific design system component is mandated beyond what Nuxt UI provides
- Sign-out functionality is out of scope for this feature (can be added separately)
