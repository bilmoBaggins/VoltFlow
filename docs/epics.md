# VoltFlow — Epic Backlog, Stories & 1-Month Delivery Plan

**Product:** VoltFlow EV Fleet Charging Prototype  
**Duration:** 1 month (4 weeks / 4 sprints)  
**Team:** 8 beginner interns (role-based) + mentor as sponsor  
**Document owner:** Product Owner / Scrum Master  
**Status:** Ready for sprint planning  
**Related docs:** `fourWeekPrototypePlan.md`, `internCourseTopicToCover.md`, `fleetcharging.md`

---

## 1. Product summary (PM view)

### Problem
Fleet managers cannot see EV battery state, energy cost, and carbon impact in one place — and have no guidance on **when** to charge.

### Solution (MVP / prototype)
Simulate 5 EVs (no real cars), stream fake telemetry, pull real UK price + carbon data, and use an AI agent to recommend `CHARGE` / `WAIT` / `STOP` on a simple dashboard. Optionally alert via n8n when AI says `CHARGE`.

### One-line pitch
> Fake fleet + live grid data + AI charge advice → one demoable VoltFlow portal in 30 days.

### In scope (Must ship)
- 5 simulated EVs with rule-based random telemetry
- REST + realtime stream (WebSocket or SSE)
- National Grid Carbon + Octopus Agile (with mock fallback)
- AI `/ai/decide` with strict JSON validation + token budget log
- Fleet dashboard (table + charts + Ask AI)
- JWT lite auth, `.env` secrets, CI, deploy (Vercel + Render)
- Postman + OpenAPI
- n8n CHARGE alert
- Demo day + runbook

### Out of scope (Explicitly deferred)
- Real chargers / OCPP / hardware
- Real GPS tracking / route optimization ML
- Payments / reimbursement ledger (full)
- Mobile apps
- Multi-tenant enterprise RBAC
- Production SLA / 24×7 ops

### Stretch (only if Must is green by Day 22)
- OpenChargeMap nearby chargers
- Tiny RAG over EV manuals
- Persist decision history
- Home vs depot vs public session labels in UI

---

## 2. Success criteria (launch definition)

| # | Criterion | How we verify |
| :--- | :--- | :--- |
| S1 | 5 EVs listed and updating live for ≥5 minutes | Demo + QA checklist |
| S2 | Price + carbon charts render (live or mock fallback) | UI + network tab |
| S3 | Ask AI returns valid JSON decision with reason | Postman + UI |
| S4 | Staging URLs work without mentor laptop | Vercel + Render links |
| S5 | No secrets in git; CI green on main | GitHub Actions |
| S6 | n8n fires on CHARGE (or documented blocker) | Screenshot / message |
| S7 | 5-step demo completed in ≤10 minutes | Demo day recording |
| S8 | Curriculum topics mapped & ticked | Retro checklist |

**Go / No-Go for Demo Day (Day 28):** S1–S5 mandatory. S6 can be yellow. S7–S8 required.

---

## 3. Timeline overview (1 month)

Assume **start Monday = Day 1**. Adjust calendar dates when kickoff is fixed.

| Sprint | Days | Theme | Epic focus | Exit milestone |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 0 / Kickoff** | Day 1–2 | Align & scaffold | E0, E1 start | Roles assigned, board live, repo cloned |
| **Sprint 1** | Day 1–7 | Foundations + fleet API | E0, E1, E2, E9 | `GET /vehicles` = 5 cars |
| **Sprint 2** | Day 8–14 | Live telemetry + UI | E3, E6, E9 | Batteries move on screen |
| **Sprint 3** | Day 15–21 | Grid + AI + charts | E4, E5, E7, E8 start | Ask AI works end-to-end |
| **Sprint 4** | Day 22–28 | Harden, automate, launch | E8, E10, E11?, E12 | Demo Day + ship |

### Cadence (every week)
| Day | Event | Owner |
| :--- | :--- | :--- |
| Mon | Sprint planning (45–60m) + teach/lab | PO/SM |
| Daily | Async standup (yesterday / today / blocker) | All |
| Wed | Mid-sprint vertical demo (15m) | PO + feature owners |
| Thu | Cross-role PR review hour | All |
| Fri | Homework / story acceptance + curriculum tick | PO + QA |

### Critical path (do not slip)
```
Repo/CI → Vehicles API → Telemetry sim → Stream → Fleet UI
                ↘ Price/Carbon clients → AI decide → Charts/Ask AI → Deploy → Demo
                                              ↘ n8n CHARGE alert
```

### Parallel start rule (important)
**Everyone works from Week 1.** Dependencies only delay *wiring pieces together*, not *starting*.

| Rule | Meaning |
| :--- | :--- |
| Build against **contracts** | Freeze API/JSON shapes Day 1–3; FE/AI/QA use mocks until BE is ready |
| Prefer **stubs & fixtures** | Fake `GET /vehicles`, fake grid JSON, fake AI JSON are valid Week 1 deliverables |
| Integrate on **Wed demos** | Mid-week is when chains meet — not Monday morning |
| No idle roles | If blocked on another PR, pull the next “prep” task in your epic |

