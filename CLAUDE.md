# VoltFlow — Claude / AI coding guide (UI + monorepo)

Use this file when helping with **UI design and frontend work**. Prefer project facts over inventing a new stack.

Related docs: `docs/mockups/README.md`, `docs/setup.md`, `docs/services.md`, `docs/businessCaseAndScope.md`, `docs/fourWeekPrototypePlan.md`.

---

## Claude Code session workflow (applies to every session, any area of the repo)

Follow this sequence whenever Claude Code is used to make changes in this repo, regardless of which part of the codebase:

1. **Sync first.** Before writing or editing any code, run `git fetch origin` and pull/merge the latest `origin/main` into the current branch. Surface any conflicts to the user instead of resolving them destructively.
2. **Make the change**, following the rest of this guide (ownership rules, tech stack, etc.).
3. **Ask before committing.** Once the change is ready, ask the user: do they want Claude to commit it, or will they commit it themselves? Never commit silently.
4. **If Claude commits:** push the branch, then wait for the GitHub Actions checks (`Quality (lint, format, build)` and `Security (dependency audit)`, defined in `.github/workflows/ci.yml`) to finish.
5. **Report the check result.**
   - If checks **pass**: ask the user whether they want Claude to open the PR automatically, or whether they'll open it themselves.
   - If checks **fail**: report which check and step failed (with the log detail) and fix or ask before retrying — do not open a PR on a red run.

---

## Product in one line

**VoltFlow** = fake EV fleet + UK grid price/carbon + charging sessions + home reimbursement + AI `CHARGE` / `WAIT` / `STOP` advice — demo portal for internship (not production hardware).

---

## Tech stack (do not change casually)

| Layer | Stack | Notes |
| :--- | :--- | :--- |
| Monorepo | `apps/web` + `apps/api` (+ shared types later) | One repo; modular API, not microservices |
| Frontend | **React 19 + TypeScript + Vite** | `apps/web` |
| Routing | **react-router-dom** | Routes live in `App.tsx` |
| Styling | **CSS** (`index.css`, `layout/*.css`, page-level CSS as needed) | Match mockups; don’t add Tailwind/CSS-in-JS unless the team agrees |
| Lint | **oxlint** (`npm run lint` in `apps/web`) | Keep PRs lint-clean |
| Charts (when needed) | **Recharts** or **Chart.js** | Curriculum: price + carbon + battery curves |
| Icons (when needed) | One set only (e.g. Lucide) | Outline style like mockups |
| API calls | `fetch` via `apps/web/src/api/client.ts` | Base URL: `VITE_API_URL` or `http://localhost:3001` |
| Backend | Node API on **port 3001** | Web on **5173** |
| Auth (later) | JWT lite demo login | Mockup: `voltflow-login.png` — not required for first page polish |

**Do not** introduce Next.js, Redux, or a second UI framework unless the mentor asks.

**Local run:** two terminals — API (`apps/api`) + web (`apps/web` → `npm run dev`).

---

## Folder map (frontend)

```
apps/web/
  src/
    api/           # Shared HTTP helpers only (ask before big changes)
      client.ts
    layout/        # Shell: header/nav — shared (ask before big changes)
      AppLayout.tsx
      AppLayout.css
    pages/         # ONE owner per page file (see table below)
      FleetPage.tsx
      VehiclePage.tsx
      SessionsPage.tsx
      ReimbursementsPage.tsx
      AiAdvisorPage.tsx
    types/         # Shared TypeScript types (e.g. vehicle.ts)
    App.tsx        # Routes — shared (ask before big changes)
    main.tsx
    index.css      # Global tokens / base styles
  public/
docs/mockups/      # Source of truth for UI look & layout
```

### Growing the UI (allowed patterns)

When a page gets large, prefer:

```
apps/web/src/
  components/          # Shared UI only if 2+ pages need it
    Badge.tsx
    BatteryBar.tsx
    StatusPill.tsx
  pages/
    fleet/             # Optional: page-private pieces
      FleetTable.tsx
      FleetPage.css
```

- **Page-owned** components stay next to that page (or under `pages/<name>/`).
- **Shared** components only after duplication is real — don’t build a huge design system on day 1.
- Keep API access in `api/client.ts` (or small modules under `api/`), not scattered `fetch` in every component.

---

## Mockups → screens (build from these PNGs)

