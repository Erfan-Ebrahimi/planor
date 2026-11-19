# Layout

## Authentication and shell

- Login and registration use a full-height authentication background and a centered form with a `440px` maximum width and `20px` padding. The logo uses the form width. Centered `36px` titles sit above left-aligned field labels. The primary action spans the form. SSO buttons stack with an `8px` gap, separated from the local form by a horizontal OR divider when both appear.
- Header is `50px` high. The logo image is `32px` high, the single-line title is `20px` with ellipsis, and trailing actions occupy a flex row. The main shell is fixed below with `calc(100% - 50px)` height. The left sidebar is `230px` by default, `180px` with the compact preference, and `0px` when hidden. The main area takes the remaining width. A `16px` toggle sits at the start edge of the header.
- Header utilities with the corresponding hide class disappear at `600px`, the demo GitHub callout at `700px`, and the feedback callout at `1000px`. The CSS does not define a sidebar drawer breakpoint. Narrow-screen usability is **Unverified**.
- Dashboard and project pages scroll inside the shell. The section heading uses `10px 20px` padding. Tile grids use auto-fill with a `200px` minimum column width, `120px` rows, `20px` gaps and `10px 20px 20px` outer padding. At viewport widths of `240px` or less, the column minimum is `90px`.

Sources: `client/src/components/Login/Login.module.scss`, `client/src/components/Register/Register.module.scss`, `client/src/components/Header/Header.module.scss`, `client/src/components/Static/Static.module.scss`, `client/src/components/Static/Sidebar.module.scss`, `client/src/components/Projects/Projects.module.scss`, `client/src/components/Project/Project.module.scss`.

## Boards and card details

- Board content sits beneath a `68px` toolbar with `16px 20px` padding and a title constrained to `15vw`. Columns are `272px` wide, `30px` when collapsed, with `10px` trailing margins. The horizontal canvas uses `20px` left padding and its own scrollbar. Expanded card stacks scroll vertically, with the bottom Add Card trigger outside the stack. The final Add List button is `272 × 42px`.
- Card title styles can clamp at three lines. Labels, avatars and indicators wrap in available space. The card's container query adjusts a compact group at `259px`.
- The card detail panel is `650px` wide, changing to `100%` at viewport width `800px` or below. It takes space alongside the board, with a sticky header and a scrollable main section. Section content has `15px` horizontal padding. Card detail title clamping scales with viewport height. It allows 1, 2, 3, 4 or 12 lines at the source bands up to 400, 401–600, 601–799, 800–899 and 900 pixels and above.
- The alternative list view uses a full-width scrollable table with persistent footer controls and customizable column widths. CSS geometry and overflow are documented here. Exact visuals at all viewport sizes are **Unverified**.

Sources: `client/src/components/Board/Board.module.scss`, `client/src/components/BoardActions/BoardActions.module.scss`, `client/src/components/Board/BoardView/BoardView.module.scss`, `client/src/components/Board/ListView/ListView.module.scss`, `client/src/components/List/List.module.scss`, `client/src/components/Card/Card.module.scss`, `client/src/components/CardModal/CardModal.module.scss`.

## Settings, popups and feeds

- Settings use the available shell height and width, scroll within the pane, and have `20px` padding and a centered heading. Profile, Account, Authentication and Project Settings cap form/action blocks at `750px`. Profile avatar is capped at `200 × 200px`. Project heading spacer collapses at `700px`. About content changes from `35%` to `100%` at that breakpoint.
- Anchored popup has `274px` minimum content width and `12px` padding on three sides of the content. Header centers its title with `12px 28px 8px` padding. Placement flips and shifts in available viewport space. Some surfaces supply distinct widths. Notification preview caps at `max(400px, 35vw)`, activity at `max(35vw, 274px)`.
- The viewport popup has `calc(100vw - 44px)` and `calc(100vh - 44px)` limits. The centered modal uses fit-content with `calc(100vw - 20px)` and `calc(100vh - 70px)` caps, and `15px` padding. The card route side panel has its own sizing.

Sources: `client/src/components/Settings/SettingsShared.module.scss`, `client/src/components/Settings/ProfileSettings/ProfileSettings.module.scss`, `client/src/components/Settings/AccountSettings/AccountSettings.module.scss`, `client/src/components/Settings/AuthenticationSettings/AuthenticationSettings.module.scss`, `client/src/components/Settings/ProjectSettings/ProjectSettings.module.scss`, `client/src/components/Settings/AboutSettings/AboutSettings.module.scss`, `client/src/components/Utils/PopupElements/`, `client/src/components/Utils/Popup/`, `client/src/components/Utils/ViewportPopup/`, `client/src/components/Utils/Modal/`, `client/src/components/Header/NotificationsPopup.module.scss`, `client/src/components/ActivityPopup/ActivityPopup.module.scss`.