---

## 3b. Week 1 — everyone starts (parallel work matrix)

Even with a dependency chain, **all 8 roles have real Day-1 work**.

| Role | Week 1 — start now (not blocked) | Waits on (later in week / Week 2) |
| :--- | :--- | :--- |
| **PO / SM** | Board, backlog, DoD, PR template, standup cadence, curriculum checklist, demo vision | Nothing — unblocks everyone |
| **DevOps** | Repo, `.gitignore`, `.env.example`, CI lint, secret scan, README, hello deploy | FE/BE apps existing (same-day pairing) |
| **Backend** | Vehicle schema, seed 5 cars, `GET /vehicles`, `GET /health`, CORS | Repo scaffold (hours, not days) |
| **QA** | Bug template, Postman empty collection, status-code cheat sheet, OpenAPI checklist | Hits real API Day 4–5; until then write tests against **mock JSON** |
| **Frontend** | App shell, Fleet page layout, table UI with **hardcoded 5 cars**, env `VITE_API_URL` | Swap hardcoded → real API when BE merges (Day 5–7) |
| **Data / Realtime** | Telemetry field design doc, tick-rule table, choose WS vs SSE, stub `grid` mock JSON files | Stream impl Week 2; carbon/price clients can be **spiked** Week 1 with mocks |
| **AI Engineer** | `ChargeDecision` JSON schema, system prompt draft, few-shot examples, token budget spreadsheet, `AI_MOCK` fixture responses | Live `/ai/decide` Week 3; Week 1 deliverable = **schema + fixtures** |
| **Automation** | n8n account, Discord/email channel, CHARGE webhook **payload draft**, env var names | Real CHARGE events Week 3–4; Week 1 = **contract + sandbox workflow** |

### Week 1 “contract freeze” (so parallel work is safe)
By **Day 3**, PO + BE + AI publish these in `/docs` or README and nobody changes them without a PR:

1. Vehicle JSON shape (`ev-01` … `ev-05` fields)  
2. ChargeDecision JSON (`action`, `reason`, `confidence`)  
3. Telemetry tick rules (charging / driving / idle)  
4. List of env vars in `.env.example`  

### Example Week 1 flow (same days, different lanes)
```
Day 1–2  PO board + DO repo + ALL clone
Day 2–3  BE schema/seed     FE mock table     AI schema/prompt
         QA Postman stubs   DR tick design    AU n8n + payload
Day 4–5  BE GET /vehicles   QA hit real API   FE still on mocks OK
Day 5–7  FE wire real API   DO hello deploy   Wed mini-demo: list 5 cars
```

**Bottom line:** Chain work means “integrate in order,” not “wait your turn to start.”

---

## 4. Roles & RACI (summary)

| Role | Abbrev | Primary epics |
| :--- | :--- | :--- |
| PO / Scrum Master | PO | E0, E12 |
| Backend Engineer | BE | E2, E3, E8 |
| Data / Realtime Engineer | DR | E3, E4 |
| AI Engineer | AI | E5, E11 |
| Frontend Engineer | FE | E6, E7 |
| QA / API Tester | QA | E9 (all epics acceptance) |
| DevOps / Platform | DO | E1, deploy parts of E12 |
| Automation / Integrations | AU | E10, grid keys support |

**Pairing rule:** Every PR reviewed by a different role.  
**Definition of Done (global):**
- [ ] Acceptance criteria met
- [ ] PR approved by other role
- [ ] OpenAPI/Postman updated if API changed
- [ ] No secrets committed
- [ ] Works with seed/demo data
- [ ] Story tagged with curriculum topic(s)

---

## 5. Epic catalogue

| ID | Epic | Priority | Sprint | Story points (guide) |
| :--- | :--- | :--- | :--- | :--- |
| **E0** | Delivery Governance & Agile Setup | P0 | 0–1 | 5 |
| **E1** | Platform, Repo & CI/CD Foundation | P0 | 1 + 4 | 13 |
| **E2** | Fleet Vehicle Registry API | P0 | 1 | 8 |
| **E3** | EV Telemetry Simulator & Realtime Stream | P0 | 2 | 13 |
| **E4** | Live Grid Data (Price + Carbon) | P0 | 3 | 8 |
| **E5** | AI Charge Decision Agent | P0 | 3 | 13 |
| **E6** | Fleet Dashboard UI (Core) | P0 | 2–3 | 13 |
| **E7** | Analytics Charts (Price / Carbon / Battery) | P0 | 3 | 8 |
| **E8** | Security, Secrets & JWT Auth | P0 | 1 + 4 | 8 |
| **E9** | API Testing, OpenAPI & Quality Gates | P0 | 1–4 | 8 |
| **E10** | n8n Workflow Automation (CHARGE alert) | P1 | 4 | 5 |
| **E11** | RAG Knowledge Base (EV manuals) | P2 Stretch | 3–4 | 8 |
| **E12** | Launch, Runbook, Demo Day & Retro | P0 | 4 | 8 |
| **E13** | OpenChargeMap / Nearby Chargers | P2 Stretch | 4 | 5 |

