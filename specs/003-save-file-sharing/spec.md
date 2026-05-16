# Feature Specification: Save File Sharing

**Feature Branch**: `003-save-file-sharing`  
**Created**: 2026-05-16  
**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Owner shares a save file with another user (Priority: P1)

A save file owner opens the share dialog for a save game, enters a collaborator's email address, and that user is immediately added to the collaborator list. The invited user can now see the save file in their dashboard under "Shared with me."

**Why this priority**: This is the core value of the feature — without the ability to invite someone, nothing else in sharing works.

**Independent Test**: Can be fully tested by sharing a save to an existing account's email and verifying the invited user sees it listed under "Shared with me."

**Acceptance Scenarios**:

1. **Given** I own a save file and the target email belongs to a registered user, **When** I enter their email in the share dialog and confirm, **Then** they appear in the collaborators list and the save appears in their "Shared with me" view.
2. **Given** I enter an email that has no registered account, **When** I submit, **Then** I see an error message explaining no account was found and no change is made.
3. **Given** I try to invite an email that is already a collaborator, **When** I submit, **Then** I see a notice that this user already has access and no duplicate is created.
4. **Given** I am not the owner of the save file, **When** I view the share dialog, **Then** the invite form is hidden or disabled so I cannot add collaborators.

---

### User Story 2 - Owner views and revokes collaborator access (Priority: P2)

A save file owner opens the share dialog and sees the full list of users who currently have access, including their own "owner" label. For each non-owner collaborator, a revoke/remove button is visible. Clicking it immediately removes that user's access.

**Why this priority**: Owners need control over who has access; revoking access is a critical safety feature for sharing.

**Independent Test**: Can be fully tested by revoking a collaborator and verifying the save no longer appears in their "Shared with me" list.

**Acceptance Scenarios**:

1. **Given** I own a save file with two collaborators, **When** I open the share dialog, **Then** I see all collaborators listed with their name/email and a remove button next to each non-owner.
2. **Given** I click the remove button next to a collaborator, **When** the action completes, **Then** that user disappears from the list and can no longer access the save file.
3. **Given** I am listed as the owner, **When** I view the dialog, **Then** there is no remove button next to my own entry.

---

### User Story 3 - Collaborator leaves a shared save file (Priority: P3)

A user who has been given access to a save file (but is not the owner) can voluntarily remove themselves from the collaborator list. After leaving, the save file no longer appears in their dashboard.

**Why this priority**: Users need autonomy to exit shared files they no longer want access to, without requiring the owner's action.

**Independent Test**: Can be fully tested by a non-owner clicking "Leave" and verifying the save disappears from their "Shared with me" sidebar filter.

**Acceptance Scenarios**:

1. **Given** I am a collaborator (not owner) on a save file, **When** I open the share dialog, **Then** I see a "Leave" button instead of remove buttons for others.
2. **Given** I click "Leave" and confirm, **When** the action completes, **Then** the save file disappears from my dashboard and I can no longer access it.
3. **Given** I am the owner, **When** I view the share dialog, **Then** there is no "Leave" option available to me.

---

### User Story 4 - Filter saves by "Owned by me" and "Shared with me" (Priority: P4)

The dashboard sidebar has two functional filter buttons: "Owned by me" and "Shared with me." Clicking either filters the save list to show only the relevant saves.

**Why this priority**: The sidebar filters are necessary to navigate a growing list of saves — especially once sharing is active and users accumulate both owned and shared saves.

**Independent Test**: Can be fully tested by having at least one owned and one shared save, then toggling each filter and verifying the correct subset appears.

**Acceptance Scenarios**:

1. **Given** I have saves I own and saves shared with me, **When** I click "Owned by me," **Then** only saves where I am the owner appear in the list.
2. **Given** I have saves I own and saves shared with me, **When** I click "Shared with me," **Then** only saves shared with me (where I am not the owner) appear.
3. **Given** I click "All saves," **Then** all saves (owned + shared) appear in the list.
4. **Given** a filter is active, **When** the active filter button is clicked again or "All saves" is clicked, **Then** the full unfiltered list is restored.

---

### Edge Cases