| Mockup file | Screen | Route / page | Priority |
| :--- | :--- | :--- | :--- |
| `voltflow-login.png` | Login | TBD (auth) | After core pages |
| `voltflow-admin-dashboard.png` | Admin fleet overview | `/` → `FleetPage` | **MVP first** |
| `voltflow-sessions-costs.png` | Sessions & costs | `/sessions` | MVP |
| `voltflow-reimbursement-queue.png` | Reimbursement queue | `/reimbursements` | MVP |
| `voltflow-ai-advisor.png` | Ask AI | `/ai` | MVP |
| `voltflow-driver-dashboard.png` | Driver portal | optional role | **Phase 2** |
| `voltflow-system-flow.png` | Architecture diagram | docs only | Not a UI page |

**MVP order:** Login (when ready) → Admin/Fleet → Sessions → Reimbursements → AI Advisor.  
**Not month-1:** separate mobile app; driver screen is optional later in the same web app.

---

## Page ownership (edit only your page)

| Student | Browser | File |
| :--- | :--- | :--- |
| 1 | Fleet `/` | `apps/web/src/pages/FleetPage.tsx` |
| 2 | Vehicle `/vehicle/:id` | `apps/web/src/pages/VehiclePage.tsx` |
| 3 | Sessions `/sessions` | `apps/web/src/pages/SessionsPage.tsx` |
| 4 | Reimbursements `/reimbursements` | `apps/web/src/pages/ReimbursementsPage.tsx` |
| 5 | Ask AI `/ai` | `apps/web/src/pages/AiAdvisorPage.tsx` |

**Shared — ask mentor / team before large edits:**  
`App.tsx`, `layout/*`, `api/client.ts`, `index.css` (global tokens), routing, nav labels.

---

## Design rules (match the mockups)

Visual language from `docs/mockups/`:

- **Light mode** dashboard: white cards, light gray page background, soft borders.
- **Brand:** VoltFlow + lightning/bolt mark; primary teal/blue-green accents (not purple AI defaults).
- **Layout target:** left **sidebar** nav + main content (current code may still use a top header — evolve layout toward mockups carefully in `layout/`, as a shared change).
- **Cards** for sections: Fleet table, charts, AI recommendation, reimbursement table.
- **Status badges:** e.g. CHARGING / IDLE / DRIVING — clear color coding.
- **Battery:** percent + progress bar.
- **Charts:** Electricity price (p/kWh) and carbon intensity over time (when grid API is wired).
- **AI panel:** big action (`CHARGE` / `WAIT` / `STOP`), short reason, confidence, optional JSON preview + copy.
- **Rounded corners**, clean sans-serif, outline icons — keep spacing consistent.

### UI do / don’t

| Do | Don’t |
| :--- | :--- |
| Open the PNG mockup while coding that page | Invent a totally different layout |
| Reuse existing types (`types/vehicle.ts`) | Duplicate Vehicle shapes ad hoc |
| Loading / empty / error states | Silent failures |
| Mobile-usable basic layout | Pixel-perfect only for desktop with broken small screens |
| UK units: £, p/kWh, gCO2e/kWh | US-only energy units |
| Keep scope to assigned page | Rewrite the whole app in one PR |

---

## Data & API mindset

- Vehicles are **simulated** (`ev-01` … `ev-05`); refresh may change battery/status.
- Prefer **typed** responses; extend `api/client.ts` when new endpoints exist.
- Fleet live updates may use SSE/WebSocket later — don’t hard-code fake intervals in five places; one place (client or hook).
- AI: expect JSON like `{ action, reason, confidence }` — validate before rendering.
- Secrets stay in `.env` / API only — never commit keys; frontend only gets `VITE_*` public vars.

---

## Git / PR habits (UI)

- Branch from up-to-date `main` / `origin/main` (fetch first).
- One concern per PR (one page or one shared layout change).
- Commit messages: why, not a file dump.
- Co-author Cursor when AI generated code:

```
Co-authored-by: Cursor <cursoragent@cursor.com>
```

- Review diffs before accepting AI edits; you own the PR.

---

## What “done” looks like for a page

1. Matches the relevant mockup closely enough for demo (structure + key widgets).
2. Talks to real API where the endpoint exists; clear placeholder if not.
3. Handles loading, error, empty.
4. No secrets; lint passes.
5. Only touches owned files (or agreed shared files).

---

## Quick prompts for AI helpers

Good:

- “Update `FleetPage.tsx` to match `docs/mockups/voltflow-admin-dashboard.png` fleet table + battery bars; keep `fetchVehicles`.”
- “Add Recharts price/carbon cards on Fleet page using existing API client helpers.”

Bad:

- “Rebuild the app with Next.js and Tailwind.”
- “Change every page and the API in one go.”

---

## Out of scope for UI (month 1)

- Real OCPP chargers / hardware
- Native mobile driver app
- Full payroll payments
- Multi-tenant enterprise RBAC
- Ignoring mockups for a generic “AI dashboard” look
`}