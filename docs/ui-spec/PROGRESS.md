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

## Remaining

- [ ] User review of step 1.
- [ ] Step 2 after approval. Auth screens.
- [ ] Steps 3–6. Team navigation, static board, drag and drop, and card details.
- [ ] Steps 7–11. Jalali calendar, attachments/comments, notifications/activity, archive/restore/deletion, and final states and consistency.

## Pending decisions

- **Step 2, account policy.** Confirm whether login accepts a username as well as an email, and whether registration requires email verification.
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

Next step after user approval is Step 2, beginning with [the login and registration spec](screens.md).
