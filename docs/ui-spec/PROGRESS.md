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
- [x] The document is Persian and RTL. Copy lives in `resources/js/lang/fa.js`. The only font setting is the system fallback in `--font-ui`.
- [x] The sidebar opens at inline start on desktop. At widths of 600px or less it starts closed and opens above the content using the same toggle. The 601px boundary is shared by the layout and the disclosure logic. The preferences prop sets the default desktop disclosure and changes made in the harness are local to the mounted shell.
- [x] Step 1 uses the documented Default palette. The spec named some shell color families without exact values. Read only the Default theme lines in the sibling `client/src/colors.css` to confirm the sidebar item and selected colors, popup shadow, and border colors.
- [x] Step 1 approved. Step 2 adds Persian login and registration at `/login` and `/register`, with the real Inertia adapter and a local mock transport in the Vite harness. Added no dependencies.
- [x] Step 2 source checks resolved the username format and which fields receive focus and invalid styling on credential rejection. Consulted only the relevant lines of `client/src/utils/validator.js` and `client/src/components/Login/Login.jsx`. Consulted `client/src/colors.css` for the exact auth-button and error colors omitted from the spec. The auth button uses the darker source blue for text contrast.

## Remaining

- [ ] User review of step 2.
- [ ] Steps 3–6. Team navigation, static board, drag and drop, and card details.
- [ ] Steps 7–11. Jalali calendar, attachments/comments, notifications/activity, archive/restore/deletion, and final states and consistency.

## Pending decisions

- **Account policy.** Confirm whether login accepts both username and email, registration password policy, initial display-name rules, production consent copy, and whether email verification is required. The review harness accepts email and a 3–16 character ASCII username, uses a mock 12-character password minimum, and assigns a known fictional Persian display name to the signup fixture. The consent line covers account creation. Real account policy and verification are pending.
- **Step 3, workspace permissions.** Confirm team roles and whether an individual board can narrow access or commenting.
- **Step 6, card details.** Confirm priority levels and their presentation, assignee replacement, and the narrow-screen card-detail layout.
- **Step 7, calendar dependency.** Present two or three library choices with bundle size, upkeep, Vue 3/RTL support and conversion versus picker coverage. Wait for the user's choice before installing a date package.
- **Step 7, timezone.** Ask which timezone the Jalali picker, displayed timestamps, and selected-day filter should use. The transport and storage contract is Gregorian ISO 8601 in UTC.
- **Step 10, archive.** Confirm which records can be archived, who can restore them, and the restore destination when the original list is unavailable.
- **Later product design.** Final Persian font family.

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

Next step after step 2 approval is Step 3, team list and navigation sidebar. Start with [the workspace routes and shell spec](screens.md#shell-and-navigation).
