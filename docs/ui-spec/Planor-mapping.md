# Planor mapping

Keep carries the interaction into Planor. Adapt keeps the intent with a different contract or treatment. Drop leaves the source feature outside Planor’s stated scope. These decisions describe phase one and do not authorize implementation. A 4ga project is the closest equivalent of a Planor team.

| 4ga feature | Planor | Reason |
| --- | --- | --- |
| Local login and registration | Adapt | Persian forms, Planor identity rules and accessible error/busy states. |
| Protected routes, return path and logout | Keep | These preserve context and support normal account lifecycle. |
| Google, GitHub, Microsoft and OIDC SSO | Drop | Third-party sign-in was not requested. |
| Registration flags/domains and SSO profile/admin sync | Drop | Instance-specific administration exceeds the product scope. |
| Getting Started project and import | Drop | 4ga sample content and onboarding import are outside the requested workflows. |
| Product about, source/social/feedback links and demo mode | Drop | These are specific to 4ga. |
| Profile/avatar and account settings | Adapt | Keep useful identity and password management for Persian accounts. |
| Email verification/resend | Adapt | Credential verification can use Planor’s chosen account policy and Persian feedback. |
| Instance Users table and instance administration | Drop | The stated workspace is team-scoped. |
| Dashboard, organization by projects and project creation | Adapt | Projects become teams with own membership and board overview. |
| Project managers and board editors/viewers/comment access | Adapt | Define Planor team member roles and any board-specific permissions. |
| App shell, team/board navigation and search | Adapt | Mirror the shell, reading and focus order. |
| Connection notice and loading/empty/not-found surfaces | Adapt | Keep accurate status and permission-aware actions in Persian. |
| Project/sidebar collapse and personal order | Adapt | Team navigation can preserve per-user disclosure and order. |
| Project and board gradient, custom background and thumbnail | Drop | Workspace decoration is optional and outside the stated feature set. |
| Boards, lists, cards and linked card detail | Adapt | Keep their hierarchy, contextual navigation and permission boundaries in RTL. |
| Alternate board table and its column/fit/pagination settings | Drop | Planor calls for the Kanban workspace. |
| Reorder board/list/card and move cards | Adapt | Use RTL-aware horizontal order and clear destination rules. |
| List collapse and compact add | Adapt | Preserve visibility controls with readable Persian labels. |
| Board/list/card rename and title editing | Keep | These are core content operations. |
| Name shorthand for `@`, `#`, `!` | Drop | Planor specifies comment mentions and dedicated card fields. |
| Card duplication | Drop | Duplication is outside the stated core card operations. |
| Copy card link | Keep | Card-specific links support sharing and notification navigation. |
| List/card completion and hiding completed lists | Adapt | Use Planor's chosen status model and reserve archive for its separate lifecycle. |
| Hard delete and confirmation | Adapt | Retain deliberate destructive UX where applicable; card archive/restore needs its own actions. |
| Multi-member card and task assignment | Adapt | Planor chooses one nullable card assignee and has no individual task assignment requirement. |
| Avatar drag and Space self-assignment | Adapt | Optional source affordances need confirmation under single-assignee semantics. |
| Board labels and card labels | Keep | Board-scoped reusable color labels are a stated feature. |
| Card due date and filter | Adapt | Use a Jalali picker, display, boundaries and typed validation. |
| Task-level due dates and closest-deadline rollup | Drop | The stated due date is at card level. |
| Checklist rows, completion and reorder | Keep | These satisfy checklists and visible progress. |
| Timer | Drop | Elapsed time tracking is outside scope. |
| Markdown description, rich preview and toolkit | Adapt | Keep collapsible description and save/cancel with plain text. |
| Card comments and person mentions | Adapt | Keep editing, author/timestamps and user suggestions with Persian plain text and stable identities. |
| Label and date mentions in comments/description | Drop | Only person mentions in comments are required. |
| File attachment, inline image preview, rename and delete | Keep | They support file attachments and discoverable management. |
| Card cover and clipboard text-file creation | Drop | These are additional attachment presentation/creation features. |
| Member, label, title, due and unread filters | Adapt | Match Planor’s assignee contract and Persian search/normalization. |
| Project/board/card subscriptions and in-app notifications | Adapt | Keep a focused recipient/event model for mentions and relevant card activity. |
| Notification preview, center and read management | Keep | These provide discovery and control of in-app notifications. |
| System polls/messages and email notification delivery | Drop | The requested notifications are in-app collaboration events. |
| Activity popups and historical context | Adapt | Use Planor team/board/list/card/comment contexts and Jalali timestamps. |
| Personal theme editor, custom palettes and shape picker | Drop | Use Planor’s selected visual system without a user-configurable palette editor in phase one. |
| 4ga locale selector and display preferences | Adapt | Persian is the app language. Retain only settings Planor needs. |
| Context menus, forms, popups and confirmations | Adapt | Reuse interaction patterns with logical positions and accessible touch/keyboard triggers. |
| GitHub board connection | Drop | External work integration is outside scope. |
| Mail-to-board/list addresses and token management | Drop | Email card ingestion is outside scope. |
| Board templates, Trello/4ga import and export | Drop | Migration and reusable templates are outside scope. |
| API client credentials | Drop | Public API is explicitly excluded. |

## Planor additions and open decisions

- **Priority.** A dedicated priority field in 4ga is **Unverified**. Planor needs a field, allowed values, board treatment and filter policy.
- **Archive and restore.** A 4ga archive/restore flow is **Unverified**. Planor needs a visible archive action, a place to find archived items, restore permissions and behavior when the original list is unavailable.
- **Chat and voice/video.** Dedicated features in those categories are **Unverified** in the client. They remain outside Planor’s scope.
- **Product decisions.** Confirm team and board role boundaries, replacement when assigning an occupied card, date-only cutoff and timezone, digit display, and narrow-screen detail layout.

Trace sources: [Screens](screens.md), [Components](components.md), [State and data](state-and-data.md), [Dates](dates.md), [RTL notes](rtl-notes.md).
