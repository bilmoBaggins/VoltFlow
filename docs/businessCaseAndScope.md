# VoltFlow — Business Case & Scope Requirements

**Product:** VoltFlow EV Fleet Charging Prototype  
**Audience:** Internship / training delivery (8 beginners, 1 month)  
**Owner:** Product Owner / Scrum Master  
**Related:** `epics.md`, `services.md`, `fleetcharging.md`, `fleetChargingCostAndReimbursement.md`

---

## 1. Business case (why build this)

### Problem
Companies running EV fleets struggle to:
- See **who is charging, where, and what it costs** (home vs depot vs public)
- **Reimburse drivers** fairly for home charging
- Decide **when to charge** using live energy price and grid carbon
- Do this **without real vehicles or charger hardware** during training/demo

### Opportunity
Electrification is growing. A simple portal that combines **fleet visibility + cost/reimbursement + AI charge advice** shows the business value of smart EV operations — and teaches modern full-stack + AI skills.

### Proposed solution
**VoltFlow:** a web portal backed by one monorepo API that:
1. Simulates 5 EVs (battery % + fake location)
2. Pulls free UK **grid price + carbon** data
3. Records **charging sessions and costs**
4. Handles **home reimbursement** (pending → approved → paid)
5. Uses **AI** to recommend CHARGE / WAIT / STOP with a clear reason

### Business outcomes (demo success)
| Outcome | Measure |
| :--- | :--- |
| Fleet visibility | 5 EVs live on dashboard ≥5 minutes |
| Cost control insight | Sessions show £ cost by site type |
| Fair driver payback | Home sessions create reimbursement queue |
| Smarter charging | AI decision uses battery + price + carbon |
| Trainee capability | 13 curriculum topics exercised |

### What we are not selling (yet)
This is a **prototype / training product**, not a production fleet SaaS with real chargers, payments, or SLAs.

---

## 2. Scope summary

### In scope (Must — 1 month)
| Area | Requirement |
| :--- | :--- |
| **Platform** | One monorepo: `apps/web` + `apps/api` + shared types |
| **EV service** | 5 fake EVs: battery %, status, siteType, fake lat/lng, gridRegion |
| **Realtime** | Telemetry updates every 3–5s (SSE or WebSocket) |
| **Grid** | Carbon Intensity API + Octopus Agile (region-based), with mocks |
| **Sessions** | Start/stop charging sessions; record kWh + £ cost |
| **Reimbursement** | Home only: pending → approved → paid |
| **AI** | `POST /ai/decide` → CHARGE / WAIT / STOP + reason (JSON) |
| **UI** | Fleet table, charts (price/carbon/battery), Ask AI, sessions + reimbursement queue |
| **Auth** | JWT lite (demo login) |
| **Quality** | Postman + OpenAPI |
| **DevOps** | `.env`, CI, deploy web + API |
| **Automation** | n8n alert when AI says CHARGE |
| **Delivery** | Demo day + runbook |

### Out of scope (explicit)
| Excluded | Why |
| :--- | :--- |
| Real EV hardware / OCPP chargers | No physical fleet |
| Native mobile driver app | Web portal is enough |
| Real bank/payroll reimbursement | Demo status only |
| Full GPS route optimisation (“drive further to cheaper station”) | Phase 2 |
| Payments, invoices, RFID public networks | Too heavy |
| Multi-tenant enterprise RBAC | JWT lite only |
| Production 24×7 SLA | Training prototype |

### Stretch (only if Must is green by Day 22)
- OpenChargeMap nearby chargers + optional `GO_TO_CHARGER`
- Tiny RAG over EV manuals
- Vans in multiple UK regions (different Agile prices)
- “Simulate 24h follow-AI vs always-charge” cost compare

---

## 3. Stakeholders & users

| Role | Need |
| :--- | :--- |
| **Fleet manager** (primary user of UI) | See fleet, costs, approve home reimbursements, Ask AI |
| **Driver** (data only in MVP) | Represented as `driverId` on home sessions — no mobile app |
| **Intern team** | Learn roles while shipping the prototype |
| **Mentor / sponsor** | Demo Day proof of business + tech case |

---

## 4. Functional requirements

### FR-1 Fleet visibility
- System shall list 5 simulated vehicles with battery %, status, siteType, location.
- System shall update telemetry on a live stream without full page reload.

