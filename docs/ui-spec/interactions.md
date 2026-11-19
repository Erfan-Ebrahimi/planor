# Interactions

## Drag and drop

- In the sidebar, drag projects and boards using their reorder handles. The destinations are before or after peer rows. Board reorder is scoped to its project. In board view, drag a list by its header. The horizontal slot uses the target list’s left or right half. A card uses the target card’s top or bottom half, or a list drop region, and can move between lists on the open board. Collapsed and empty columns have drop regions. A move between boards uses the Move popup.
- The momentary gap previews insertion. The original is hidden during drag. A floating preview follows the grab point and animates into the destination, or back to the original position on cancellation where available. The drop animation uses `150ms`. Axis-constrained slots and edge auto-scroll help reach offscreen targets. Board canvas mouse drag also pans horizontally from blank space. List header drops insert near the top, and the add control or collapsed strip accepts drops at the end.
- Checklist dragging changes item order within the card. Board membership avatars can be dragged onto eligible cards and tasks to assign; assignment needs edit permission. Dropping external files in editable card details shows a focused upload area and creates separate attachments.
- Planor’s RTL board will need leading/trailing list hit zones and direction-aware auto-scroll. Browser drag and touch behavior are **Unverified**.

Sources: `client/src/components/Static/Sidebar.jsx`, `client/src/components/Static/SidebarProject.jsx`, `client/src/components/Static/SidebarBoard.jsx`, `client/src/components/Board/BoardView/BoardView.jsx`, `client/src/components/List/List.jsx`, `client/src/components/Card/Card.jsx`, `client/src/components/Tasks/Tasks.jsx`, `client/src/components/Memberships/DraggableUser.jsx`, `client/src/lib/hooks/use-drop-animation.js`, `client/src/lib/hooks/use-list-drop-slot.js`, `client/src/lib/hooks/use-card-drop-slot.js`, `client/src/components/CardModal/AttachmentAddZone/AttachmentAddZone.jsx`.

## Collapse, creation and shortcuts

| Gesture | Outcome |
| --- | --- |
| Sidebar toggle | Hides or restores the sidebar using the current user’s preference. A project disclosure changes the saved project-membership collapse flag. |
| List disclosure | Editor changes the list’s saved collapse flag. The expanded `272px` column becomes a `30px` strip, keeping the name and count. The active add control becomes a popup anchored to the strip. |
| Detail-section disclosure | Description, Tasks, Attachments and Comments can collapse independently. |
| Enter / Escape in named inline forms | Enter submits eligible names. Escape cancels. Whitespace-only input is rejected. Inline list/card composers allow rapid repeated creation. Empty blur closes those inline composers. Add Card through a list menu opens the composer at the top, while the bottom Add Card trigger appends. |
| Ctrl+Enter in card creation | Creates and opens the card. Shift+Enter in the popup keeps it available for another entry when the card does not open. Shift+Enter also keeps the list-add popup available. |
| Ctrl+Enter / Escape in description or comment editor | Save / cancel. Mention selection can consume navigation and dismissal keys while open. |
| Space on hovered editable persisted card or task | Toggles self-assignment when the preference is enabled. An inner task wins over its card. Text controls, composing input, modifier keys and most focused interactive controls are excluded. |
| Right-click | When enabled, eligible project, board, list, card, table-row, task and comment menus open. Many use pointer coordinates, while project and board tiles open their anchored menu. Links and editing controls can retain native context behavior. |

Sources: `client/src/components/Static/`, `client/src/components/List/`, `client/src/components/ListAddPopup/`, `client/src/components/CardAddPopup/`, `client/src/components/CardModal/`, `client/src/components/Board/ListView/ListView.jsx`, `client/src/lib/hooks/use-self-assign-by-spacebar.js`.

## Search, filters and mentions

- Sidebar and notification text filters apply as the user types. Their scope toggle refocuses the input. Tab in those fields cycles the source scope rather than leaving the field. Enter applies and Escape clears. Planor should preserve a reachable focus exit.
- Board card search is a title substring. The default compares without case, Alt+C toggles Match Case and Alt+V toggles Any Match inside the search form. Any Match changes all selected people/labels to any within each facet. Different facets still combine. Matching people include checklist assignees. The unread-only filter uses unread card notifications.
- `@` starts user suggestions, `#` starts label suggestions where enabled and `!` opens the date picker. Triggers begin the text or follow whitespace. Suggestions support directional movement, selection and dismissal. Accepted mentions are tokenized. At a token edge Backspace or Delete can remove the whole token. A manual edit within it can break its metadata association. Plain contact text like an email address does not start suggestions mid-token.

Sources: `client/src/components/Filter/Filter.jsx`, `client/src/components/NorificationFilter/NotificationFilter.jsx`, `client/src/components/CardSearch/CardSearch.jsx`, `client/src/models/List.js`, `client/src/components/Utils/Mention/`.

## Overlay and table behavior

- Button click opens an anchored popup. Context menus use the pointer coordinate. Default placement is bottom with `10px` offset. Flip and shift keep it within the viewport. Escape, outside press and ancestor scroll can dismiss it, unless a caller preserves it while scrolling. An inside click temporarily suppresses scroll dismissal. A popup can have Back to a previous step and a distinct Close. The shared non-modal focus manager disables automatic return focus.
- Viewport popup defaults to bottom-left and five seconds, supports center and success/error, and ignores outside presses. The centered attachment text-file modal has a dimmed, scroll-locking overlay and close action. Its flow differs from the routed card panel and attachment gallery.
- Dropdown supports up/down movement, Enter or Tab selection when relevant, and Escape. Page-number entry uses Enter to navigate and Escape to reset its input. Table footer also has first/previous/next/last, size chooser and settings. A sortable header cycles from its configured direction to the reverse and then clears. Multiple sorted headers show order indicators. Drag their handles to resize. Column settings can select all/default/none, reset widths, fit to screen and reset sorting.

Sources: `client/src/components/Utils/Popup/with-popup.jsx`, `client/src/components/Utils/PopupElements/`, `client/src/components/Utils/ViewportPopup/with-viewport-popup.jsx`, `client/src/components/Utils/Modal/with-modal.jsx`, `client/src/components/Utils/Dropdown/Dropdown.jsx`, `client/src/components/Utils/Table/`.
