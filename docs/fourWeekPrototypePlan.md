# VoltFlow — 4-Week Prototype Implementation Plan

A beginner-friendly plan to build a simple EV fleet prototype **without real vehicles**.

**Core idea:** Backend fakes EV car data → dashboard shows live batteries → AI decides `CHARGE` / `WAIT` / `STOP` using fake battery + real UK energy price and carbon data.

---

## Prototype scope

### In scope
- 5 simulated EVs with battery %, charge rate, status, temperature, location
- REST API + WebSocket stream for telemetry
- Live (or mocked) Octopus Agile price + National Grid carbon intensity
- AI decision endpoint that returns strict JSON
- Simple fleet dashboard with charts
- Basic `.env` secrets, Postman docs, CI, and deploy
- Optional n8n alert when AI says `CHARGE`

### Out of scope
- Real chargers, GPS tracking, payments, route ML, mobile apps

---

## System pieces

| Piece | What it does |
| :--- | :--- |
| **Simulator API** | Creates 5 cars and updates battery with simple rules (not pure chaos) |
| **AI Decision API** | Reads car + price + carbon → returns JSON decision |
| **Fleet Dashboard** | Shows cars, charts, and AI advice |

### Fake telemetry rules
- `charging` → battery **+1–3%**
- `driving` → battery **−1–2%**
- `idle` → battery **±0–1%**

### AI JSON output (required)

```json
{
  "action": "CHARGE",
  "reason": "Battery 22% and price is low",
  "confidence": 0.86
}
```

### Simple AI policy to teach
| If… | Then… |
| :--- | :--- |
| Battery &lt; 30% | Prefer `CHARGE` |
| Battery &gt; 80% | Prefer `STOP` / `WAIT` |
| Price high AND battery &gt; 40% | `WAIT` |
| Carbon dirty AND battery &gt; 40% | `WAIT` |
| Price low AND carbon clean AND battery &lt; 70% | `CHARGE` |

---

## Roles (8 interns)

| Role | Owns |
| :--- | :--- |
| **PO / Scrum Master** | Backlog, sprint goals, demo script |
| **Backend Engineer** | Vehicles + telemetry simulator API |
| **Data / Realtime Engineer** | WebSocket stream + price/carbon helpers |
| **AI Engineer** | Prompt, JSON schema, `/ai/decide`, token budget log |
| **Frontend Engineer** | Fleet page, charts, AI decision UI |
| **QA / API Tester** | Postman + OpenAPI checks |
| **DevOps / Platform** | `.env`, CI, Vercel + Render deploy |
| **Automation / Integrations** | n8n webhook alert on `CHARGE` |

Pair roles for reviews (e.g. Backend ↔ Frontend, AI ↔ Automation).

---

## Week 1 — Foundations + fake fleet API

**Goal:** Repo runs locally. `GET /vehicles` returns 5 cars. Team can open PRs safely.

### Build
- Starter monorepo (frontend + backend)
- `.env.example` (no real secrets in git)
- Seed **5 vehicles** with fixed IDs (`ev-01` … `ev-05`)
- Endpoints:
  - `GET /vehicles`
  - `GET /vehicles/:id`
- OpenAPI / Swagger stub
- Postman collection started
- GitHub Actions: lint (and secret scan if possible)
- PO creates sprint board + Week 1–4 backlog

### Role focus
| Role | Week 1 tasks |
| :--- | :--- |
| Backend | Vehicle model + list/get endpoints |
| QA | Postman for list/get; status code notes |
| DevOps | Repo, CI, `.env.example`, deploy hello-world |
| Frontend | Empty “Fleet” page that can call API later |
| Data / Realtime | Design telemetry fields; stub helper module |
| AI | Draft `ChargeDecision` JSON schema (no LLM yet) |
| Automation | Account/setup n8n; no flow required yet |
| PO / SM | Backlog, Definition of Done, standup cadence |

### Done when
- [ ] `GET /vehicles` returns 5 cars
- [ ] Postman collection is shared
- [ ] PR workflow works (branch → review → merge)
- [ ] No secrets committed

### Homework idea
Each person submits a PR related to their role (even a small one) + short note: “what I built this week.”

---

## Week 2 — Live fake telemetry + UI table

**Goal:** Battery numbers move. Dashboard shows updating cars.

### Build
- Telemetry tick every **3–5 seconds** using the charging/driving/idle rules
- Endpoints / stream:
  - `GET /vehicles/:id/telemetry`
  - `WS /stream` (or SSE if simpler for beginners)
- Vehicle fields in sync: `batteryPercent`, `chargeRateKw`, `status`, `temperatureC`, `location`, `updatedAt`
- Frontend fleet table wired to API/stream
- Handle disconnect with a simple “reconnecting…” state

### Role focus
| Role | Week 2 tasks |
| :--- | :--- |
| Backend | Simulator loop + telemetry endpoint |
| Data / Realtime | WebSocket (or SSE) push of updates |
| Frontend | Fleet table + live battery column |
| QA | Tests for telemetry shape + stream connect |
| DevOps | Keep CI green; staging URL if ready |
| AI | Fixture snapshots of car state for later agent tests |
| Automation | Document webhook payload shape for future CHARGE alert |
| PO / SM | Mid-week demo: “batteries move on screen” |

