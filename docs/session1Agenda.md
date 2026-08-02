# Session 1 Agenda — First Meetup (18:00–21:00)

**Audience:** Interns with **no experience**  
**Length:** 3 hours  
**Editor stack:** **VS Code + Claude Code** (not Cursor)  
**Goal:** They leave knowing *what* VoltFlow is, *who* they are on the team, tools installed, and one small win (PR or Hello page).

**Do not try to build the full product tonight.**

---

## Timing overview

| Time | Block | Energy |
| :--- | :--- | :--- |
| 18:00–18:20 | Welcome & icebreaker | Easy |
| 18:20–18:50 | Product story (why + demo vision) | Watch / ask |
| 18:50–19:05 | Roles & how we work | Interactive |
| 19:05–19:15 | **Break** | — |
| 19:15–20:15 | Tools setup lab (VS Code, Claude Code, GitHub, clone) | Hands-on |
| 20:15–20:45 | First win: Hello page + PR | Hands-on |
| 20:45–21:00 | Homework + Q&A + close | Easy |

---

## 18:00–18:20 — Welcome (20 min)

**You cover**
- Who you are, why this internship exists
- Rules: ask questions, no stupid questions, pair help is OK
- 3-hour flow for tonight
- **We code with VS Code + Claude Code** (AI assistant inside the editor)

**Icebreaker (2 min each, keep short)**  
Name → one app they use daily → laptop OS (Windows/Mac/Linux)

**Outcome:** Everyone speaking, you know machine types for setup help.

---

## 18:20–18:50 — Product story (30 min)

**Keep it visual — open `docs/mockups/`**

1. **Problem (5 min)**  
   EV fleets: who charged, where, what it cost, home reimbursement, when to charge.

2. **Our answer — VoltFlow (10 min)**  
   Show in order:
   - `voltflow-system-flow.png` — big picture
   - `voltflow-admin-dashboard.png` — manager view
   - `voltflow-ai-advisor.png` — AI CHARGE/WAIT
   - `voltflow-sessions-costs.png` + `voltflow-reimbursement-queue.png` — cost + home payback  
   Mention driver screen is **later / optional**.

3. **What is fake vs real (5 min)**  
   - Fake: EV cars, battery %, GPS  
   - Real (free APIs): UK electricity price + carbon  
   - AI: advises when to charge

4. **1-month promise (5 min)**  
   Demo Day: live fake fleet + costs + home reimbursement + Ask AI.

5. **Q&A (5 min)**

**Say out loud:** “You are beginners. We use **VS Code + Claude Code** and small steps. Week 1 is setup + 5 cars API — not the whole product.”

---

## 18:50–19:05 — Roles & ways of working (15 min)

**Assign or draft-assign 8 roles** (can fine-tune next session):

| Role | One-line job |
| :--- | :--- |
| PO / Scrum Master | Board, demos, keep scope small |
| Backend | EV + sessions APIs |
| Frontend | Admin dashboard |
| Data / Realtime | Grid APIs + live battery stream |
| AI Engineer | Ask AI CHARGE/WAIT JSON |
| QA | Postman + checklists |
| DevOps | Repo, `.env`, CI, deploy |
| Automation | n8n alerts |

**Rules for beginners**
- Everyone starts Week 1 (mocks OK if blocked)
- Pair for help; still submit your own small PR
- No secrets in Git
- Use Claude Code to explain errors — still **read** what it changes before accepting
- Questions in chat / raise hand

**Optional:** show `docs/businessCaseAndScope.md` one slide: In scope vs Out of scope (mobile/real chargers = out).

---

## 19:05–19:15 — Break (10 min)

---

## 19:15–20:15 — Tools lab (60 min)

**Target:** every laptop can open **VS Code + Claude Code** + GitHub.

### Checklist (put on screen / shared doc)

- [ ] Create GitHub account (if needed)
- [ ] Install **VS Code** — https://code.visualstudio.com/
- [ ] Install **Git** (or confirm `git --version`)
- [ ] Install / enable **Claude Code** in VS Code (extension / Claude Code as you use it)
- [ ] Sign in to Claude (mentor shares how access works for the team)
- [ ] Accept invite to org/repo (or you create repo live)
- [ ] Clone repo
- [ ] **File → Open Folder** in VS Code
- [ ] Open Claude Code panel; ask: “Explain what this repo is for from the README”
- [ ] Show `.env.example` idea: secrets never committed

