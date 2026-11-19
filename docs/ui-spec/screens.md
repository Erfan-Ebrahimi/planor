# Screens and routes

Route paths below omit the configurable deployment prefix. Signed-in routes display the shell after a full-page initialization spinner. A signed-out request to a protected route goes to login and remembers the original path. Successful login or registration returns there, or to the dashboard if no path was saved. Signed-in visits to login or registration go to the dashboard. The first-session client flow also requests a localized Getting Started project when the account has no last-login value. Actual bootstrap results are **Unverified**. Sources: `client/src/components/Root.jsx`, `client/src/constants/Paths.js`, `client/src/sagas/login/index.js`, `client/src/sagas/login/services/router.js`, `client/src/sagas/core/services/router.js`.

| Route | What the user sees and does |
| --- | --- |
| `/login` | Centered brand and sign-in form. Enter email or username and password, reveal or hide the password, then submit. Configured SSO providers and OIDC methods have separate buttons. Create Account appears when registration is available. Local validation marks fields and moves focus. Dismissible messages cover credential and SSO failures, among others. |
| `/register` | Centered brand and account creation. If enabled, enter email and password and accept the privacy policy and terms. The form derives the initial display name from the email’s local part. Submission locks the inputs and shows busy feedback. Weak or invalid password, invalid email and rejected registration have error treatments. SSO options are independently gated. A disabled-registration message and a return-to-login action cover the unavailable case. |
| `/google-callback`, `/github-callback`, `/microsoft-callback`, `/oidc-callback` | Auth handoff paths recognized by the client login flow. They replace the URL with login, report callback errors there, or continue after a session check. They have no dedicated screen registered in `Root.jsx`. Provider execution is **Unverified**. |
| `/` | Dashboard. Shows available projects as tiles, filtered versus total counts when applicable, board count, and Add Project if allowed. A user with no projects and no creation permission sees the invitation message. A creator with no projects gets a large creation tile. Tile links enter the project. The tile menu exposes authorized project actions. |
| `/projects/:id` | Project overview, the closest equivalent of a Planor team overview. Shows project name, subscription bell, board count and board tiles. Board tiles show name and available card/task counts and open the board. Managers can add a board and enter project settings. An empty project offers a creation tile to managers. A dashboard control returns home. |
| `/boards/:id`, `/boards/:id/:view` | Board workspace. The recognized suffixes are `board-view` and `list-view`. See the board section below. |
| `/cards/:id`, `/cards/:id/:view` | Opens card details over the card’s board. The same view suffixes apply. See the card section below. |
| `/notifications` | Notification center in the main shell. See the notification section below. |
| `/settings` | Redirects to `/settings/profile` for signed-in users. |
| `/settings/profile`, `/settings/preferences`, `/settings/preferences/theme`, `/settings/account`, `/settings/authentication`, `/settings/about`, `/settings/instance`, `/settings/users`, `/projects/:id/settings` | Settings pages. See the settings section below. |
| Any unmatched path | Standalone Page Not Found view after initialization. An unavailable project, board or card on its matching route instead gets the corresponding missing-record title in the shell. The project-settings route has its own access checks. |

Sources: `client/src/components/Login/Login.jsx`, `client/src/components/Register/Register.jsx`, `client/src/components/NotFound/NotFound.jsx`, `client/src/components/Projects/Projects.jsx`, `client/src/components/Projects/ProjectItem.jsx`, `client/src/components/Project/Project.jsx`, `client/src/components/Project/ProjectBoard.jsx`, `client/src/components/Static/Static.jsx`, `client/src/selectors/router.js`, `client/src/utils/path-view.js`.

## Public demo observations