**Total guide points ~113** — for 8 beginners over 4 weeks this is intentionally lean; cut stretch first if behind.

---

# EPIC E0 — Delivery Governance & Agile Setup

**Goal:** Team can plan, track, and accept work like a real squad.  
**Owner:** PO | **Sprint:** Day 1–2 (ongoing)  
**Curriculum:** Problem Solving & Methodology · Agile/SDLC

### Story E0-S1 — Kickoff & role assignment
**As a** team member, **I want** a clear role and board, **so that** I know what to build.

**Acceptance**
- [ ] 8 roles assigned and published
- [ ] Slack/Discord + GitHub access confirmed
- [ ] Working agreements agreed (PR size, review SLA 24h)

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E0-S1-T1 | Create project charter (this doc link + goals) | PO | 2h | Day 1 |
| E0-S1-T2 | Assign roles + pairing map | PO | 1h | Day 1 |
| E0-S1-T3 | Create GitHub Project / board columns | PO | 1h | Day 1 |
| E0-S1-T4 | Schedule Mon/Wed/Thu/Fri rituals | PO | 0.5h | Day 1 |
| E0-S1-T5 | Confirm VS Code + Claude Code + GitHub for all | DO | 1h | Day 2 |

### Story E0-S2 — Backlog ready for Sprint 1
**As a** developer, **I want** prioritized Sprint 1 stories, **so that** I can pull work.

**Acceptance**
- [ ] Sprint 1 stories refined with AC
- [ ] DoD published in README or wiki

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E0-S2-T1 | Import epics/stories into board | PO | 2h | Day 1 |
| E0-S2-T2 | Write global DoD + PR template | PO | 1h | Day 2 |
| E0-S2-T3 | Create issue labels (epic, role, curriculum, stretch) | PO | 0.5h | Day 2 |
| E0-S2-T4 | Sprint 1 planning meeting | PO | 1h | Day 2 |

### Story E0-S3 — Curriculum tracking
**As a** mentor, **I want** topics ticked weekly, **so that** training goals are met.

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E0-S3-T1 | Curriculum checklist board (13 topics) | PO | 1h | Day 2 |
| E0-S3-T2 | Friday tick-off ritual each week | PO | 0.5h/wk | Fri |

---

# EPIC E1 — Platform, Repo & CI/CD Foundation

**Goal:** One monorepo runs locally and deploys; CI blocks broken/secret PRs.  
**Owner:** DO | **Sprint:** 1 (foundation), 4 (prod harden)  
**Curriculum:** Git & DevOps · Vibe Coding & Architecture · Security & Secrets

### Story E1-S1 — Monorepo scaffold
**As a** developer, **I want** `apps/web` + `apps/api` (or equivalent), **so that** FE/BE share one repo.

**Acceptance**
- [ ] `npm/pnpm install` + run scripts documented
- [ ] Hello API health route + Hello web page

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E1-S1-T1 | Create monorepo structure | DO + BE | 3h | Day 2 |
| E1-S1-T2 | Add README quickstart | DO | 1h | Day 2 |
| E1-S1-T3 | Add `.gitignore` (node, .env, dist) | DO | 0.5h | Day 2 |
| E1-S1-T4 | FE Hello page via VS Code + Claude Code | FE | 2h | Day 3 |

### Story E1-S2 — Environment & secrets baseline
**Acceptance**
- [ ] `.env.example` lists all keys (empty values)
- [ ] Real `.env` never committed
- [ ] Secret scan in CI (gitleaks or GitHub secret scanning)

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E1-S2-T1 | Author `.env.example` (LLM, Octopus, JWT, n8n) | DO + AU | 1h | Day 3 |
| E1-S2-T2 | Add secret-scan workflow | DO | 2h | Day 3 |
| E1-S2-T3 | Team secrets vault process (1Password/shared mentor) | DO | 1h | Day 3 |

### Story E1-S3 — CI pipeline
**Acceptance**
- [ ] On PR: lint (+ unit test placeholder)
- [ ] Main protected by required checks (if org allows)

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E1-S3-T1 | GitHub Actions lint workflow | DO | 3h | Day 4 |
| E1-S3-T2 | Branch protection notes for mentor | DO | 0.5h | Day 4 |
| E1-S3-T3 | Fix first CI failure with team | DO | 2h | Day 5 |

### Story E1-S4 — Staging deploy
**Acceptance**
- [ ] API on Render (or similar)
- [ ] Web on Vercel
- [ ] URLs in README

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E1-S4-T1 | Deploy hello API | DO | 2h | Day 6–7 |
| E1-S4-T2 | Deploy hello web | DO | 2h | Day 6–7 |
| E1-S4-T3 | Wire env vars in hosts | DO | 1h | Day 7 |
| E1-S4-T4 | Re-deploy full app Week 4 | DO | 4h | Day 24–26 |

---

# EPIC E2 — Fleet Vehicle Registry API

**Goal:** Canonical list of 5 simulated EVs.  
**Owner:** BE | **Sprint:** 1  
**Curriculum:** APIs · Architecture

### Data contract (freeze Day 3)

