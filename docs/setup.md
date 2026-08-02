# VoltFlow — Setup Guide (Beginners)

Follow this page **in order**. Tick each box. Ask for help if a step fails for more than 5 minutes.

**What you will run**
- **API** (fake EVs) → http://localhost:3001  
- **Web app** (React) → http://localhost:5173  

You need **two terminals** (one for API, one for web).

---

## 0. What you need

| Thing | Why |
| :--- | :--- |
| Laptop (Windows / Mac / Linux) | Your machine |
| Internet | Download tools + clone repo |
| GitHub account | Get the code + open PRs |
| About 30–45 minutes | First-time setup |

---

## 1. Install tools

### 1.1 VS Code
1. Download: https://code.visualstudio.com/  
2. Install and open it once  

### 1.2 Git
Check if Git is already installed.

**Windows (PowerShell or Git Bash)** / **Mac** / **Linux**:
```bash
git --version
```

If you see a version (example `git version 2.43.0`) → OK.  
If not → install Git: https://git-scm.com/downloads  

### 1.3 Node.js (required for API + React)
You need **Node 20 or newer**.

1. Download LTS: https://nodejs.org/  
2. Install (accept defaults)  
3. **Close and reopen** the terminal  
4. Check:
```bash
node -v
npm -v
```

You should see versions (example `v22.x` and `10.x`).

### 1.4 Claude Code (optional but recommended)
See `docs/toolsSetup.md` for VS Code + Claude Code install and rules.

### 1.5 Postman (for API testing)
Download: https://www.postman.com/downloads/  
You will import our collection later.

---

## 2. Get the project code

1. Accept the GitHub invite to the team repo (mentor sends this).  
2. Open a terminal.  
3. Go to a folder where you keep code, then clone:

```bash
cd ~
mkdir -p code
cd code
git clone <PASTE-REPO-URL-HERE>
cd FleetManagmentEV
```

Replace `<PASTE-REPO-URL-HERE>` with the real URL from GitHub (green **Code** button).

4. Open the folder in VS Code:
   - **File → Open Folder…** → choose `FleetManagmentEV`

---

## 3. Install project packages

Still in the project root (`FleetManagmentEV`).

### 3.1 Backend (API)
```bash
cd apps/api
npm install
cd ../..
```

### 3.2 Frontend (web)
```bash
cd apps/web
npm install
cd ../..
```

Do this **once** after cloning (and again if someone adds new packages).

---

## 4. Start the apps (every day you code)

Open **two terminals** in VS Code:  
**Terminal → New Terminal**, then click the **+** again for a second one.

### Terminal A — Fake EV API
```bash
cd apps/api
npm run dev
```

Success looks like:
```text
EV API http://localhost:3001
Swagger  http://localhost:3001/api-docs
```

Leave this terminal **running**. Do not close it.

### Terminal B — React web app
```bash
cd apps/web
npm run dev
```

Success looks like:
```text
Local:   http://localhost:5173/
```

Leave this terminal **running** too.

### Open in browser
| App | URL |
| :--- | :--- |
| Web UI | http://localhost:5173 |
| Vehicles JSON | http://localhost:3001/vehicles |
| One vehicle telemetry | http://localhost:3001/vehicles/ev-01/telemetry |
| Swagger docs | http://localhost:3001/api-docs |
| Health check | http://localhost:3001/health |

**Tip:** Root URL http://localhost:3001 alone shows `Cannot GET /` — that is normal. Use `/vehicles` or `/health`.

---

## 5. Optional env files

You usually **do not** need these on day 1 (defaults already work).

If the mentor asks you to copy them:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
```

`apps/web/.env` can contain:
```env
VITE_API_URL=http://localhost:3001
```

**Never commit** real secrets. `.env` is ignored by Git. Only `.env.example` stays in the repo.

---

## 6. Your page task (5 students)

Each student owns **one page**. Edit only your file unless the mentor says otherwise.

| Student | Page in browser | File you own |
| :--- | :--- | :--- |
| 1 | Fleet `/` | `apps/web/src/pages/FleetPage.tsx` |
| 2 | Vehicle `/vehicle/ev-01` | `apps/web/src/pages/VehiclePage.tsx` |
| 3 | Sessions `/sessions` | `apps/web/src/pages/SessionsPage.tsx` |
| 4 | Reimbursements `/reimbursements` | `apps/web/src/pages/ReimbursementsPage.tsx` |
| 5 | Ask AI `/ai` | `apps/web/src/pages/AiAdvisorPage.tsx` |

**Shared (ask before big changes):**  
`apps/web/src/App.tsx`, `apps/web/src/layout/`, `apps/web/src/api/client.ts`

Mockups to copy from: `docs/mockups/`

---

## 7. Daily Git workflow (simple)

```bash
# from project root
git checkout main
git pull

git checkout -b feat/yourname-yourpage

# ... edit your page, save ...

git add apps/web/src/pages/YourPage.tsx
git commit -m "Add fleet table refresh for Student 1"
git push -u origin HEAD
```

Then on GitHub: open a **Pull Request**.

---

## 8. Postman (API practice)

1. Open Postman → **Import**  
2. Choose `docs/postman/voltflow-ev-service.postman_collection.json`  
3. Set collection variable `baseUrl` = `http://localhost:3001`  
4. Run **List vehicles** (API must be running)

---

## 9. Stop the apps

In each terminal that is running the app: press `Ctrl + C`  
(Mac: same `Ctrl + C` in the terminal)

---

## 10. Troubleshooting

| Problem | Fix |
| :--- | :--- |
| `Cannot GET /` on port 3001 | Use http://localhost:3001/vehicles — root has no page |
| Browser cannot open :5173 | Start web: `cd apps/web && npm run dev` |
| Fleet page error / failed to load | Start API first: `cd apps/api && npm run dev` |
| `port 3001 already in use` | Close the other API terminal, or ask mentor to free the port |
| `port 5173 already in use` | Use the URL Vite prints, or close the other web terminal |
| `npm` / `node` not found | Reinstall Node LTS, then **restart** VS Code |
| `git clone` permission denied | Accept GitHub invite; check you are logged in |
| Changes not showing | Hard refresh browser (`Ctrl+Shift+R`) |
| Typed `lcoalhost` | Spelling must be **localhost** |
| Using `https://localhost` | Use **http://** for local apps |

---

## 11. “Am I done?” checklist

- [ ] `node -v` and `npm -v` work  
- [ ] Repo opened in VS Code  
- [ ] `apps/api` → `npm install` done  
- [ ] `apps/web` → `npm install` done  
- [ ] API running → http://localhost:3001/vehicles shows 5 vans  
- [ ] Web running → http://localhost:5173 shows VoltFlow nav  
- [ ] I know which **Student page** is mine  

---

## 12. Helpful links inside this repo

| Doc | What it is |
| :--- | :--- |
| `docs/toolsSetup.md` | VS Code + Claude Code rules |
| `docs/fakeEvServiceGuide.md` | How the fake EV API works |
| `docs/mockups/README.md` | UI pictures for each screen |
| `docs/session1Agenda.md` | First meetup plan |

Welcome to VoltFlow — start small, ask questions, and open a PR when your page looks better than yesterday.