- When a user tries to share a save with their own email, the system displays a clear error ("You cannot invite yourself") and makes no changes.
- What happens when the last collaborator is removed from a save that is "shared" — does the owner still see it correctly?
- What happens if the invited user registers an account after they were not found?
- How does the save card look for a collaborator who cannot rename, delete, or invite others?
- What if the share dialog is opened for a save file where the current user is neither owner nor collaborator (e.g., direct URL access)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a "Share" button on each save file card in the dashboard, visible to all users who have access.
- **FR-002**: System MUST display a share dialog listing all current collaborators (with the owner labeled distinctly) when the share button is clicked.
- **FR-003**: Save file owners MUST be able to invite another user by entering their email address in the share dialog.
- **FR-004**: System MUST look up the provided email against existing accounts; if no account is found, display an error and make no changes. If the entered email matches the current user's own account, the system MUST display an explicit error ("You cannot invite yourself") and make no changes.
- **FR-005**: System MUST immediately add a matched user as a collaborator with viewer-level access upon a successful invite.
- **FR-006**: Save file owners MUST be able to remove any non-owner collaborator from the share dialog.
- **FR-007**: Non-owner collaborators MUST be able to leave a save file from the share dialog.
- **FR-008**: Non-owner users MUST NOT see rename, delete, or invite controls for save files they do not own. Once factory editing is implemented, collaborators MUST have full edit rights within the planner (placing buildings, connecting belts, changing recipes) — equivalent to the owner's editing capabilities, excluding save management actions.
- **FR-009**: The dashboard sidebar MUST include a functional "Shared with me" filter that shows only saves the current user is a collaborator on but does not own.
- **FR-010**: The existing "Owned by me" sidebar filter MUST show only saves where the current user is the owner.
- **FR-011**: The save file list MUST display a role indicator (e.g., "OWNER" or "SHARED" tag) on each save card so users can distinguish ownership at a glance.
- **FR-012**: System MUST enforce that only the save file owner can invite or remove collaborators; this enforcement must apply on the server side, not only in the UI.

### Key Entities

- **SaveGame**: Represents a user's save file; has an owner (a single user). Existing entity — gains a relationship to multiple collaborators.
- **SaveGameCollaborator**: Join entity linking a SaveGame to a user who has been granted access. Attributes: save game reference, user reference, joined date. Deleted automatically when the parent SaveGame is deleted (cascade).
- **User**: Existing entity. Looked up by email when inviting. No new attributes required.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A save file owner can successfully invite an existing user by email in under 30 seconds, without leaving the current page.
- **SC-002**: A collaborator's save file appears in their "Shared with me" filter immediately after being invited (no page reload required).
- **SC-003**: 100% of rename, delete, and invite actions for a save are blocked for non-owner users — both in the UI and at the data layer.
- **SC-004**: The "Owned by me" and "Shared with me" sidebar filters correctly show the right subset of saves for every user who has a mix of owned and shared saves.
- **SC-005**: Revoking or leaving access removes the save from the affected user's dashboard within one page load.

## Clarifications

### Session 2026-05-16

- Q: Can collaborators make edits to the factory planner, or is their access read-only? → A: Full edit access (same as owner, minus save management actions). Factory editing not yet implemented — clarification applies once factories are built.
- Q: Is there a maximum number of collaborators per save game? → A: No hard limit for now; can be added later if needed.
- Q: Should the system block a self-invite silently or show an explicit error? → A: Show a clear error message ("You cannot invite yourself"); no change is made.
- Q: What happens to a shared save when its owner deletes their account? → A: Cascade delete — the save game and all collaborator records are deleted.
- Q: Is sharing strictly at the save game level, with factory-level sharing out of scope? → A: Yes — sharing is at the save game level only; all factories are always included; factory-level sharing is explicitly out of scope.

## Assumptions

- There is no hard limit on the number of collaborators per save game; a cap may be introduced in a future version if performance or abuse requires it.
- When a save file owner deletes their account, the save game and all associated collaborator records are deleted via cascade. Ownership transfer is out of scope.
- Sharing is strictly at the save game level — all factories within a save are always included when access is granted. Factory-level sharing is explicitly out of scope.
- Users are identified by their registered email address; no username search is supported in this version.
- Invitation emails are out of scope — if no account exists for the given email, the invite fails with a clear error message.
- All collaborators receive full edit access within the planner (same as owner, minus save management actions). Role differentiation (e.g., viewer-only) is out of scope for this version. Factory editing is not yet implemented, so this is a forward-looking constraint for when factories are built.
- The share dialog is opened from the dashboard save card; a share button may also exist in the factory planner topbar but opens the same save-level dialog.
- The design file from Claude Design was reviewed; the share dialog UI (email input, collaborator list, role tags, remove buttons) and sidebar filters ("Owned by me", "Shared with me") have been extracted from it as the visual target.
- The existing Supabase backend with Row-Level Security will enforce ownership rules; the frontend access restriction is a UX concern, not the sole security boundary.
- "Leave" and "Remove" are the same underlying operation (deleting the collaborator record); the label differs based on who is performing it.