```json
{
  "id": "ev-01",
  "name": "Van A",
  "batteryPercent": 62,
  "chargeRateKw": 0,
  "status": "idle",
  "temperatureC": 31,
  "siteType": "depot",
  "location": {
    "lat": 51.5074,
    "lng": -0.1278,
    "label": "London Depot",
    "postcode": "SW1A 1AA",
    "gridRegion": "C"
  },
  "updatedAt": "2026-07-24T12:00:00Z"
}
```

`status`: `idle` | `charging` | `driving`  
`siteType`: `depot` | `home` | `public`  
`location`: **fake GPS** every EV must send (simulator can nudge lat/lng slightly while `driving`)  
`location.gridRegion`: Octopus GSP letter (`A`–`P`) so Grid API prices match where the van “is”

### Story E2-S1 — Seed 5 vehicles
**Acceptance**
- [ ] Fixed IDs `ev-01` … `ev-05`
- [ ] Seed script or bootstrap on server start

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E2-S1-T1 | Define TypeScript/JSON schema for Vehicle | BE + AI | 1h | Day 3 |
| E2-S1-T2 | Implement in-memory or DB store | BE | 3h | Day 3–4 |
| E2-S1-T3 | Seed 5 named vehicles | BE | 1h | Day 4 |

### Story E2-S2 — List & get endpoints
**Acceptance**
- [ ] `GET /vehicles` → 200 + array length 5
- [ ] `GET /vehicles/:id` → 200 or 404
- [ ] CORS enabled for local FE

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E2-S2-T1 | Implement `GET /vehicles` | BE | 2h | Day 4 |
| E2-S2-T2 | Implement `GET /vehicles/:id` | BE | 1h | Day 4 |
| E2-S2-T3 | CORS + health `GET /health` | BE | 1h | Day 5 |
| E2-S2-T4 | OpenAPI paths for vehicles | BE + QA | 2h | Day 5 |

### Story E2-S3 — Status update helper (for sim)
**Acceptance**
- [ ] Internal function can set status/location for simulator

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E2-S3-T1 | `PATCH /vehicles/:id/status` (internal/demo) | BE | 2h | Day 6 |
| E2-S3-T2 | QA tests for 400 invalid status | QA | 1h | Day 6 |

---

# EPIC E3 — EV Telemetry Simulator & Realtime Stream

**Goal:** Batteries move with believable rules; clients get live updates.  
**Owner:** BE + DR | **Sprint:** 2  
**Curriculum:** Telemetry & Real-Time · Problem Solving (async)

### Simulation rules (freeze Day 8)
| Status | Battery change each tick (3–5s) | chargeRateKw |
| :--- | :--- | :--- |
| `charging` | +1 to +3 (cap 100) | 7.2 (or random 3–11) |
| `driving` | −1 to −2 (floor 0) | 0 |
| `idle` | −1 to +1 (clamp 0–100) | 0 |
| Any | `temperatureC` mild noise ±1 | — |

Optional: randomly flip status every N ticks for demo variety (document seed).

### Story E3-S1 — Telemetry tick engine
**Acceptance**
- [ ] Server updates all 5 vehicles every 3–5s
- [ ] `updatedAt` changes each tick

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E3-S1-T1 | Implement tick loop with rules | BE | 4h | Day 8–9 |
| E3-S1-T2 | Config `TICK_MS` via env | BE | 0.5h | Day 9 |
| E3-S1-T3 | Unit test clamp 0–100 | BE + QA | 2h | Day 10 |

### Story E3-S2 — Telemetry read API
**Acceptance**
- [ ] `GET /vehicles/:id/telemetry` returns latest snapshot

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E3-S2-T1 | Implement telemetry endpoint | BE | 2h | Day 9 |
| E3-S2-T2 | Postman cases | QA | 1h | Day 10 |

### Story E3-S3 — Realtime stream
**Acceptance**
- [ ] `WS /stream` (or `SSE /events`) pushes vehicle updates
- [ ] Client reconnect guidance documented

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E3-S3-T1 | Choose WS vs SSE (recommend SSE if beginners struggle) | DR | 1h | Day 8 |
| E3-S3-T2 | Implement stream broadcast on tick | DR | 5h | Day 9–11 |
| E3-S3-T3 | FE reconnect state contract | DR + FE | 2h | Day 11 |
| E3-S3-T4 | Stability test 5+ minutes | QA + DR | 1h | Day 13 |

### Story E3-S4 — Demo control (nice-to-have)
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E3-S4-T1 | Force `ev-03` to low battery for AI demo | BE | 1h | Day 14 |
| E3-S4-T2 | Document demo reset script | BE | 1h | Day 14 |

---

# EPIC E4 — Live Grid Data (Price + Carbon)

**Goal:** Real (or mocked) energy price + carbon intensity for AI + charts.  
**Owner:** DR | **Sprint:** 3  
**Curriculum:** APIs & Live Data · cloud resilience