### Done when
- [ ] Batteries change over time with sensible rules
- [ ] UI shows updates without full page refresh
- [ ] QA can replay requests from Postman

### Homework idea
Record a 20–30s screen capture of live battery updates.

---

## Week 3 — Grid data + AI decisions + charts

**Goal:** EV + AI working together. Ask AI → get `CHARGE` / `WAIT` / `STOP` with a reason.

### Build
- Fetch helpers:
  - National Grid Carbon Intensity (real)
  - Octopus Agile price (real, or CSV/mock fallback)
- `POST /ai/decide`
  - Input: battery, price, carbon, status
  - Output: validated JSON only
  - Max retries + token usage log (AI safety / cost)
- Frontend:
  - Price chart
  - Carbon chart
  - Battery chart (one selected vehicle)
  - “Ask AI” button → show action + reason
- Optional: tiny RAG over 2–3 short EV manual text files (stretch)

### Role focus
| Role | Week 3 tasks |
| :--- | :--- |
| Data / Realtime | Price + carbon clients + fallback mocks |
| AI | System prompt, few-shot rules, schema validation |
| Frontend | Charts + AI decision panel |
| Backend | Persist last decision per vehicle (optional but useful) |
| QA | Postman for `/ai/decide` happy path + bad JSON rejection |
| DevOps | Protect LLM API keys in `.env` only |
| Automation | Prepare n8n receiver for CHARGE events |
| PO / SM | Demo script draft (5 steps) |

### Done when
- [ ] Charts show price and carbon
- [ ] AI returns valid JSON only
- [ ] Low-battery + cheap/clean grid tends toward `CHARGE`
- [ ] Token/cost log exists for the shared credit budget

### Homework idea
Submit 3 example AI decisions (inputs + JSON outputs) and tokens used.

---

## Week 4 — Harden, automate, deploy, demo

**Goal:** One 5-minute demo that looks like a real product slice.

### Build
- Light JWT auth (login + protect one or two routes)
- n8n flow: when `action === "CHARGE"` → email / Discord / Slack message
- Deploy:
  - Frontend → Vercel
  - API → Render (or similar)
- README runbook: how to run locally + demo steps
- Resilience note: what happens if carbon/price API is down (use mock)
- Group demo day + short retro

### Role focus
| Role | Week 4 tasks |
| :--- | :--- |
| DevOps | Production/staging deploy + CI on PR |
| Automation | Working n8n alert on CHARGE |
| Frontend | Polish UI; seed/demo-friendly defaults |
| Backend | Auth lite + stable simulator for demo |
| AI | Guardrails check (prompt injection smoke test) |
| QA | Full Postman runbook for demo day |
| Data / Realtime | Confirm stream stable for 5+ minutes |
| PO / SM | Lead demo; collect “what we learned” |

### Done when
- [ ] Staging/production URLs work
- [ ] Full demo path runs without mentor laptop-only hacks
- [ ] n8n alert works (or clearly marked as stretch if blocked)
- [ ] Curriculum topics touched are listed in the retro

### Final demo script (5 steps)
1. Open dashboard — 5 EVs with live-updating battery  
2. Show price + carbon charts  
3. Pick a low-battery van — click **Ask AI**  
4. AI returns `CHARGE` (or `WAIT`) + reason  
5. Optional: n8n message arrives  

---

## Weekly rhythm (suggested)

| Day | Activity |
| :--- | :--- |
| **Mon** | Sprint goal + teach/lab for the week’s theme |
| **Wed** | Mid-week mini-demo (vertical slice) |
| **Thu** | Cross-role PR review hour |
| **Fri** | Homework check + curriculum tick-off |

**Definition of Done (every ticket)**
- PR reviewed by someone in another role
- Postman/OpenAPI updated if API changed
- No secrets in git
- Demo-friendly (works with seed data)

---

## Curriculum coverage across the 4 weeks

| Topic | Main week |
| :--- | :--- |
| Vibe Coding & Architecture | Week 1 |
| Security & Secrets | Week 1 + 4 |
| Git & DevOps | Weeks 1 + 4 |
| API Testing & Docs | Weeks 1–2 |
| Telemetry & Real-Time | Week 2 |
| APIs & Live Data | Week 3 |
| Frontend & Analytics | Week 3 |
| Agentic AI & LLMs | Week 3 |
| Prompting & Outputs | Week 3 |
| AI Safety & Cost Control | Week 3–4 |
| RAG & Knowledge Bases | Week 3 stretch / Week 4 |
| Workflow Automation | Week 4 |
| Problem Solving & Methodology | All weeks (standups, retros, resilience) |

---

## Success criteria for the prototype

The project is a success if beginners can demo:

> “These 5 cars are simulated. Their batteries update live. We combine that with real energy and carbon data. An AI agent recommends whether each vehicle should charge now — and we show that decision on a dashboard.”
