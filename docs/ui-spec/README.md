# 4ga Boards frontend reference for Planor

Phase one documents the 4ga Boards React client at revision `8ef8da408677420c9a3a1ae967d3ca337c5c5466` in the sibling checkout. Paths in the spec are relative to the **4ga Boards repository root**.

Source inspection covers the full client. The publicly accessible login and registration screens were also viewed in the hosted demo. The demo’s deployed revision, authenticated rendering and service responses are **Unverified**. [4ga Boards demo](https://demo.4gaboards.com/)

4ga calls the top-level workspace a **project**. It is the closest equivalent of a Planor **team**. The main hierarchy is Team → Board → List → Card. A card can have checklist items, attachments, comments, labels, a due date and members in 4ga. Planor calls for one assignee, plain-text descriptions, Persian content and RTL layout. 4ga findings and Planor decisions are identified separately in each document.

## How the frontend is organized

`client/public/index.html` and `client/src/index.js` launch the client. `client/src/components/Root.jsx` defines routes and `client/src/constants/Paths.js` defines their paths. `client/src/components/Core/` and `client/src/components/Static/` handle the signed-in shell and main page selection. Feature directories under `client/src/components/` contain screens, panels and popups. `client/src/components/Utils/` holds shared controls. Styles live with components and in `client/src/colors.css`, `client/src/root.module.scss`, `client/src/global.module.scss` and `client/src/backgrounds.module.scss`. Client data and action paths were consulted where needed to confirm what each surface reads or changes.

## Reading order

1. [Screens](screens.md) for routes, access and screen states.
2. [Layout](layout.md) and [design tokens](design-tokens.md) for source geometry and styling.
3. [Components](components.md) and [interactions](interactions.md) for controls and workflows.
4. [State and data](state-and-data.md) for entity contracts and mutations.
5. [Dates](dates.md) and [RTL notes](rtl-notes.md) for localization.
6. [Planor mapping](Planor-mapping.md) for scope decisions.
7. [Progress](PROGRESS.md) for audit checkpoints and coverage.
