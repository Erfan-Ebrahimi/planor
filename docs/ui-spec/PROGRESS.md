# Phase-one audit progress

Source revision `8ef8da408677420c9a3a1ae967d3ca337c5c5466`. Source paths are 4ga repository-relative. The parent session viewed the public login and registration routes in the hosted demo. The local endpoint was unavailable and authenticated screens remain **Unverified**. [Browser observations](screens.md#public-demo-observations)

## Done

- [x] Entry, router, route resolution, login/registration and auth callbacks, shell, dashboard, project overview and sidebar. See README, Screens and Layout.
- [x] Established component directory inventory, including nested feature and utility folders.
- [x] Board, list, card and card details, including board table, board creation/customization, checklist, attachment and drag paths. Added initial component, data and interaction sections.
- [x] Membership, labels, due dates, search, notifications and activity. Wrote date rules and Jalali mapping, including date mentions. Extended screen, component, interaction and data coverage.
- [x] All settings routes, account/profile popups, admin tables, shared controls and overlay families. Expanded screen, layout, component, interactions and settings contracts.
- [x] Palette, type, geometry, motion, CSS direction inventory, Planor feature decisions and complete date display inventory. Inspected all bundled Museo Sans WOFF2 and TTF character maps for representative Persian glyph coverage.
- [x] Reconciled registered routes, callback handling, nested component inventory and all 65 top-level component directory references against the spec. Checked relative source paths and documentation links. Phase one changed only Planor documentation.

## Remaining

- [ ] Browser acceptance of authenticated screens on a running build of the audited revision is **Unverified**. Phase-one documentation is complete.
- [ ] Product decisions for the next phase are listed in [Planor mapping](Planor-mapping.md).

# Phase-two implementation progress

## Done

- [x] Step 1. Added Vue single-file components, the Inertia adapter boundary, a local Vite entry with static Inertia page props, Tailwind tokens, and the signed-in shell at `/`.
- [x] Step 1 set the Persian RTL document, the shared dictionary in `resources/js/lang/fa.js`, and a system font fallback. The approved typography for the combined review is recorded below.
- [x] The sidebar opens at inline start on desktop. At widths of 600px or less it starts closed and opens above the content using the same toggle. The 601px boundary is shared by the layout and the disclosure logic. The preferences prop sets the default desktop disclosure and changes made in the harness are local to the mounted shell.
- [x] Step 1 uses the documented Default palette. The spec named some shell color families without exact values. Read only the Default theme lines in the sibling `client/src/colors.css` to confirm the sidebar item and selected colors, popup shadow, and border colors.
- [x] Step 1 approved. Step 2 adds Persian login and registration at `/login` and `/register`, with the real Inertia adapter and a local mock transport in the Vite harness. Added no dependencies.
- [x] Step 2 source checks resolved the username format and which fields receive focus and invalid styling on credential rejection. Consulted only the relevant lines of `client/src/utils/validator.js` and `client/src/components/Login/Login.jsx`. Consulted `client/src/colors.css` for the exact auth-button and error colors omitted from the spec. The auth button uses the darker source blue for text contrast.
- [x] Step 2 approved. Step 3 adds the team overview, team boards, board context header and restricted-route view, using a persistent workspace layout with an RTL navigation tree and live name filters. The baseline is `227dc16`.
- [x] Step 3 source checks resolved how team and board filters project counts and tiles on the dashboard and team page, how the default scope changes at route boundaries, and which groups open for the current route or board filter. Consulted the filter and count logic in `client/src/utils/sidebar-filter.js`, `client/src/components/Filter/Filter.jsx`, `client/src/components/Project/Project.jsx`, `client/src/components/Projects/Projects.jsx`, `client/src/containers/ProjectContainer.js`, `client/src/containers/ProjectsContainer.js` and `client/src/components/Static/SidebarProject.jsx`.
- [x] Step 3 approved at baseline `a6a4d2e`. The user approved a combined run for steps 4–7 while retaining the calendar dependency decision.
- [x] Step 4. Added the RTL Kanban canvas, list collapse, inline list and card creation, card summaries, status and board title search.
- [x] Step 5. Added the shared sortable composable, pointer and touch handles, and an accessible move dialog. The same exact fractional contract applies to lists, cards and checklist items.
- [x] Step 6. Added protected card detail routes, plain-text fields, a nullable assignee, card priority and labels, and checklist creation, editing, completion and ordering. The product specification was sufficient for steps 4–6. No sibling source was consulted for these steps.
- [x] Step 7. Integrated Jalali due-date display and editing on cards, the shared Tehran clock, UTC-only mutations, and the authenticated picker review. The user approved `Asia/Tehran` and delegated library selection. The parent pinned `jalaali-js` 2.0.1 for conversion and kept the picker a Vue component.
- [x] The combined review uses the requested dark glass theme, two dark base colors and a mint accent. The parent integrated the supplied Dana and Morabba fonts. Vazirmatn remains the primary UI typeface, Dana serves headings, and Morabba serves the Planor wordmark. [Planor theme tokens](design-tokens.md#planor-visual-theme)
- [x] Steps 4–7 approved at `4e0918c`. Steps 8–11 passed the integrated checks and desktop and mobile browser review.
- [x] The final theme uses a near-black canvas, blue-gray surfaces, a mint accent and stronger frosted glass. The collapsed column title stays on one line. [Planor visual theme](design-tokens.md#planor-visual-theme)

## Remaining

- [ ] Final user review. The local Vite preview is available at `127.0.0.1:5176`.

## Pending decisions

- **Account policy.** Confirm whether login accepts both username and email, registration password policy, initial display-name rules, production consent copy, and whether email verification is required. The review harness accepts email and a 3–16 character ASCII username, uses a mock 12-character password minimum, and assigns a known fictional Persian display name to the signup fixture. The consent line covers account creation. Real account policy and verification are pending.
- **Workspace permissions.** Production team roles, private board rules and commenting permissions remain pending. The review harness models view access through fixture membership and board grants. Local disclosure changes survive Inertia navigation, and reload takes the supplied membership default.
- **Files and notifications.** Production file types, size/retention rules and eligible in-app notification events remain open. The review uses limits for a local tab workspace and sends mentions or selected card events only to eligible mock recipients.
- **Step 6, card details.** The review uses four priority levels, replacement of a single assignee, and a full-width panel at 800px and below. Confirm their final presentation during review.
- **Date-only filter.** Future date-only filter semantics and the selected-day cutoff remain open. Current due-state comparisons use exact instants. [Planor date decisions](dates.md#planor-date-decisions)
- **Archive.** The review permits card archive, restore and exact-name deletion for editors. Confirm production archive scope, lifecycle permissions, retention and placement when a list is unavailable.

## Verification

Run `npm ci` in the Planor root, then `npm run dev` and open the local URL that Vite prints. The harness uses Inertia v3's standard page object for static props and the regular Vue adapter. Tailwind 3.4 maps its utilities to CSS variables through the JavaScript configuration. [Inertia page object protocol](https://inertiajs.com/docs/v3/core-concepts/the-protocol#the-page-object)

| Check | Step 1 result |
| --- | --- |
| `npm install` | Passed in the parent session. The CLI agent's attempt hit a registry proxy error. The final lockfile includes ESLint 10, selected after npm reported that ESLint 9 was unsupported. |
| `npm run build` | Passed with Node v24.13.0 and Vite 8.3.8. |
| `npm run lint` | Passed with ESLint 10.15.0, including the rule that confines direct Inertia imports to the adapter. |
| Browser, local production preview at `/` | Passed at desktop (1910 px) and phone (389 px) widths. Verified Persian title and RTL, right-side desktop navigation, mobile disclosure above content, keyboard toggle, skip link focus, reload defaults and no horizontal overflow. The browser reported no console errors during the smoke check. |

### Step 2 local QA

Use the existing installed dependencies and lockfile. Run `npm run dev`, or `npm run build` then `npm exec vite preview` for the production build. Open the loopback URL printed by Vite. The auth screens identify the preview in Persian. Inertia navigation and submissions use a browser-local mock. Only predefined fictional identity IDs and the fixture registration flag persist in the tab session. Form values are absent from stored mock state and page history. Use only these fixture inputs.

| Scenario | Inputs and expected result |
| --- | --- |
| Direct links | Open and reload `/login` and `/register` while signed out. Each stays on its own route and focuses the first credential field. Use the alternate links to move between them. |
| Login success | Enter `niloufar.rastegar@example.com` or `n.rastegar` with `Rastegar-Review-42!`. A successful submit opens the workspace as نیلوفر رستگار. Reload the workspace to check the mock session. |
| Login rejection | Enter `n.rastegar` and the deliberately incorrect `Rastegar-Review-41!`. Both fields are marked, the password is cleared and focused, and the error is dismissible. Submit empty or enter `niloufar@` to check local identifier validation. |
| Registration success | Enter `bahar.naderi@example.net` with `Bahar-Review-48!` and select the consent checkbox. The workspace opens as بهار نادری. |
| Registration validation and rejection | Use `bahar@` for an invalid email, or `Bahar-4!` for a short password. With valid inputs and unchecked consent, focus moves to the checkbox. Use `niloufar.rastegar@example.com`, a valid-length fixture password and consent to check the duplicate-email error. Use `bahar.naderi@example.net` and `Bahar-Review-47!` with consent to reproduce the dismissible mock rejection. |
| Busy and visibility | Use the eye button to show/hide a password. Submit valid-format inputs and check the busy label and disabled controls during the mock's 700 ms wait. Confirm the password is masked again following a rejected submission. |
| Registration disabled | Open `/register?registration=closed` in a signed-out tab. The form is replaced with a status message and a route back to login. At `/login?registration=closed` the registration link is hidden. |
| Protected return | Open `/?review=auth` while signed out. Login should preserve this local return URL, including when switching via the registration link. Successful auth returns to `/?review=auth`. A subsequent direct login or registration URL redirects to the workspace. |

To reset the fictional session and the signup scenario, remove `planor.auth-review.v1` from the tab’s session storage and reload. A fresh private session also starts signed out.

| Check | Step 2 result |
| --- | --- |
| `npm run build` and `npm run lint` | Passed on the final source with the existing lockfile. |
| Vite production preview HTTP smoke check | The built HTML and script loaded at `/login`, `/register`, and `/register?registration=closed`. |
| Browser, local Vite development server | Passed on desktop and at 389 px. Covered Persian RTL, first-field focus, password visibility, required fields, error descriptions and dismissal, busy buttons, username and email login, duplicate email, successful and closed registration, the protected return URL and session state after reload. |
| `node --input-type=module -`, focused harness assertions | Passed for disallowed return destinations, consent, tab isolation, credential-free persistence and recovery from malformed session state. |

### Step 3 local QA

Changed `harness/auth.js`, `harness/main.js`, `harness/workspace.js` and `resources/js/mocks/workspace.js` for authentication return paths and workspace page projections. The UI changes are in `resources/js/Pages/Workspace/`, `resources/js/Layouts/WorkspaceLayout.vue`, `resources/js/Components/AppIcon.vue`, `ShellHeader.vue`, `ShellSidebar.vue`, `WorkspaceTiles.vue` and `resources/js/composables/useWorkspaceNavigation.js`. The shared dictionary and Tailwind/CSS tokens define Persian copy, counts, tile dimensions and toolbar height. The existing dependencies and lockfile were reused.

Use the parent’s existing preview URL and the step 2 fixture credentials above. Start signed out in an isolated tab session for the protected-return check. Sign in as نیلوفر رستگار (`usr-1007`) for the populated workspace. Her fixture role is manager for سپیدار and member for پارس‌نگار and راه‌نو. View grants control board inclusion independently of those roles. A separate signup session for بهار نادری (`usr-1008`) has no memberships. The card/task numbers below are navigation summaries for step 3.

| Scenario | Route or input and expected result |
| --- | --- |
| Protected return | Signed out, open `/boards/br-204?review=step3#context` or `/teams/tm-101`. Login preserves the local destination through the alternate registration link. Sign in with the existing fixture, land on the original path, and reload to confirm the selected context. |
| Dashboard | Signed in as نیلوفر, open `/`. Expect three team tiles and four accessible boards in total. سپیدار starts expanded, پارس‌نگار starts collapsed, and راه‌نو has no board disclosure. |
| Team and board | Open `/teams/tm-101` for two tiles. `/boards/br-201` shows بازطراحی وب‌سایت with ۱۸ cards and ۲۷ tasks. `/teams/tm-102` shows two tiles and forces its sidebar group open while active. `/boards/br-204` shows راهنمای مشتریان with ۱۲ cards and ۲۱ tasks. `/boards/br-205` has zero cards and tasks. Board headers link back to the parent team. Click through and use Back/Forward to check the active route. |
| Team filter | At `/`, in scope تیم‌ها, search `استودیو`. Expect only سپیدار and its two accessible boards. Search `راه نو` to match راه‌نو despite the space and find its zero-board tile. |
| Board filter | In scope تابلوها, search `مشتري` using Arabic ي. Expect only راهنمای مشتریان under پارس‌نگار. Its group opens while the filter is active. Escape or Clear restores the previous disclosure. On `/teams/tm-101`, search `وب سایت` for one of two boards. An unmatched query shows zero results. |
| Empty and restricted | `/teams/tm-103` has no accessible boards. `/boards/br-203`, `/boards/br-206` and `/teams/tm-104` show the same class of unavailable message as unknown IDs without sending restricted records in props. A signup session sees zero teams/boards and cannot open the populated team’s links directly. |
| Viewport and keyboard | Review desktop at 1910 px and mobile at 389 px. Check the desktop sidebar at inline start, the mobile disclosure above the main content, active links, normal Tab exit from the filter, Escape clearing, and absence of horizontal overflow. |

The sidebar and tiles read a single authorized `navigation` projection. Dashboard entry defaults to team search, team entry to board search. On a board, the preceding search context survives in the mounted layout. Board filtering matches visible names and temporarily opens matching groups. Step 4 introduces the Kanban canvas with lists and cards.

| Check | Step 3 result |
| --- | --- |
| `node --input-type=module -` with focused deterministic assertions | Passed five groups covering fixture relationships and counts, protected returns and reload, unavailable routes and sanitized props, empty signup and allowed URLs, and reactive filters/disclosures. The checks used in-memory sessions and did not contact the preview server. |
| `npm run build` | Passed on Vite 8.3.8. The production build emitted the overview, team, board, unavailable, login and registration chunks. |
| `npm run lint` | Passed with zero warnings. |
| `git -c core.safecrlf=false diff HEAD --check` and `git diff HEAD --exit-code -- package.json package-lock.json` | Passed. The package manifest and lockfile are unchanged. |
| Browser and live-server verification | Passed at 1910 px and 389 px. Verified the team and board counts, two search scopes and Persian normalization, temporary group expansion, keyboard exit and clearing, active selection, protected return and reload, Back/Forward, empty and restricted views, and RTL layout without horizontal overflow. Restarted the live Vite preview on `127.0.0.1:5176` so it picked up the new Tailwind configuration. The desktop grid and single-column mobile grid passed after restart. The preview remains running for review. |

### Steps 4–6 local QA

The connected data lives in `resources/js/mocks/boards.js` and `resources/js/mocks/workspace.js`. The in-process harness projects authorized navigation, board summaries and the selected card through `harness/workspace.js`; `harness/boards.js` applies validated mutations and saves a per-account snapshot in the review tab's session storage. `harness/auth.js` and `harness/main.js` handle protected returns and refresh of old history entries after a mutation. The UI is in `resources/js/Pages/Workspace/Board.vue` and the new board, list, card, checklist, inline form and move components. `resources/js/composables/useSortable.js` coordinates handles and move dialogs. `resources/js/lib/board.js` handles fractional positions. The Persian strings are in `resources/js/lang/fa.js`, with shared tokens in `resources/css/app.css` and `tailwind.config.js`.

| Scenario | Review route and expected behavior |
| --- | --- |
| Editor | Sign in as نیلوفر رستگار (`usr-1007`) with the step 2 fixture. From a clean review tab, `/boards/br-201` shows four lists, seven cards and nine checklist items. List `ls-304` starts collapsed. The counts reflect the seeded records and replace the earlier placeholder navigation counts. |
| Search and collapse | On `/boards/br-201`, search `ناوبری`. Expect one card out of seven. Clear the search before reordering. Changing collapse on an editable board survives reload. A read-only board's disclosure is local to the current page context. |
| Move and create | On `/boards/br-201`, use a move handle with pointer or touch, or activate it with Enter and select a list and position. Same-place submissions are disabled. Lists stay in the board, cards may move across its lists, and checklist rows stay in the selected card. `/boards/br-205` starts with no lists or cards and allows the editor to create both. |
| Editable card | Open `/cards/cr-401`. It has three checklist rows, one initially complete. Edit the title, plain-text description, assignee, priority and assigned labels. Add, rename, toggle or move a checklist row. Close the panel to return to the parent board and reload to confirm the mutations. |
| Viewer and restricted | `/boards/br-204` shows four cards and two checklist items. `/cards/cr-411` opens a read-only detail pane. `/cards/cr-415` and `/boards/br-203` are unavailable and send no restricted board data. The signup fixture has no board grants. The editor and viewer capabilities are fixture grants, and production role policy remains open. |
| Keyboard and viewport | Parent browser QA can use 1910 px and 389 px, and check the detail breakpoint at 800/801 px. Use Tab and Enter for move controls, Escape to dismiss the move dialog or close a focused card panel, and check that focus returns to the source card or board heading. Below 801 px the panel fills the workspace and hides the canvas until closed. |

The board exposes only card summaries. The selected card includes the full description and checklist. A new card starts unassigned with normal priority. Review priorities are low, normal, high and urgent. Card summaries and details expose nullable Gregorian ISO UTC `dueAt` for step 7. The board retains a separate card completion flag and checklist progress.

| Check | Result |
| --- | --- |
| `node --input-type=module -`, board and route assertions | Passed for seeded counts, signed-out returns, editor creation, blank-title rejection, viewer and private access, collapse, and reload via the same isolated session. |
| `node --input-type=module -`, ordering assertions | Passed for the exact first, between, last and empty formulas, no-op, same-list and cross-list moves, inaccessible destinations and invalid positions, and reload. |
| `node --input-type=module -`, sortable pointer assertions | Passed for RTL target geometry, one emitted payload per move, Escape cancellation, and no-op or restricted destinations. The test used synthetic geometry in a Vue renderer. |
| `node --input-type=module -`, card detail assertions | Passed for signed-out return, authorized projections, plain text and UTC due-date preservation, single-assignee replacement and clearing, invalid field rejection, completion, the checklist lifecycle and ordering, reload, and read-only and private access. |
| `node --input-type=module -`, Vue SFC compilation | Passed compile of 11 stage 4–6 SFCs using `@vue/compiler-sfc`, then recompiled the four affected after template cleanup. |
| Installed `eslint.cmd` on the 22 affected files, and `git -c core.safecrlf=false diff HEAD --check` | Both passed with exit code 0. The full build and lint are reserved for the combined steps 4–7 candidate. |

The browser checks covered board creation and filtering, list collapse, mouse and keyboard moves, readonly board and card access, title and plain-text description edits, replacement of the single assignee, priority, labels and checklist persistence. The detail panel filled the available width at 389 px and returned keyboard focus to the originating card when closed. Physical touchscreen acceptance remains pending. The browser session supported mouse input and a mobile viewport.

### Step 7 local QA

The existing `JalaliDateTimePicker.vue`, `DueDateBadge.vue` and `useDate.js` now connect to the board, list, summary and detail components. A board clock refreshes on focus, Tehran midnight and due-state boundaries. A due-date edit sends only `{ dueAt }` through the current card mutation and preserves the metadata draft. The mock validates Gregorian ISO UTC input and stores the canonical form with milliseconds, or `null` for a clear. Rejected values leave the record intact. The review route uses `resources/js/mocks/dates.js` and the existing signed-out return flow.

| Scenario | Review route and expected result |
| --- | --- |
| Four picker states | Open `http://127.0.0.1:5176/review/jalali`. When signed out, log in with the existing fixture. Expect empty, selected, overdue and disabled samples using the fixed Tehran reference time of ۱۲:۰۰ on ۲۹ آبان ۱۴۰۵. The review samples are independent of board records and reset on reload. |
| Date edit and draft | Open `/cards/cr-401` as the editor. Change the title without saving it, then add or change the due date. The unsaved title stays in the form while the date updates in the panel and board summary. Clear the due date and reload. The summary badge disappears and the picker is empty. |
| Locale and keyboard | On the review page, enter `۱۴۰۵/۰۸/۲۷` and `۱۴:۳۰` to see `۲۷ آبان ۱۴۰۵، ۱۴:۳۰`. Check Saturday-first layout, directional day and week navigation, Home/End, Page Up/Page Down, Escape and focus return. An invalid date or time stays in the picker with its localized error. |
| Board status and view-only | `/boards/br-201` shows dates for `cr-401` and `cr-404` in an unmodified tab. Live colors depend on the actual clock. A completed card retains a neutral date. `/cards/cr-411` displays its due date in a disabled picker; `/cards/cr-415` remains unavailable. |
| Responsive review | Parent browser QA can use 1910 px and 389 px. Check the glass header and picker, keyboard focus, modal scroll and the full-width mobile detail pane. |

| Check | Final candidate result |
| --- | --- |
| `node --input-type=module -`, harness and date assertions | Passed authenticated review return and reload, fixture states, Persian input and display, UTC canonical save and clear, atomic invalid-patch rejection, and viewer/private access. |
| `node --input-type=module -`, clock assertions | Passed the 14-day warning and overdue boundaries, Tehran midnight, focus refresh and timer cleanup with a controlled clock. |
| `node --input-type=module -`, details draft assertions | Passed Vue prop-update draft retention and confirmed the picker is outside the detail form. |
| `node --input-type=module -`, typed-date parser | Passed slash and hyphen input, mixed delimiter rejection and invalid day rejection after removing an unnecessary regex escape reported by ESLint. |
| `npm run build` | Passed with exit code 0. Vite 8.3.8 transformed 622 modules and built in 1.36s, including Board, DateReview and JalaliDateTimePicker chunks. |
| `npm run lint` | Passed with exit code 0. ESLint reported zero errors and warnings. |
| Browser acceptance | Passed on desktop and at 389 px for the four picker states, Saturday-first layout, RTL arrow navigation across a month, invalid input and recovery, Escape and focus return, date edits without losing the details draft, persisted UTC values, clearing after reload and a disabled viewer picker. Verified the loaded Dana, Morabba and Vazirmatn font faces and the glass effect with the reduced-transparency fallback. |
| Production preview HTTP smoke check | Passed for login, board, card and calendar review routes, bundled entry script and all five WOFF2 assets. The live development preview was restarted on `127.0.0.1:5176` to load the final theme and remains available for review. |

### Steps 8–10 implementation

- [x] Steps 4–7 approved at `4e0918c`. The user approved steps 8–11 as one batch. This work used the written specification. No additional sibling source reads were needed.
- [x] Step 8. Card attachments support a file chooser, inert preview, download, rename and remove. Plain-text comments support person mentions and author-only changes. `br-204` grants comment access independently of edit access.
- [x] Step 9. The workspace shell has a notification preview and the protected `/notifications` center. Board and card activity retain historical actor, title and timestamps. Accepted mutations create events in the local mock. The mock inbox limits access by recipient and current board grant, and opening an active card marks its related notifications read.
- [x] Step 10. Board archive routes list archived cards separately from active counts. Editors archive, restore and permanently remove. Restore appends to the original list when it exists and otherwise requires a valid list in the same board. Exact-name deletion compares the full unmodified string. Viewer access exposes only the archive index and its metadata.

The workspace mock upgrades the prior `planor.board-review.v1.usr-1007` snapshot on the next accepted write. The shared `planor.workspace-review.v2` snapshot is isolated to the review tab. It allows controlled fixture identities to share an audit trail while inbox reads remain recipient-scoped. Files are capped at 256 KiB each, 10 per card and 768 KiB in the tab workspace, including archived content. PNG and JPEG are checked for raster headers and dimensions. UTF-8 text is displayed as text and delivered as a download. Filenames are normalized and path separators and control characters are disallowed. A blocked or full storage environment keeps the current page usable and shows a warning that changes may be lost on reload.

| Focused check | Result |
| --- | --- |
| Step 8, `node --input-type=module -` | Passed legacy snapshot, safe previews, file rejection and retry, rename/remove, plain-text comments, stable mention ranges, authorship, separate viewer permissions, reload and private access. |
| Step 9, `node --input-type=module -` | Passed notification visibility, card auto-read, row and bulk read state, mention fan-out between controlled fixture recipients, reload, immutable activity and invalid/no-op atomicity. |
| Step 10, `node --input-type=module -` | Passed archive route and Jalali date, card and attachment preservation, count changes, private and read-only access, original and fallback restore, exact-name deletion, activity and reload. |

### Step 11 final candidate

The final pass covers shell navigation loading and retry, unavailable routes, empty and filtered states, recoverable upload feedback, local storage warnings, and preserved auth, card operations, ordering and Jalali behavior. The harness transport, scoped projections and archive/file/comment/event operations are in `harness/`. Review seeds are in `resources/js/mocks/`. The UI adds `Pages/Workspace/Archive.vue` and `Pages/Workspace/Notifications.vue` and updates the board, card panel and persistent shell. Shared presentational components handle files, comment composition, notifications, activity and dialogs. The package manifest and lockfile are unchanged from `4e0918c`.

| Scenario | Local review URL and expectation |
| --- | --- |
| Attachments and comments | `/cards/cr-401` as نیلوفر رستگار. Expect one attachment (`file-701`), two comments (`cm-801`, `cm-802`) and three checklist rows. Preview and download the seeded text, then upload a fictional UTF-8 note or PNG/JPEG. Test a disallowed file, then choose a valid one, rename it without changing the extension, and remove it. Only `cm-802` has edit/delete for this viewer. In the comment field type `@کام`, choose کامران یوسفی with arrows and Enter, and verify Escape dismisses suggestions. |
| Viewer and restricted | `/cards/cr-411` can be read and commented on, but card, file and archive editing remain disabled or unavailable. `cm-803` belongs to another author. `/boards/br-204/archive` lists one read-only record (`cr-423`). `/cards/cr-415`, `/cards/cr-424` and `/boards/br-203/archive` are unavailable to نیلوفر. |
| Inbox and activity | Sign in as نیلوفر directly to `/notifications` from a fresh review tab. Expect three records (`nt-902`, `nt-901`, `nt-903`) and two unread. In board scope بازطراحی وب‌سایت with Unread selected, search `يوسفی` to match `nt-901`, then open its card to mark it read. Check the bell preview, row and bulk read controls, no-result filtering, and contextual activity on `/boards/br-201` and `/cards/cr-401`. The seeded activity counts before mutations are five for the board and four for the card. |
| Mention recipient | In an isolated review tab, send a mention to کامران یوسفی from `cr-401`. Clear just the review authentication key `planor.auth-review.v1` in that tab's Session Storage, keeping `planor.workspace-review.v2`. Reload `/notifications` and sign in as `k.yousefi` / `Yousefi-Review-57!` (fictional `kamran.yousefi@example.org`). Expect seeded `nt-904` and the new unread mention, with no نیلوفر notifications. Separate tabs have independent data. |
| Archive and delete | `/boards/br-201/archive` starts with `cr-421` and `cr-422`. The active board starts at 7 cards and 9 tasks. Archiving `cr-401` changes the active counts to 6 and 6, and the deep link offers the archive view. Restore `cr-401` to `ls-301` or use `cr-422` to check required fallback destination. For `cr-421`, entering its name with trailing whitespace keeps permanent delete disabled. The exact name is `مرور الگوی قبلی صفحهٔ نمونه‌کار`. Use an isolated tab for this mutation. |
| Empty and recoverable | The existing signup fixture has no teams or inbox entries. `/teams/tm-103` has no boards, and `/boards/br-205` starts with no lists, activity or archive records. Signed in, reload `/?review=retry` and open a workspace link. The fixture delays the next GET by 450 ms and interrupts it once. The localized retry resumes the same destination. Subsequent GETs succeed normally. |
| Keyboard and responsive | Review at 1910 px and 389 px and use roles and Persian accessible labels to locate buttons, listboxes, text fields and dialogs. Check the bell and archive dialog focus, keyboard mention selection, Escape, caret and focus return, usable scroll, the existing mobile card pane, and preserved auth and Jalali review routes. |

| Check | Final candidate result |
| --- | --- |
| `node --input-type=module -`, isolated harness assertions | Passed steps 8–10 again against the integrated transport. Passed interrupted navigation/retry, protected returns, empty data, create → Jalali due date → upload → archive → restore, corrupt-new/valid-legacy snapshot recovery, and blocked/quota-limited storage. |
| `node --input-type=module -`, targeted Vue and ordering assertions | Passed compilation of 15 affected SFCs and recompilation of the edited form components, notification filtering and no-results projection, keyboard mention selection/dismissal, and prior fractional ordering with inaccessible or no-op moves. |
| `node --input-type=module -`, file validation | Passed UTF-8 tabs and line breaks plus rejection of embedded ASCII and C1 controls. |
| `npm run build` | Passed with exit code 0. Vite 8.3.8 transformed 639 modules and built in 1.41s, including the Archive and Notifications chunks alongside the prior authenticated and public routes. |
| `npm run lint` | Passed with exit code 0 and zero warnings after correcting the control-character regex flagged in the first run. |
| `git -c core.safecrlf=false diff HEAD --check` and `git diff HEAD --exit-code -- package.json package-lock.json` | Passed with exit code 0. |
| Browser acceptance | Passed on desktop and at 389 px. Verified safe preview and local upload, rename and reload, author-only comment editing, keyboard mentions, notification inbox and read-state retention, scoped activity, archiving and both restore destinations, exact-name delete gating, empty cases, access restrictions, localized pending and retry states, and a clean final browser console. The isolated harness executed permanent deletion. |
| Browser theme check | Passed. Confirmed the `#07090d` canvas, `#151b24` elevated surface, a neutral background glow, `24px` blur and the opaque reduced-transparency treatment, a readable collapsed column title and no horizontal overflow at 389 px. |
| `node --input-type=module -`, route assertions | Passed the generic signed-in not-found view, distinct resource errors, protected return and origin guard, and the notification route. Browser reload of an unknown path displayed the not-found page and returned to the overview through its link. |
| Production preview HTTP | Passed the RTL HTML for login, board, card, notifications, archive, Jalali review and an unknown route, plus the built entry script, stylesheet and module preload. |

Next is the final review at the end of Step 11. No implementation steps remain in the approved sequence.
