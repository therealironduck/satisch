# Feature Specification: Savefile Management

**Feature Branch**: `002-savefile-management`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "The user should be able to create savefiles. Each save file consist of a name, a color (default tailwind colors -> but only one shade), an owner (assigned to one user). Implement the save file list, header / sidebar and new save game button."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Save Game List (Priority: P1)

An authenticated user arrives at the dashboard and sees a list of all their save games. Each save game is displayed as a card showing its name, color indicator, and ownership role. The sidebar shows workspace navigation and the header shows the brand, a search bar placeholder, and the user's avatar.

**Why this priority**: The save game list is the core dashboard view — every subsequent workflow starts here. The header and sidebar are permanent chrome that frames the entire app experience.

**Independent Test**: Can be fully tested by navigating to `/dashboard` as an authenticated user and verifying the list of their save games renders with correct names, colors, and OWNER tags. Header and sidebar are visible and contain the correct elements.

**Acceptance Scenarios**:

1. **Given** an authenticated user with existing save games, **When** they navigate to `/dashboard`, **Then** they see a list of all their save games, each displaying the name, color, and OWNER badge
2. **Given** an authenticated user with no save games, **When** they navigate to `/dashboard`, **Then** they see an empty state prompting them to create their first save
3. **Given** any authenticated user on the dashboard, **When** the page loads, **Then** the header shows the brand logo ("satisch." with amber dot), a search bar, and the user's avatar in the top right
4. **Given** any authenticated user on the dashboard, **When** the page loads, **Then** the sidebar shows: workspace filters (All saves, Owned by me), a Library section placeholder, and a Settings link at the bottom
5. **Given** a save card in the list, **When** the user clicks the card header, **Then** the card expands to show an empty factory section with a "No factories yet" placeholder message

---

### User Story 2 - Rename and Delete a Save Game (Priority: P2)

An authenticated user wants to correct a typo in a save game name or remove a save they no longer need. They open the "more" menu (⋯) on a save card and choose either "Rename" or "Delete." Rename opens an inline or modal editing flow; Delete shows a confirmation dialog before permanently removing the save.

**Why this priority**: CRUD completeness — users who create saves must also be able to correct and remove them. The more menu placeholder is already present in the design; not wiring it up leaves a dead UI element.

**Independent Test**: Can be fully tested by renaming a save game and verifying the new name appears on the card, then deleting a different save and verifying it is removed from the list.

**Acceptance Scenarios**:

1. **Given** a save card in the list, **When** the user opens the more menu (⋯), **Then** they see at minimum "Rename" and "Delete" options
2. **Given** the user selects "Rename," **When** a rename input is presented pre-filled with the current name, **Then** confirming with a valid name updates the card label immediately without a page reload
3. **Given** the user selects "Delete," **When** a confirmation dialog appears, **Then** confirming permanently removes the save from the list; cancelling leaves it unchanged
4. **Given** the user attempts to rename with an empty or whitespace-only name, **When** they confirm, **Then** the rename is rejected with a validation error and the original name is preserved

---

### User Story 3 - Create a New Save Game (Priority: P3)

An authenticated user clicks "New save game" and is presented with a modal where they enter a name and choose a color from a palette of standard Tailwind color swatches. Upon confirming, the new save game appears in their list.

**Why this priority**: Save game creation is the primary action; without it the list is always empty. It must follow list visibility since you cannot create what you cannot also see.

**Independent Test**: Can be fully tested by clicking "New save game," filling in a name, picking a color, submitting, and verifying the new card appears in the list with the correct name and color.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** they click "New save game," **Then** a modal appears with a name input field and a color swatch palette
2. **Given** the new save game modal is open, **When** the user enters a name (1–80 characters) and selects a color, **Then** the Create button becomes enabled
3. **Given** the user has filled in a name and color and clicks Create, **When** the save is submitted, **Then** the modal closes and the new save game appears at the top of the list
4. **Given** the modal is open, **When** the user clicks Cancel or presses Escape, **Then** the modal closes with no save game created
5. **Given** the user submits with an empty name, **When** the save fails validation, **Then** the name field is highlighted with an error and the modal remains open

---

### Edge Cases

