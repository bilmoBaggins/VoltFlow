# VoltFlow

VoltFlow is a demo EV fleet management portal. It combines simulated vehicle data, charging sessions, UK electricity pricing and carbon intensity, reimbursement workflows, and AI charging advice.

## Project structure

- `apps/web` - React 19, TypeScript, and Vite frontend
- `apps/api` - Node.js API and Prisma database layer
- `docker` - MySQL initialization files
- `docs` - setup notes, API documentation, and product scope

## Requirements

- Node.js and npm
- Docker Desktop, for the local MySQL and Mailpit services

## Setup

Install dependencies:

```powershell
cd apps/api
npm install
cd ../web
npm install
```

Create local environment files:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Start the supporting services:

```powershell
docker compose up -d
```

Run the API and web app in separate terminals:

```powershell
cd apps/api
npm run dev
```

```powershell
cd apps/web
npm run dev
```

The web app runs at `http://localhost:5173` and the API runs at `http://localhost:3001`.

## Main routes

- `/` - Fleet overview
- `/sessions` - Charging sessions and costs
- `/reimbursements` - Reimbursement queue
- `/ai` - AI charging advisor

See [docs/setup.md](docs/setup.md) for the full local setup guide and [docs/services.md](docs/services.md) for the service architecture.