At 1280 × 720, both public auth routes showed the dark background, a centered form with a 400 px content column, the brand above the heading, and initial focus on the first field. Both rendered a password visibility control and blue primary and SSO buttons. Registration showed an unchecked legal-consent row. The desktop form scrolls when the SSO actions and footer exceed the available height. Authenticated screens and submission flows remain **Unverified**. [4ga Boards demo](https://demo.4gaboards.com/)

## Shell and navigation

The header logo links home. The header title shows Dashboard, the active settings section, Notifications, or the current project name. The board name appears in its own toolbar, and the browser tab title can include project, board and card names. The right side contains settings, an admin users link when allowed, notification bell and unread count, and the current user menu. That menu links to profile, preferences, account, authentication, about, authorized instance or project settings, and logout. A deployment can show GitHub and feedback links.

The normal sidebar lists collapsible projects and their boards, highlights the active context and offers a name filter for projects or boards. Filtering by boards keeps only matching boards and their parent projects. The active project and a board-filter result can expose children while a project’s saved collapse flag remains set. Creation and Dashboard actions sit at the bottom if applicable. Personal and instance settings use a settings-only sidebar. Project settings keep the project tree.

A disconnect notice can collapse to an icon and reopen. It tells the user changes will be automatically saved. Actual offline durability is **Unverified**. Sources: `client/src/components/Header/Header.jsx`, `client/src/components/UserPopup/UserPopup.jsx`, `client/src/components/Static/Sidebar.jsx`, `client/src/components/Static/SidebarProject.jsx`, `client/src/components/Static/SidebarBoard.jsx`, `client/src/components/Core/Core.jsx`, `client/src/utils/sidebar-filter.js`.

## Board and card routes

The board shows the name, toolbar, optional background and either horizontally scrolling columns or a card table. The URL view overrides the user's default. An unrecognized suffix is removed. The board can be empty before the first list is created. An editor sees Add List at the end and Add Card in each column. Completed lists can be hidden from the board menu. The table shows the same underlying cards with configurable columns and pagination. A card row or tile opens card details over the current workspace. An internal card link can open the same detail route directly.

Card details are a side panel, with a sticky heading, list selector and close control. The content scrolls through metadata, description, checklist, attachments and comments. Editors can make changes in place or through the action menu. Viewers can see card data; comment access is independently gated. Closing returns to the board and preserves an explicit board/list view. The image lightbox and attachment text-file dialog are secondary overlays.

Board loading shows the shell with a large main-area spinner. Card, board and project missing-record titles appear for unavailable targets. Detailed permissions and control states are in [Components](components.md) and [State and data](state-and-data.md). Sources: `client/src/components/Board/Board.jsx`, `client/src/components/Board/BoardView/BoardView.jsx`, `client/src/components/Board/ListView/ListView.jsx`, `client/src/components/CardModal/CardModal.jsx`, `client/src/containers/CardModalContainer.js`, `client/src/components/Static/Static.jsx`.

## Notifications, activity and filters

The header bell opens a scrollable preview. Its expand button opens `/notifications`, a full main-area view with the normal sidebar. Both show unread and total counts when entries exist. Activity entries show scope, author, timestamp, contextual links and event copy. System entries can show branded text or response buttons for a poll. Each row can be marked read/unread or deleted. The ellipsis offers bulk read/unread and delete actions. An empty feed shows the no-unread message. A query with zero matches leaves the results blank and shows the filtered count. Opening a card marks its related notifications read.

Activity appears in context popup steps instead of having its own route. Project, board, list, card, task, attachment, comment, user and instance surfaces open the same pattern with differing scope, metadata and authority. It displays historical actors and links where available. Result pages append as the scroll sentinel becomes visible.

The board itself uses live card-name search with Match Case and Any Match options plus member, label, due-date and unread-notification filters. The current board/table projection and contextual counts update without leaving the board. Sources: `client/src/components/Header/NotificationsPopup.jsx`, `client/src/components/NotificationCenter/NotificationCenter.jsx`, `client/src/components/Notifications/Notifications.jsx`, `client/src/components/NorificationFilter/NotificationFilter.jsx`, `client/src/components/ActivityPopup/`, `client/src/components/BoardActions/`, `client/src/components/CardSearch/`.

## Settings routes

| Route | Sections, actions and access |
| --- | --- |
| `/settings/profile` | Current avatar with upload/delete menu. Edit and save name, organization and phone. Save acts on the profile fields, while avatar changes have their own controls. |
| `/settings/preferences` | Tables show the current value, control and explanation for appearance, language, layout and behavior. Settings include theme and shape, body text font, default board/table view, compact sidebar, table styles, due-date and detail display, context menus and Space self-assignment. Notification settings include automatic subscriptions, accepted notification categories, suppressed system tags and conditional email preferences. |
| `/settings/preferences/theme` | Beta custom palette editor. Apply a base preset, inspect named color values, and save individual edits through their color pickers. Custom is selected from Preferences. |
| `/settings/account` | Current username and email, verification status and edit popups for editable fields. Sensitive changes can require current password. When verification mail can be sent, a resend action and countdown are shown. Verification result query parameters can open a success or error popup. |
| `/settings/authentication` | Set/change password as eligible. Optional API client management shows name, creation/usage dates, permissions, reset or delete. Generation/reset can open a copyable one-time secret panel. Empty API list has its own message. |
| `/settings/about` | Installed and latest version where available, version fetching/failure text, demo indicator when applicable, external product/support/docs/social/legal links, and import of the Getting Started project. |
| `/settings/instance` | Admin only. Toggles registration and local/SSO registration, accepted registration domains, who can create projects, and whether SSO can sync profile or admin data. The page offers instance activity and a demo-mode explanation when configured. An unauthorized user sees an instance-settings access message. |
| `/settings/users` | Admin only. Customizable user table with avatar, name, username, email/verification, admin, notification counts, provider identities, last login and audit metadata. Add User opens a separate form. Row menu offers profile, identity or credential edits, user/user-account activity and delete when allowed. Self-admin change is disabled, as is admin change in demo mode. An unauthorized user sees a users-settings access message. |
| `/projects/:id/settings` | Project manager only. Back to project, rename, manager membership and manager leave/remove safeguards. Separate background and thumbnail selectors have gradient presets and image upload/remove. The danger zone provides confirmed project deletion. Unavailable or unauthorized project settings show Project Not Found. |

Sources: `client/src/components/Settings/Settings.jsx`, `client/src/components/Settings/ProfileSettings/`, `client/src/components/Settings/PreferencesSettings/`, `client/src/components/Settings/PreferencesSettingsTheme/`, `client/src/components/Settings/AccountSettings/`, `client/src/components/Settings/AuthenticationSettings/`, `client/src/components/Settings/AboutSettings/`, `client/src/components/Settings/InstanceSettings/`, `client/src/components/Settings/UsersSettings/`, `client/src/components/Settings/ProjectSettings/`.

## Loading, empty and failure handling

| Condition | Source behavior |
| --- | --- |
| Initial signed-in application or board fetch | Massive loader before the main content. |
| Missing/unavailable resource | Card, board or project not-found heading in shell. Invalid page uses standalone Page Not Found. Admin settings show explicit access messages. |
| Connection drops | Fixed notice with collapsible icon and explanatory text. Reconnection removes it. |
| No projects/boards/lists | Dashboard offers invite guidance or creation based on permission. Empty project exposes Add Board for its manager. A new board provides Add List for editors. |
| Empty detail section | Empty-but-editable sections offer their add control. Empty read-only description has no editable placeholder. Activity and comment feeds show loaders and fetch additional results as applicable. |
| Empty filtered view | Sidebar/grid/card count changes. Notification filter shows the result count and an empty result area. |
| Validation/submission | Field error styling, focus and submit lock vary by form. Auth and sensitive account actions additionally show dismissible warning/error messages. Pending attachment rows use a spinner before the regular file controls become available. |
| Background or connection services | About shows loading/error text for release information. Optional services affect control visibility or enabled state. Response details, partial failures and retries across the backend are **Unverified**. |

Sources: `client/src/components/Core/Core.jsx`, `client/src/components/Static/Static.jsx`, `client/src/components/NotFound/NotFound.jsx`, `client/src/components/Projects/Projects.jsx`, `client/src/components/Project/Project.jsx`, `client/src/components/Board/BoardView/BoardView.jsx`, `client/src/components/CardModal/`, `client/src/components/ActivityPopup/`, `client/src/components/Settings/AboutSettings/AboutSettings.jsx`.
