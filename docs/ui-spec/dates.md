# Dates and times

The client localizes calendar strings through `format:date`, `format:time` and `format:dateTime`. It parses matching input back to a local date and assigns the resolved language to the calendar. The literal per-language patterns are supplied by `@4gaboards/locales`, outside the requested client folder. They are **Unverified** here. The hardcoded mention pattern is visible in the client and specified below. Sources: `client/src/i18n.js`, `client/src/components/Root.jsx`, `client/src/components/Utils/Mention/mentionUtils.js`.

## Editing and filtering

| Entry point | 4ga behavior | Planor |
| --- | --- | --- |
| Card due date | From the card action menu, details add/edit, or editable table cell. Popup shows separate typed date and time fields above an inline month calendar. Defaults to the existing value or the current local day at 12:00. Calendar selection changes the date field and preserves time. Date is focused on open. Enter or Save validates the date first, then combined date/time. Invalid fields receive focus and error styling. Remove clears the existing value and closes. Inline calendar disables its keyboard navigation option. | Jalali date picker and Jalali typed date. Localized time, accessible keyboard navigation, nullable due date. |
| Task due date | The task menu and populated editable task due date use the same editor. | Jalali picker if Planor adds individual checklist deadlines. |
| Board due-date filter | One typed date and inline calendar, with Just Selected Day and Include Task Due Dates controls, plus Remove and Save. No visible time field. Existing time is preserved, or defaults to local noon. Selected Day compares local calendar day. The other mode compares the exact instant at or before the hidden time, so a date-only filter can exclude later hours on that date. No due date fails the date match unless a task is included and matches. The active filter renders as a compact colored date and has a separate clear button. | Jalali input and filter chip. Define the boundary and zone explicitly before implementing. |
| `!` date suggestions | In card names (creation and edit, including table), task names (creation and edit), description and comment editors. First pick a day. Next shows a back arrow with the selected day, No Time, and 96 quarter-hour options from `00:00` through `23:45`, initially scrolled to `08:00`. The inserted date is `YYYY-MM-DD` or `YYYY-MM-DD HH:mm` with local Gregorian components and ASCII digits. A name editor can carry the first accepted date into the due date; No Time then becomes 12:00. Description/comments retain inserted text and do not apply it as a due date. | The requested comment feature needs person mentions. If retaining date shorthand in another flow, use a Jalali picker and display. |

Sources: `client/src/components/DueDateEditStep/DueDateEditStep.jsx`, `client/src/components/DueDateEditPopup.jsx`, `client/src/components/FiltersDueDateStep/FiltersDueDateStep.jsx`, `client/src/components/BoardActions/Filters.jsx`, `client/src/models/List.js`, `client/src/components/Utils/Mention/MentionPopup.jsx`, `client/src/components/Utils/Mention/hooks.js`, `client/src/components/Utils/Mention/mentionUtils.js`, `client/src/components/CardModal/DescriptionEdit.jsx`, `client/src/components/CardModal/Comments/CommentEdit.jsx`.

The shared calendar fills its popup width. The month header uses capitalized `14px` text with previous on the left and next on the right. Weekday and day cells are centered at `40px` wide and `28px` line height. Day cells have subtle grid borders. The selected day is bold and uses the selection background, outside-month days use subdued text and a separate background, and today's text uses the theme's today color. Rounded shape applies calendar/day radii. Source: `client/src/root.module.scss`.

## Due states and placement

The ordinary date is bold compact text on the board (`12px`) and larger in details (`14px`). The tooltip always has the full date and time and may add a contextual prefix. The Show Full Due Dates preference switches the normal display from date-only to date and time. The calendar-only summary variant shows an icon with the same status color and timestamp tooltip. An editable date darkens on hover. Empty due date is omitted unless a caller requests a dash, or replaced by a separate Add control where editing is available.

Normal is more than 14 × 24 hours before the due instant. Close includes the 14-day boundary and the exact due instant. Overdue begins after the due instant. These map to `--dueDateNormal`, `--dueDateClose` and `--dueDateOver` rather than text labels. If a caller supplies a completion timestamp, the color reflects the state at completion. Pending items schedule updates at the two boundaries. The table's editable Due Date and read-only Closest Due Date cells use the regular colored variant. Generic table audit timestamps instead use a neutral `listView` variant. Both the generic table audit and detail audit variants always display full date-time. The component supports localized relative duration when requested. No standard activity/comment/notification row uses this mode.

Earliest checklist summary uses unfinished dated tasks. Card-level closest due date combines eligible card/task due dates for incomplete cards. It appears as optional card or table metadata and in details when enabled. The card checklist preview and detail checklist heading can show a calendar icon summarizing the earliest task date. Per-item dates appear beside task rows.

