# Screen data contracts

This describes the data required to present 4ga’s UI. Identifiers are stable and independent of display text. Optional actor and timestamp data must allow for a historical author who has left the board. Planor-specific contracts are called out separately.

## Objects and relationships

| Object | Fields and relationships used by the UI |
| --- | --- |
| Account/session | Current user ID and authenticated state. User has name, email, optional username/avatar/organization/phone, admin status, profile preferences and visible verification/source information. Auth UI needs registration capability flags, available providers and submission/error state. |
| Project | ID, name, optional gradient/image background, managers, visible boards, audit metadata. The closest Planor Team model. A user-project relation carries subscription, collapse and personal order. |
| Board | ID, project ID, name, position, background and thumbnail, memberships, labels, lists, optional integration fields, completed-list visibility controls and activity metadata. Board membership has user ID, role, comment permission where applicable and subscription. |
| List | ID, board ID, name, position, completion and collapse flags, actor/time metadata. Contains ordered cards. Visible count is derived from active card filters. The board preference can hide completed lists. |
| Card | ID, board ID, list ID, position, title, optional description, completion, nullable due date, optional timer, optional cover attachment, created/updated time and actor, optional API/email provenance. Associations with board labels, users, tasks, comments and attachments. Counts, unread badges, task progress and nearest due date are derived. |
| Checklist item | ID, card ID, position, name, completion, optional due date and multiple user associations in 4ga. Can carry its own activity metadata. |
| Attachment | ID, card ID, display name, file URL/content metadata, image thumbnail when available, creator and time. The card references its selected cover. |
| Comment | ID, card ID, author, text, created and optional updated time, plus mention identities. The read view can distinguish edited records and former board members. |
| Label | ID, board ID, display name, palette color and, where returned, order. Card-label relation supports many labels per card. |
| Notification and activity | Recipient/read state for notifications, actor/time/event type and contextual entity references for the event. Detailed contracts below. |

Sources: `client/src/models/`, `client/src/containers/CoreContainer.js`, `client/src/containers/ProjectContainer.js`, `client/src/containers/BoardActionsContainer.js`, `client/src/containers/ListContainer.js`, `client/src/containers/CardContainer.js`, `client/src/containers/CardModalContainer.js`, `client/src/selectors/cards.js`, `client/src/api/transformers/`.

## Screen projections and mutations

| Surface | Read | Mutate |
| --- | --- | --- |
| Login and registration | Auth capabilities, draft input, pending/error state and intended return path. | Start session or create account; change local draft while editing. |
| Dashboard and project | Accessible project/board tiles and counts; manager rights and personal sidebar state. | Create/rename project, create board, subscribe, reorder or change disclosure; project settings manage membership/background and deletion. |
| Board toolbar and Kanban | Board membership and editor access, ordered lists and cards, summaries, user preferences and filters. | Update board subscription/preferences, manage authorized settings, create/edit/reorder lists/cards, transfer cards, change title, completion, labels, members, dates and cover. |
| Board table | Same cards as the board projection, plus table columns, pagination, sorting and selected card ID. | Column/order/fit prefs where supported and the same underlying card updates via editable cells. |
| Card detail | Card, lists in accessible destinations, board labels/users, tasks, attachments, page of comments and related per-section display/edit permissions. | Edit card details, add/remove membership/labels, move, toggle done, add/edit/complete/reorder/delete tasks, upload/name/remove attachments, set/clear cover, add/edit/delete comments, subscribe and delete card. |
| Opening a card | Parent board context and matching notifications. | Mark the current user’s matching card notifications read when the route opens. |

Planor adds a distinct priority field and archive status, and uses a single nullable assignee ID. 4ga completion, hiding completed lists and permanent delete are distinct actions in the source. A matching archive/restore flow and a dedicated priority field are **Unverified**. Sources: `client/src/components/BoardActionsPopup/BoardActionsPopup.jsx`, `client/src/components/List/ListActionsPopup.jsx`, `client/src/components/Card/CardActionsPopup.jsx`, `client/src/sagas/core/services/router.js`, `client/src/sagas/core/services/cards.js`, `client/src/sagas/core/services/lists.js`.

## Access, search and feeds

- Membership availability is distinct from instance admin, project management, and board editor/viewer. Board viewing, editing content, managing memberships and commenting need their own capability checks. An editor can comment. A viewer can comment when granted that permission. The comment author has edit/delete controls when allowed. The card detail view gives the current project manager those controls for any comment.
- User selection is by identity. Adding/removing someone from a card or task changes assignment links. Changing a board role changes permission to see or edit content. Selected labels are per-card links. Renaming a label changes the board definition and therefore its display wherever referenced. Selecting a filter creates no assignment or label relation.
- Board filter projection needs a title query, case/any-match flags, selected user and label IDs, an optional due filter with local-day/task flags and unread-only flag. Counts combine the projection and the total defined for the board/list. Notifications-only can affect the rows even where a count selector does not include that flag.
- Notification includes recipient ID, read state, event/resource links or system content, optional system response choices and timestamp. Opening the feed reads active records and applies a user query. Query scope covers combined, project, board, user, card or text. Row and bulk actions mutate read state or remove notifications. They do not alter the underlying card or activity. Subscriptions are per user and context, separate from assignment. Backend delivery and fan-out are **Unverified**.
- Activity includes immutable event ID, timestamp, actor, scope, type, affected entity IDs and event detail payload. Rendering may need historical names/values or unavailable-target states. Check Activity reads an ordered page. Loading more uses the last event cursor and exhaustion flag. Comment history separately pages by comment cursor. Client limits are 50 activities and 50 comments per request.
- Planor comment mentions should carry stable user identities with plain text and authorization for the target card. In 4ga mentions in text and assignment shorthand in names have separate effects.

Sources: `client/src/containers/CardModalContainer.js`, `client/src/components/MembershipPermissionsSelectStep/MembershipPermissionsSelectStep.jsx`, `client/src/models/List.js`, `client/src/selectors/boards.js`, `client/src/selectors/users.js`, `client/src/models/Notification.js`, `client/src/models/Activity.js`, `client/src/utils/get-activity-details.js`, `client/src/constants/Config.js`.

## Settings projections

| Surface | Reads and writes |
| --- | --- |
| Profile | Reads avatar and editable display/contact fields. Save changes name, organization or phone. Avatar update/delete changes that image reference. |
| Account and authentication | Reads usernames, email validation/verification, password availability and optional API-client data. Changes only the chosen identity/credential fields; requests verification mail and displays resend timing. API client create/update/reset/delete is distinct from changing a password. |
| Preferences/theme | Reads selections for appearance, locale, view, sidebar, table, detail sections, interaction and notification rules. Controls write the corresponding account preference. Selecting the Custom theme and saving individual palette overrides are distinct changes. |
| Project settings | Reads project capabilities, metadata, manager relations, art settings and images. Changes name, project manager links and background/thumbnail data. Last-manager leave is blocked in the UI. Delete removes the project through a confirmed action. |
| Instance/users administration | Reads registration, creator and SSO sync settings, or admin user projection with permissions and metadata. Writes the corresponding instance flag or user record and supports authorized account creation/delete. |
| About | Reads current version, latest version status and demo state. Getting Started import requests project creation with current language. |

Sources: `client/src/components/Settings/`, `client/src/containers/Settings/`, `client/src/models/UserPrefs.js`, `client/src/models/ApiClient.js`, `client/src/models/ProjectManager.js`, `client/src/models/Core.js`.