- What happens when a save game name is blank or whitespace-only? Submission is blocked with an inline validation error.
- What happens if two saves have the same name? Allowed — names are not required to be unique.
- What happens when the dashboard loads but the API call for save games fails? A non-intrusive error state is shown in the list area; the header and sidebar remain usable.
- What happens when a save game name exceeds the maximum length? The name input enforces the character limit; characters beyond 80 are not accepted.
- What is the default selected color when the modal opens? The first color in the palette (amber) is pre-selected.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a persistent header on the dashboard containing: the brand mark (amber hexagon icon), the text "satisch." with an amber accent on the dot, a search bar (non-functional placeholder in this scope), and the authenticated user's avatar
- **FR-002**: System MUST display a persistent left sidebar on the dashboard containing: workspace section with "All saves" and "Owned by me" navigation items (each with a count badge); a Library section; and a Settings item anchored to the bottom
- **FR-003**: System MUST display a list of the authenticated user's save games on the main dashboard area, ordered by creation date descending (newest first), each card showing: the save game name, a color indicator matching the save's assigned color, and an "OWNER" role badge
- **FR-004**: System MUST display the dashboard header above the save list with the user's first name in a greeting (e.g., "Welcome back, [Name]"), the total save count, and a "New save game" primary action button
- **FR-005**: System MUST display an empty state in the save list when the user has no save games, prompting them to create their first one
- **FR-006**: System MUST provide a "New save game" button that opens a modal dialog for save game creation
- **FR-007**: The new save game modal MUST contain: a required name text input (max 80 characters), a color picker showing a fixed palette of standard single-shade Tailwind colors (amber, blue, green, red, violet, teal, orange, pink, slate), a Cancel action, and a Create action
- **FR-008**: System MUST require a non-empty name before the Create action can be submitted; if submitted with an empty name the field must display a validation error
- **FR-009**: System MUST persist the new save game (name, color, owner) to the database when the user confirms creation
- **FR-010**: System MUST assign the authenticated user as the owner of any save game they create
- **FR-011**: System MUST show the newly created save game in the list immediately after creation without requiring a full page reload
- **FR-012**: A Supabase database table MUST exist for save games with at minimum: a unique identifier, a name, a color value, an owner reference, and creation/update timestamps
- **FR-013**: Row-level security MUST ensure users can only read and modify save games they own
- **FR-014**: Save cards MUST be expandable — clicking the card header toggles an expanded section that displays a "No factories yet" empty state placeholder
- **FR-015**: Each save card MUST display a "more" menu (⋯ button) that presents at minimum "Rename" and "Delete" actions
- **FR-016**: System MUST allow renaming a save game: the new name is subject to the same validation rules as creation (non-empty, max 80 characters); on success the card label updates without a page reload
- **FR-017**: System MUST require explicit confirmation before deleting a save game, via a confirmation dialog; on confirm the save is permanently removed and disappears from the list without a page reload

### Key Entities

- **Save Game**: Represents a named planning workspace. Attributes: unique ID, name (string, max 80 chars), color (one of the fixed Tailwind palette values), owner (reference to an authenticated user), creation timestamp, last-updated timestamp
- **Color Palette**: A fixed set of standard Tailwind single-shade colors presented as visual swatches in the creation modal: amber, blue, green, red, violet, teal, orange, pink, slate

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete the full "create save game" flow (click button → enter name → pick color → confirm) in under 30 seconds
- **SC-002**: 100% of save games displayed in the list belong to the authenticated user — no cross-user data leakage at any point
- **SC-003**: The dashboard list loads and renders all user save games within 2 seconds under normal network conditions
- **SC-004**: The newly created save game appears in the list within 1 second of the user confirming creation, without a full page reload
- **SC-005**: Validation errors on the name field are surfaced to the user without dismissing the modal, so no data entry is lost

## Clarifications

### Session 2026-05-15

- Q: Should rename and delete be in scope for this feature? → A: Yes — include rename and delete; each save card gets a "more" menu with both actions and a confirmation dialog for delete
- Q: What happens when a user clicks a save card header? → A: Card expands to show an empty state ("No factories yet") — factories section is a placeholder until that feature is built
- Q: What is the default sort order for the save game list? → A: Created at descending — newest save appears first regardless of edits

## Assumptions

- Save cards are expandable: clicking the card header toggles an expanded section that shows an empty state ("No factories yet") since factories are out of scope for this feature
- Collaboration and shared save games are out of scope — all saves created in this feature are OWNER-only
- The "Shared with me" and "Recently opened" sidebar items, and the Library section, are rendered as visual placeholders (non-functional) in this scope
- The search bar in the header is rendered as a visual placeholder (non-functional) in this scope
- The authenticated user's display name and avatar are sourced from the existing Supabase Auth session established in the Google OAuth feature
- The color picker presents a fixed palette of Tailwind named colors at a single representative shade; users cannot enter custom hex values
- Default selected color when opening the modal is amber
- The "Owned by me" sidebar filter is the only functional workspace filter; "All saves" shows the same result as "Owned by me" in this scope since sharing is not implemented