### Story E4-S1 — Carbon Intensity client
**Acceptance**
- [ ] Fetch current UK carbon intensity
- [ ] Normalize to `{ gramsPerKwh, index, fetchedAt }`
- [ ] Fallback mock if API fails

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E4-S1-T1 | Integrate National Grid Carbon API | DR | 3h | Day 15 |
| E4-S1-T2 | Mock fixture JSON | DR | 1h | Day 15 |
| E4-S1-T3 | `GET /grid/carbon` facade | DR + BE | 2h | Day 16 |
| E4-S1-T4 | Postman + failure simulation | QA | 1h | Day 16 |

### Story E4-S2 — Octopus Agile price client
**Acceptance**
- [ ] Half-hourly (or simplified) prices available
- [ ] Fallback CSV/mock if key/rate-limit fails

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E4-S2-T1 | Octopus Agile integration | DR + AU | 4h | Day 15–16 |
| E4-S2-T2 | Normalize `{ gbpPerKwh, periodStart, periodEnd }` | DR | 2h | Day 16 |
| E4-S2-T3 | `GET /grid/price` facade | DR + BE | 2h | Day 17 |
| E4-S2-T4 | Cache responses (e.g. 5–30 min) to save rate limits | DR | 2h | Day 17 |

### Story E4-S3 — Combined grid snapshot for AI
**Acceptance**
- [ ] `GET /grid/snapshot` returns price + carbon together

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E4-S3-T1 | Implement snapshot endpoint | DR | 2h | Day 17 |
| E4-S3-T2 | Document thresholds for “high price” / “dirty carbon” | AI + DR | 1h | Day 17 |

---

# EPIC E5 — AI Charge Decision Agent

**Goal:** EV + AI together — decide charge action from vehicle + grid.  
**Owner:** AI | **Sprint:** 3  
**Curriculum:** Agentic AI · Prompting & Outputs · AI Safety & Cost

### Decision contract (freeze Day 15)

```json
{
  "action": "CHARGE",
  "reason": "Battery 22% and price is low",
  "confidence": 0.86
}
```

Policy (encode in system prompt + few-shot):
- Battery < 30% → prefer CHARGE  
- Battery > 80% → prefer STOP/WAIT  
- High price + battery > 40% → WAIT  
- Dirty carbon + battery > 40% → WAIT  
- Low price + clean carbon + battery < 70% → CHARGE  

### Story E5-S1 — Schema + validation
**Acceptance**
- [ ] Zod/JSON Schema rejects invalid actions
- [ ] Invalid LLM output retried ≤3 times then safe fallback `WAIT`

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E5-S1-T1 | Define ChargeDecision schema | AI | 2h | Day 15 |
| E5-S1-T2 | Validator + unit tests | AI + QA | 2h | Day 16 |
| E5-S1-T3 | Safe fallback policy | AI | 1h | Day 16 |

### Story E5-S2 — Prompt + LLM call
**Acceptance**
- [ ] System prompt + few-shot examples in repo (no secrets)
- [ ] Uses env LLM key
- [ ] Mock mode for CI without calling LLM

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E5-S2-T1 | Write system prompt + 5 few-shots | AI | 3h | Day 16–17 |
| E5-S2-T2 | LLM client wrapper | AI | 3h | Day 17 |
| E5-S2-T3 | `AI_MOCK=true` deterministic responses | AI | 2h | Day 17 |
| E5-S2-T4 | Shared $10 budget tracker (sheet or `/ai/usage`) | AI | 2h | Day 18 |

### Story E5-S3 — `POST /ai/decide`
**Acceptance**
- [ ] Body includes vehicleId or snapshot + uses grid snapshot
- [ ] Returns validated JSON
- [ ] Optionally stores last decision on vehicle

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E5-S3-T1 | Implement endpoint | AI + BE | 4h | Day 18 |
| E5-S3-T2 | Persist `lastDecision` on vehicle | BE | 2h | Day 19 |
| E5-S3-T3 | Emit event for n8n when CHARGE | AI + AU | 2h | Day 19–20 |
| E5-S3-T4 | Postman happy/unhappy paths | QA | 2h | Day 19 |

### Story E5-S4 — Guardrails
**Acceptance**
- [ ] Loop/retry cap documented
- [ ] Basic prompt-injection smoke test recorded

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E5-S4-T1 | Injection test cases (3) | AI + QA | 2h | Day 20 |
| E5-S4-T2 | Token log review with mentor | AI | 1h | Day 21 |

---

# EPIC E6 — Fleet Dashboard UI (Core)

**Goal:** Managers see fleet and ask AI.  
**Owner:** FE | **Sprint:** 2–3  
**Curriculum:** Frontend · Vibe Coding

### Story E6-S1 — App shell & fleet table
**Acceptance**
- [ ] Fleet page lists 5 vehicles with key fields
- [ ] Loading / error / empty states

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E6-S1-T1 | App layout + routing | FE | 3h | Day 8–9 |
| E6-S1-T2 | Fetch `GET /vehicles` table | FE | 3h | Day 9–10 |
| E6-S1-T3 | Status/location badges | FE | 2h | Day 10 |
| E6-S1-T4 | Wire API base URL from env | FE + DO | 1h | Day 10 |