### FR-2 Location-aware grid context
- Each vehicle shall carry fake `lat/lng` and `gridRegion` (e.g. `C` = London).
- Grid module shall fetch price for that region and national (or regional) carbon.
- System shall fall back to mock grid data if upstream APIs fail.

### FR-3 Charging sessions & cost recording
- System shall start/stop a charging session per vehicle.
- System shall calculate energy (kWh) from battery delta × capacity (MVP formula).
- System shall calculate `costGbp` using grid price for the session region.
- System shall show who, where, kWh, and £ for each session.

### FR-4 Home reimbursement
- If `siteType === home`, system shall create reimbursement `pending` equal to session cost.
- Fleet manager shall approve and mark paid (no real payment rail).
- Depot and public sessions shall record cost but **not** require driver reimbursement.

### FR-5 AI charge advisor
- Given vehicle snapshot + grid snapshot, AI shall return validated JSON: `action`, `reason`, `confidence`.
- Actions in MVP: `CHARGE` | `WAIT` | `STOP`.
- System shall enforce schema validation, retry cap, and token/usage logging.
- Mock AI mode shall work without calling the LLM (CI/demo safety).

### FR-6 Analytics
- UI shall chart energy price, carbon intensity, and selected vehicle battery over time.

### FR-7 Security & access
- Secrets only in `.env`; CI shall scan for leaks.
- Demo users shall authenticate with JWT to access protected APIs/UI.

### FR-8 Automation
- When AI action is `CHARGE`, system may notify via n8n webhook (email/Discord/Slack).

### FR-9 Operability
- README runbook, Postman collection, staging URLs, Demo Day script.

---

## 5. Non-functional requirements

| ID | Requirement |
| :--- | :--- |
| NFR-1 | Prototype usable by beginners; prefer modular monolith over microservices |
| NFR-2 | Demo path runs in ≤10 minutes |
| NFR-3 | Stream stable ≥5 minutes |
| NFR-4 | Shared LLM budget capped (~$10) with visible usage |
| NFR-5 | Upstream grid failures must not break demo (mocks) |
| NFR-6 | All API changes reflected in OpenAPI/Postman |

---

## 6. Business rules

1. **Reimburse drivers only for home charging.**  
2. **Cost is recorded for every session** (home, depot, public).  
3. **AI advises; it does not pay or move real money.**  
4. **No real chargers** — EV service simulates charge state.  
5. **One web app** for managers — no mobile MVP.  
6. **Stretch features** cannot delay Demo Day Must scope.

---

## 7. Success criteria (acceptance of business case)

The business case is proven on Demo Day if the team can show:

1. Live fake fleet with locations  
2. Price + carbon for the vehicle’s region  
3. A completed session with £ cost  
4. A home reimbursement moved pending → paid  
5. AI recommendation with a plain-English reason  
6. (Optional) n8n alert on CHARGE  

**Pitch line:**  
> “VoltFlow shows how a fleet can see charging costs, reimburse home charging fairly, and use AI to charge when power is cheaper and cleaner — even before real vehicles are connected.”

---

## 8. Assumptions & constraints

| Assumption / constraint | Impact |
| :--- | :--- |
| No access to real EVs | Fake EV API required |
| UK-focused demo | Octopus + NESO carbon |
| Beginners + 4 weeks | Modular monolith, mocks, freeze contracts early |
| Free grid APIs | Cache + rate-limit awareness |
| LLM credits limited | Mock mode + budget log |

---

## 9. Risks (business)

| Risk | Mitigation |
| :--- | :--- |
| Scope creep into routing/mobile/hardware | PO enforces out-of-scope list |
| Demo fails if Octopus/carbon down | Mandatory mocks |
| Reimbursement confused with real payroll | Label UI “demo — not real payment” |
| AI cost overrun | Cap + mock |

---

## 10. Phased roadmap

| Phase | Scope |
| :--- | :--- |
| **Phase 1 (this month)** | Fake EV + grid + sessions + home reimbursement + AI advise + web portal |
| **Phase 2** | Nearby public chargers, richer location/routing advice |
| **Phase 3** | Real charger/telemetry integrations, driver app, real payouts |

---

## 11. Decision

| Question | Decision |
| :--- | :--- |
| Build mobile app? | **No** (Phase 1) |
| Real charging network APIs? | **No** — own session APIs only |
| Microservices? | **No** — one API, modules |
| Home reimbursement? | **Yes** — status workflow, not bank |
| AI required? | **Yes** — core differentiator with EV + grid |

**Approved scope for delivery:** Phase 1 Must list above, tracked in `epics.md`.