### How you teach (demo then they do)

1. You clone + open in **VS Code** (5 min)  
2. They clone + open folder (15–20 min — expect friction)  
3. **Claude Code demo** (10 min):  
   Prompt: *“Add a simple Hello VoltFlow heading on the main page. Explain each change.”*  
   Show: accept/reject, read the diff, don’t blind-apply  
4. They try the same on a branch with Claude Code (20 min)  
5. Buffer for stuck laptops (10–15 min)

**Helpers:** assign 1–2 slightly more confident interns as “setup buddies.”

**If repo is empty tonight:** create a tiny starter (`README` + empty `apps/web` hello) *before* the session, or live in first 10 min of this block.

### Claude Code ground rules (say once)
1. Ask Claude to **explain** before big edits  
2. Always **review the diff**  
3. Never paste API keys into the chat  
4. Prefer small prompts: “add one heading” not “build the whole app”

---

## 20:15–20:45 — First win (30 min)

**One shared task for everyone (no role silos yet):**

> Create branch `session1-yourname` → use Claude Code (or hand-edit) for a Hello VoltFlow line → commit → open Pull Request.

**You demo once in VS Code**
1. New branch (`git checkout -b session1-yourname` or VS Code Source Control)  
2. Small edit (with or without Claude Code)  
3. Commit message  
4. Push + Open PR on GitHub  
5. What a review comment looks like

**Success = PR link in the group chat**, even if CI isn’t ready yet.

If someone cannot push: screenshot of their Hello page in **VS Code** still counts for tonight; fix Git next session.

---

## 20:45–21:00 — Homework + close (15 min)

### Homework (due before next session, ~2 hours max)

1. Finish VS Code + Claude Code + Git setup if incomplete  
2. Open/read (skimming OK):
   - `docs/businessCaseAndScope.md` (In / Out of scope)
   - `docs/mockups/README.md` (look at images)
3. Write **5 lines**: “My role is ___ . In Week 1 I will help with ___ .”  
4. Optional: ask Claude Code *“What is a pull request in simple words?”* and save the answer

### Next session preview
“Next time: 5 fake EVs API + Postman. Bring laptop charged. VS Code + Claude Code ready.”

### Close
- Thank them  
- One thing they learned (round robin, 10 seconds each)  
- Share board/chat link  

---

## What NOT to cover tonight

| Skip tonight | Why |
| :--- | :--- |
| Octopus / carbon live coding | Too early |
| Product AI agent / LLM keys for VoltFlow | Week 3 |
| Full epics walkthrough (900 lines) | Overwhelming |
| Microservices debate | Settled: one monorepo |
| Driver mobile app | Out of scope |
| Deep JWT / n8n | Later weeks |

---

## Materials to have open before 18:00

- [ ] `docs/mockups/` images  
- [ ] `docs/businessCaseAndScope.md`  
- [ ] GitHub repo ready (or create in session)  
- [ ] **VS Code + Claude Code** working on **your** machine  
- [ ] Shared chat (Slack/Discord/Teams)  
- [ ] Role list (names blank or pre-filled)  
- [ ] This agenda  
- [ ] How interns get Claude access (team plan / seats) — decide before session  

---

## Mentor survival tips

- Expect setup to eat time — normal for zero-experience groups  
- Prefer **one demo, then they copy** over long slides  
- If Claude Code auth fails for someone: they can still edit files by hand for the Hello PR  
- If 2 people stuck on Git, continue with the rest; fix stuck pair after  
- End on a win (PR or Hello), even if messy  
- Capture blockers in a “parking lot” list for Session 2  

---

## Success criteria for Session 1

Tonight succeeded if:
1. Everyone can say what VoltFlow does in one sentence  
2. Everyone knows their draft role  
3. Most people opened the repo in **VS Code**  
4. Most people opened **Claude Code** at least once (or have a clear fix path)  
5. At least half opened a PR  
6. Homework is clear  

**One-sentence pitch they should repeat:**  
> “We build a fake EV fleet dashboard that tracks charging cost, reimburses home charging, and uses AI to say when to charge.”