### Story E6-S2 — Live updates in UI
**Acceptance**
- [ ] Battery updates without full reload
- [ ] Shows “reconnecting…” on drop

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E6-S2-T1 | Subscribe to stream | FE + DR | 4h | Day 11–12 |
| E6-S2-T2 | Reconnect UX | FE | 2h | Day 12 |
| E6-S2-T3 | 30s screen-capture homework artifact | FE | 0.5h | Day 14 |

### Story E6-S3 — Vehicle detail + Ask AI
**Acceptance**
- [ ] Select vehicle → detail panel
- [ ] Ask AI button calls `/ai/decide`
- [ ] Shows action, reason, confidence

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E6-S3-T1 | Detail panel UI | FE | 3h | Day 18 |
| E6-S3-T2 | Ask AI integration | FE + AI | 3h | Day 19 |
| E6-S3-T3 | Color action (CHARGE green / WAIT amber / STOP red) | FE | 1h | Day 19 |
| E6-S3-T4 | Demo polish pass | FE | 3h | Day 25 |

---

# EPIC E7 — Analytics Charts

**Goal:** Visualize tariff, carbon, and battery over time.  
**Owner:** FE | **Sprint:** 3  
**Curriculum:** Frontend & Analytics

### Story E7-S1 — Price chart
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E7-S1-T1 | Choose Recharts/Chart.js | FE | 0.5h | Day 17 |
| E7-S1-T2 | Price series chart from `/grid/price` | FE | 3h | Day 18 |
| E7-S1-T3 | Caption “cheapest window” helper text | FE | 1h | Day 19 |

### Story E7-S2 — Carbon chart
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E7-S2-T1 | Carbon chart | FE | 2h | Day 18 |
| E7-S2-T2 | Dirty/clean legend | FE | 1h | Day 19 |

### Story E7-S3 — Battery charge cycle chart
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E7-S3-T1 | Keep last N telemetry points client-side | FE + DR | 3h | Day 19–20 |
| E7-S3-T2 | Battery % over time for selected EV | FE | 2h | Day 20 |

---

# EPIC E8 — Security, Secrets & JWT Auth

**Goal:** Basic access control and secret hygiene.  
**Owner:** BE + DO | **Sprint:** 1 (secrets), 4 (JWT)  
**Curriculum:** Security & Secrets

### Story E8-S1 — Secrets hygiene (Sprint 1)
Covered partly in E1-S2 — track acceptance there.

### Story E8-S2 — JWT login lite
**Acceptance**
- [ ] `POST /auth/login` returns token for demo user
- [ ] Protect at least `GET /vehicles` and `POST /ai/decide`
- [ ] FE stores token and sends `Authorization: Bearer`

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E8-S2-T1 | Demo user seed + password hash | BE | 2h | Day 22 |
| E8-S2-T2 | Login + JWT issue/verify middleware | BE | 4h | Day 22–23 |
| E8-S2-T3 | Protect routes | BE | 2h | Day 23 |
| E8-S2-T4 | FE login page | FE | 3h | Day 23–24 |
| E8-S2-T5 | Postman auth flow | QA | 1h | Day 24 |
| E8-S2-T6 | Intern writeup: “JWT in my words” (training) | BE/All | 0.5h | Day 24 |

---

# EPIC E9 — API Testing, OpenAPI & Quality Gates

**Goal:** Every endpoint documented and testable before FE depends on it.  
**Owner:** QA | **Sprint:** 1–4 continuous  
**Curriculum:** API Testing & Docs

### Story E9-S1 — OpenAPI/Swagger live
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E9-S1-T1 | Swagger UI mounted on API | BE + QA | 2h | Day 5 |
| E9-S1-T2 | Keep spec updated each sprint | QA | ongoing | — |

### Story E9-S2 — Postman collection master
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E9-S2-T1 | Collection v1 (health, vehicles) | QA | 2h | Day 5 |
| E9-S2-T2 | Add telemetry + stream notes | QA | 2h | Day 12 |
| E9-S2-T3 | Add grid + AI + auth | QA | 3h | Day 20 |
| E9-S2-T4 | Demo-day runbook export | QA | 2h | Day 26 |

### Story E9-S3 — Bug triage
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E9-S3-T1 | Bug template (steps, expected, actual) | QA + PO | 1h | Day 4 |
| E9-S3-T2 | Severity labels S1–S3 | QA | 0.5h | Day 4 |
| E9-S3-T3 | Pre-demo full regression | QA | 3h | Day 26–27 |

---

# EPIC E10 — n8n Workflow Automation

**Goal:** When AI says CHARGE, notify ops (email/Discord/Slack).  
**Owner:** AU | **Sprint:** 4  
**Curriculum:** Workflow Automation

### Story E10-S1 — Webhook contract
**Acceptance**
- [ ] Documented JSON payload for CHARGE events

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E10-S1-T1 | Payload spec (vehicleId, action, reason, ts) | AU + AI | 1h | Day 12 (draft), Day 22 (final) |
| E10-S1-T2 | Backend `POST` to n8n webhook URL from env | AU + BE | 2h | Day 23 |