Sources: `client/src/components/DueDate/DueDate.jsx`, `client/src/components/DueDate/DueDate.module.scss`, `client/src/components/Card/Card.jsx`, `client/src/components/CardModal/CardModal.jsx`, `client/src/components/Tasks/Tasks.jsx`, `client/src/components/Tasks/Task.jsx`, `client/src/components/Board/ListView/DueDateCell/DueDateCell.jsx`, `client/src/components/Utils/Table/DateCell/DateCell.jsx`, `client/src/selectors/cards.js`.

## Read-only dates and elapsed time

| Surface | Display in 4ga | Planor |
| --- | --- | --- |
| Board tile/card/table due date, task date, closest-date badge and filter chip | Date format varies as above. Tooltip always shows full localized date and time. | Jalali date in the chip and Jalali full date-time in its accessible description or tooltip. |
| Card details Created and Updated | Compact neutral date-time by actor avatar. Created Via API can replace the label. Updated appears when actor or time exists. The metadata can be hidden in preferences. | Jalali date-time. |
| Board table Created At and Updated At | Separate sortable columns, local date-time in neutral text. Actor columns are separate. | Jalali display and chronological sorting if table is retained. |
| Activity header metadata and rows | Popup presents created/updated actor and time when available. Each event row puts local `dateTime` by avatar and author. Contextual variants remove redundant resource labels. | Jalali date-time on each event and its metadata. |
| Comments | Created date-time beside author. If an updated timestamp is present, an Edited marker displays that full timestamp in its tooltip. | Jalali date-time, including the edited timestamp. |
| Attachments | Local date-time under the file name. Attachment activity can also show event dates. | Jalali date-time where upload metadata is shown. |
| Notifications | Popup and center use local full date-time in a subdued `12px` header next to the author. Activity notifications use the event time, system messages use notification time. | Jalali date-time. |
| Admin users table | Last Login, Created At and Updated At are date columns where configured. Empty display depends on the cell’s dash flag. | Jalali date-time if an equivalent audit surface is retained. |
| Email token and API credential management | Email token creation uses full date-time. API client row can show creation date with full created/updated hover text and a full Last Used timestamp. | Outside phase-one Planor feature scope. |
| Email verification resend | When available, the resend action shows remaining seconds and stays disabled during the client countdown. This is an elapsed wait. | Localized duration if email verification is retained. |
| Timer | Elapsed time with play/pause, refreshed while running. Timer editor manages hours, minutes and seconds, with edit, start/stop, save and remove controls. This is duration, independent of calendar dates. | Outside Planor feature scope. |

Sources: `client/src/components/CardModal/CardModal.jsx`, `client/src/components/Board/ListView/ListView.jsx`, `client/src/components/ActivityPopup/ActivityPopup.jsx`, `client/src/components/ActivityPopup/Activities/Activity.jsx`, `client/src/components/CardModal/Comments/Comment.jsx`, `client/src/components/CardModal/Attachments/Attachment.jsx`, `client/src/components/Notifications/Notifications.jsx`, `client/src/components/Notifications/Notifications.module.scss`, `client/src/components/Settings/UsersSettings/UsersSettings.jsx`, `client/src/components/MailTokenListStep/MailTokenListStep.jsx`, `client/src/components/Settings/AccountSettings/AccountSettings.jsx`, `client/src/components/Settings/AuthenticationSettings/AuthenticationSettings.jsx`, `client/src/components/DateText/DateText.jsx`, `client/src/components/Timer/`, `client/src/components/TimerEditStep/`.

Event message bodies can include values formatted by the shared activity translation renderer. Exact locale-specific formatting of date values inside those sentences is **Unverified** within the client-only scope. Source: `client/src/components/ActivityMessage/ActivityMessage.jsx`.

## Planor date decisions

- Stage 7 uses `jalaali-js` 2.0.1 for calendar arithmetic and a native Vue date and time picker. Entry and display use `Asia/Tehran` for all members. The picker returns a Gregorian ISO 8601 UTC instant or `null`.
- Human-readable dates display Persian digits and month names. The week begins on Saturday. An unset due-date editor starts on the current Tehran calendar day at noon.
- The picker uses arrow keys for day and week navigation, Home and End for week bounds, and Page Up and Page Down to switch months. Shift with Page Up or Page Down switches years. Typing a date and time remains available. An invalid or nonexistent local time stays in the editor for correction.
- Board summaries show the Jalali date and a full Jalali date-time tooltip. Details show the full date-time and allow eligible editors to save or clear it separately from the card fields. Completed cards retain a neutral date. The board refreshes deadline states at the warning and overdue boundaries, on focus, and at Tehran midnight.
- The authenticated local review at `/review/jalali` shows empty, selected, overdue and disabled examples with a fixed clock.
- Date-only filtering and the cutoff for a future day-based filter remain open. The initial board uses the exact due instant for status.
