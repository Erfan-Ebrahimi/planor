# Design tokens

These values describe the source palette and sizing. They serve as a reference for a visually distinct Planor design.

## Theme mechanics

The Default palette lives on `:root`. GitHub Dark and Light override it, and Custom applies saved color overrides over the default on the signed-in application. The shape preference is independent of color. Default and Rounded affect different families of controls rather than applying a universal radius. The custom editor shows token names and values, can seed overrides from a preset, and saves individual edited colors. Applying a preset replaces the override set with differences from Default. The source flips the document color mode to light only for the Light preset. The initial paint comes from a small dark loading stylesheet. Sources: `client/src/colors.css`, `client/public/loading.css`, `client/src/components/Core/Core.jsx`, `client/src/components/Settings/PreferencesSettings/PreferencesSettings.jsx`, `client/src/components/Settings/PreferencesSettingsTheme/PreferencesSettingsTheme.jsx`, `client/src/utils/color-utils.js`.

## Core colors

Aliases are resolved where the table shows a hex value. All state-specific aliases and extended palettes live in `client/src/colors.css`.

| Use / token | Default | GitHub Dark | Light |
| --- | --- | --- | --- |
| Canvas `--backgroundColor` | `#22252a` | `#22252a` | `#ffffff` |
| Auth `--backgroundAuth` | `#1e1e1e` | `#010409` | `#f8f8f8` |
| Header `--backgroundHeader` | `#1a1c20` | `#010409` | `#f2f4f6` |
| Sidebar `--backgroundSidebar` | `#20303f` | `#0d1117` | `#f7f9fb` |
| Dashboard tile `--backgroundDashboardTile` | `#3b3b3b` | `#21262d` | `#f0f0f0` |
| Column `--backgroundList` | `#1f2d3c` | `#161b22` | `#cfd7e2` |
| Card, hover, selected | `#2c3e51` / `#1c3546` / `#11576b` | `#1f2937` / `#1f2937` / `#1e3a5f` | `#f0f4f8` / `#e0f3ff` / `#d0e8ff` |
| Details, details header | `#223140` / `#2c3e51` | `#161b22` / `#1f2937` | `#ffffff` / `#f0f4f8` |
| Popup, input | `#2a3d50` / `#17232c` | `#161b22` / `#161b22` | `#f7f9fb` / `#cfd7e2` |
| Table header, row, odd row | `#20303f` / `#162029` / `#242d35` | `#0d1117` / `#161b22` / `#1c2128` | `#f7f9fb` / `#ffffff` / `#edf2f7` |
| Primary, secondary, muted text | `#ebebec` / `#d3d3d3` / `#999999` | `#f0f6fc` / `#e6edf3` / `#8b949e` | `#222222` / `#444444` / `#777777` |
| Link, selection accent | `#2196f3` / `#34b7cd` | `#58a6ff` / `#1f6feb` | `#2196f3` / `#0d6efd` |
| Submit, cancel, auth | `#5aac44` / `#cf513d` / `#2185d0` | `#238636` / `#da3633` / `#1f6feb` | `#5aac44` / `#cf513d` / `#2196f3` |
| Unread badge `--backgroundNotifications` | `#eb5a46` | `#da3633` | `#e53935` |
| Normal, close, overdue | `#999999` / `#fdd41e` / `#ff3030` | `#8b949e` / `#d29922` / `#f85149` | `#777777` / `#ffa000` / `#e53935` |

Other named families include focus/border, selected sidebar/filter, table resize, task/attachment hover, date inside/outside/today, roles, activity scopes, success/error/warning, avatar fallback, scrollbar and password-progress colors. Label presets are a separate 30-color palette and may be overridden per label. The source offers 25 named gradients for backgrounds or thumbnails. Sources: `client/src/colors.css`, `client/src/constants/LabelColors.js`, `client/src/components/Label/Label.jsx`, `client/src/constants/ProjectBackgroundGradients.js`, `client/src/backgrounds.module.scss`.

## Typography, spacing and shapes

| Element | Source values |
| --- | --- |
| Base typography | Museo Sans, Helvetica Neue, Arial, Helvetica, sans-serif. `14px` base and `1.4285em` line height. Museo ships 100/300/500/700/900 in normal and italic. Heading defaults `2rem`, `1.71428571rem`, `1.28571429rem`, `1.07142857rem` and `1rem`. |
| Visible text scale | Auth title `36px` normal; top navigation title `20px` bold; sidebar section `16px` bold; card and control text around `14px`; supporting counts/dates commonly `12px`. Card detail body preference can select a monospace treatment. |
| Space | Repeated `2px`, `4px`, `6px`, `8px`, `10px`, `12px`, `15px`, `16px` and `20px` values. These are observed component values. Shell/grid/panel geometry is in [Layout](layout.md). |
| Default radii | `2px` cards, `3px` inputs/buttons/labels/popup, `5px` tiles, `6px` role badge, `17px` radio track, `50%` avatar/round glyph. |
| Rounded radii | `8px` many buttons, fields, card and date picker; `12px` popup, list container and selected shell/panel corners; `6px` calendar day. |
| Scroll and loaders | Axis-specific scroll containers; theme-colored scrollbar states. Loader diameters `24px`, `32px`, `64px` with a `4px` circular stroke. |

Sources: `client/src/assets/styles.css`, `client/src/root.module.scss`, `client/src/global.module.scss`, `client/src/components/Utils/Button/Button.module.scss`, `client/src/components/Utils/Input/Input.module.scss`, `client/src/components/Utils/Loader/Loader.module.scss`, `client/src/components/Memberships/RoleBadge.module.scss`, `client/src/components/List/List.module.scss`, `client/src/components/Card/Card.module.scss`.

## Shadows, stacking and motion

| Use | Source values |
| --- | --- |
| Card | `0 1px 4px` with `--shadowBlack015`; highlighted layout can add `0 0 5px` accent. |
| Tile | `0 3px 6px` and `0 6px 12px` with 10% black. Hover increases them to `0 16px 32px` and `0 32px 64px` and lifts by `2px`. Effective tile transition is `200ms ease`. Badge background transition is `300ms ease`. |
| Panels | Sidebar `2px 0 5px` at 10% black. Card detail uses `-10px 0 10px -12px` at 60% black. Popup uses paired `-1px -1px 3px` and `1px 1px 3px` shadows. Modal backplate uses `--shadowModal`. |
| Stacking | Card details `1`, sticky header `2` within the panel, anchored/viewport popup and modal overlay `2000`, some nested controls/drop overlay `2001`, suggestion/date mention popup `3000`, drag clone `9999`, disconnect `10001`. These are local declared levels. |
| Other motion | Drop settle `150ms`. Loader spins `600ms linear infinite`. Progress width changes in `300ms`, radio track/handle in `400ms`, theme/shape controls in `200ms ease`. |

Sources: `client/src/components/Card/Card.module.scss`, `client/src/components/Projects/ProjectItem.module.scss`, `client/src/components/Project/ProjectBoard.module.scss`, `client/src/components/Static/Sidebar.module.scss`, `client/src/components/CardModal/CardModal.module.scss`, `client/src/components/Core/Core.module.scss`, `client/src/components/Utils/Popup/Popup.module.scss`, `client/src/components/Utils/Modal/Modal.module.scss`, `client/src/components/Utils/Mention/MentionPopup.module.scss`, `client/src/components/Utils/Loader/Loader.module.scss`, `client/src/components/Utils/Radio/Radio.module.scss`, `client/src/components/Utils/ProgressBar/ProgressBar.module.scss`, `client/src/lib/hooks/use-drop-animation.js`.