### Story E10-S2 — n8n flow live
**Acceptance**
- [ ] CHARGE → message received
- [ ] Screenshot of n8n canvas in docs

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E10-S2-T1 | Create n8n workflow | AU | 3h | Day 23–24 |
| E10-S2-T2 | Email or Discord/Slack node | AU | 2h | Day 24 |
| E10-S2-T3 | E2E test with Ask AI | AU + QA | 2h | Day 25 |
| E10-S2-T4 | Failure path if n8n down (log + don’t crash API) | AU + BE | 2h | Day 25 |

### Story E10-S3 — B2B PO stretch
Optional: format message as mini Purchase Order text for curriculum story.

---

# EPIC E11 — RAG Knowledge Base (Stretch / Curriculum)

**Goal:** Ask vehicle/charger questions with citations; reduce hallucination.  
**Owner:** AI | **Sprint:** 3–4 if S1–S5 on track  
**Curriculum:** RAG & Knowledge Bases

### Story E11-S1 — Index short manuals
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E11-S1-T1 | Add 2–3 short `.txt` EV/charger manuals | AI | 1h | Day 20 |
| E11-S1-T2 | Embeddings + Qdrant/Pinecone (or local) | AI | 4h | Day 21–23 |
| E11-S1-T3 | `POST /ai/ask` with cited chunk | AI | 4h | Day 23–24 |
| E11-S1-T4 | Simple FE ask box | FE | 2h | Day 25 |

**Cut rule:** If Day 22 Ask AI core is not stable, park E11 entirely.

---

# EPIC E12 — Launch, Runbook, Demo Day & Retro

**Goal:** Ship and present.  
**Owner:** PO | **Sprint:** 4  
**Curriculum:** Problem Solving & Methodology · Git & DevOps

### Story E12-S1 — Runbook & README
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E12-S1-T1 | Local run steps | DO | 2h | Day 24 |
| E12-S1-T2 | Env var table | DO | 1h | Day 24 |
| E12-S1-T3 | Demo reset script docs | BE | 1h | Day 25 |
| E12-S1-T4 | Resilience note (API down → mock) | DR | 1h | Day 25 |

### Story E12-S2 — Demo Day
**Acceptance**
- [ ] 5-step script rehearsed twice
- [ ] Recording or live audience sign-off

**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E12-S2-T1 | Finalize 5-step demo script | PO | 1h | Day 21 (draft), Day 26 (final) |
| E12-S2-T2 | Rehearsal #1 | All | 1h | Day 26 |
| E12-S2-T3 | Fix P0 bugs from rehearsal | All | 4h | Day 26–27 |
| E12-S2-T4 | Rehearsal #2 | All | 1h | Day 27 |
| E12-S2-T5 | Demo Day delivery | PO leads | 1h | Day 28 |
| E12-S2-T6 | Written retro (1 page) | Each | 1h | Day 28 |

### Demo script (locked)
1. Login → open dashboard (5 EVs live)  
2. Show price + carbon charts  
3. Select low-battery van → Ask AI  
4. Show CHARGE/WAIT JSON reason  
5. Show n8n notification (or explain stretch status)  

---

# EPIC E13 — OpenChargeMap (Stretch)

**Owner:** DR + FE | **Sprint:** 4 if capacity  
**Curriculum:** APIs & Live Data (maps)

### Story E13-S1 — Nearby chargers map
**Tasks**
| ID | Task | Owner | Est | Due |
| :--- | :--- | :--- | :--- | :--- |
| E13-S1-T1 | OpenChargeMap client | DR | 3h | Day 24 |
| E13-S1-T2 | Map with ≥5 pins | FE | 4h | Day 25 |
| E13-S1-T3 | Pin click → connector info | FE | 2h | Day 26 |

---

## 6. Sprint plans (story pull lists)

### Sprint 1 (Day 1–7) — Foundations
**Sprint goal:** *Five vehicles exist in API; team ships via PRs; CI + secrets baseline.*

| Pull | Stories |
| :--- | :--- |
| Must | E0-S1, E0-S2, E0-S3, E1-S1, E1-S2, E1-S3, E2-S1, E2-S2, E9-S1, E9-S2-T1, E8-S1 |
| Should | E1-S4 (hello deploy), E2-S3 |
| Could | — |

**Sprint 1 exit checklist**
- [ ] `GET /vehicles` = 5  
- [ ] Postman shared  
- [ ] CI lint green  
- [ ] `.env.example` present  

### Sprint 2 (Day 8–14) — Telemetry + UI
**Sprint goal:** *Batteries move live on the dashboard.*

| Pull | Stories |
| :--- | :--- |
| Must | E3-S1, E3-S2, E3-S3, E6-S1, E6-S2, E9-S2-T2 |
| Should | E3-S4, E10-S1 draft |
| Could | — |

**Exit checklist**
- [ ] Tick engine live  
- [ ] Stream connected in UI  
- [ ] Mid-week demo recorded  

### Sprint 3 (Day 15–21) — Grid + AI + Charts
**Sprint goal:** *Ask AI returns a valid charge decision using live/mocks grid data.*

| Pull | Stories |
| :--- | :--- |
| Must | E4-S1, E4-S2, E4-S3, E5-S1, E5-S2, E5-S3, E6-S3, E7-S1, E7-S2, E7-S3 |
| Should | E5-S4 |
| Could | E11 start |

**Exit checklist**
- [ ] Charts visible  
- [ ] `/ai/decide` validated  
- [ ] Token log exists  
- [ ] Demo script draft  

### Sprint 4 (Day 22–28) — Launch
**Sprint goal:** *Deployed, secured, automated alert, Demo Day pass.*

| Pull | Stories |
| :--- | :--- |
| Must | E8-S2, E1-S4-T4, E10-S1, E10-S2, E9-S2-T4, E9-S3-T3, E12-S1, E12-S2 |
| Should | E5-S4 complete, E10-S3 |
| Could | E11, E13 |

**Exit checklist**
- [ ] Go/No-Go S1–S5 green  
- [ ] Rehearsals done  
- [ ] Demo Day complete  
- [ ] Retros submitted  

---

## 7. Risk register

| ID | Risk | Impact | Likelihood | Mitigation | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| R1 | Beginners blocked on WebSockets | High | Med | Prefer SSE; mentor spike Day 8 | DR |
| R2 | LLM budget burns early | High | Med | Mock mode; $10 hard cap; cache | AI |
| R3 | Octopus API key/rate limits | Med | Med | Mock CSV fallback always | DR |
| R4 | Scope creep (LogiNext features) | High | High | PO veto; stretch only E11/E13 | PO |
| R5 | Integration hell Week 4 | High | Med | Wed vertical demos each week | PO |
| R6 | Secrets leaked in PR | High | Med | CI secret scan; mentor review | DO |
| R7 | n8n account/email limits | Low | Med | Discord webhook alternative | AU |
| R8 | Uneven skills | Med | High | Pairing + Thu review hour | PO |
| R9 | Deploy broken Day 27 | High | Med | Hello deploy Week 1; freeze Day 26 | DO |

---

## 8. Dependencies & external accounts (Day 1 checklist)

| Item | Needed by | Owner |
| :--- | :--- | :--- |
| GitHub org/repo | Day 1 | DO |
| VS Code + Claude Code access | Day 1 | All |
| Vercel + Render accounts | Day 6 | DO |
| OpenAI/Claude shared key ($10) | Day 15 | AI + mentor |
| Octopus API key (or mock-only decision) | Day 15 | DR |
| n8n cloud/self-host | Day 12 | AU |
| Discord/Slack webhook or email SMTP | Day 23 | AU |
| Qdrant/Pinecone (only if E11) | Day 20 | AI |
| OpenChargeMap key (only if E13) | Day 24 | DR |

---

## 9. Curriculum → epic map

| Curriculum topic | Epic(s) | Sprint |
| :--- | :--- | :--- |
| Vibe Coding & Architecture | E1, E6 | 1–2 |
| Agentic AI & LLMs | E5 | 3 |
| Prompting & Outputs | E5 | 3 |
| RAG & Knowledge Bases | E11 | 3–4 stretch |
| AI Safety & Cost Control | E5-S2/S4 | 3–4 |
| APIs & Live Data | E4, E13 | 3–4 |
| Telemetry & Real-Time | E3 | 2 |
| API Testing & Docs | E9 | 1–4 |
| Security & Secrets | E1-S2, E8 | 1 + 4 |
| Git & DevOps | E1, E12 | 1 + 4 |
| Workflow Automation | E10 | 4 |
| Frontend & Analytics | E6, E7 | 2–3 |
| Problem Solving & Methodology | E0, E12 | all |

---

## 10. RAID / decisions log (fill as you go)

| Date | Type | Item | Decision / Action |
| :--- | :--- | :--- | :--- |
| TBD | Decision | WS vs SSE | |
| TBD | Decision | DB vs in-memory for prototype | Recommend in-memory + JSON seed for speed |
| TBD | Decision | Mock-only Octopus vs real key | |
| TBD | Risk | … | |

---

## 11. How to use this file

1. **PO** imports each **Story** as a GitHub Issue; paste **Tasks** as checklists.  
2. Label issues: `epic:E5`, `role:AI`, `sprint:3`, `priority:P0`.  
3. At sprint planning, pull only the Sprint section stories.  
4. Do not start E11/E13 until Sprint 3 exit checklist is green.  
5. Keep `fourWeekPrototypePlan.md` as the teaching narrative; **this file is the delivery backlog.**

---

## 12. Launch day checklist (Day 28)

- [ ] Staging web URL works  
- [ ] Staging API health OK  
- [ ] Login works  
- [ ] 5 EVs streaming  
- [ ] Charts render  
- [ ] Ask AI returns JSON  
- [ ] n8n alert OK or waived  
- [ ] Postman runbook attached  
- [ ] README runbook attached  
- [ ] Demo script printed  
- [ ] Curriculum 13/13 reviewed  
- [ ] Retro collected  

**Ship statement:** VoltFlow prototype launched for training demo — simulated EV fleet with AI-assisted charge decisions.
