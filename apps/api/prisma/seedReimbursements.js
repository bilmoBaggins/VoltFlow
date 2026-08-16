/**
 * Seeds the reimbursement queue: home-charging sessions plus the claims raised
 * against them.
 *
 * Deliberately reuses the vehicles and driver users created by seed.js instead
 * of inserting its own. The Fleet page lists every row in `vehicles`, so adding
 * vehicles here would change a page this feature has no business touching.
 *
 * Idempotent: every row has a fixed id and is upserted, so re-running restores
 * the demo queue to its starting state without creating duplicates.
 *
 * Run with:  npm run seed:reimbursements   (from apps/api)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARIFF = "Octopus Agile (Flexible)";
const SOURCE = "Charge point telemetry";

/**
 * driver / vehicle are indexes into the rows seeded by seed.js (drv-01..05,
 * ev-01..05). Plates live on the claim rather than the vehicle so this seeder
 * stays inside the reimbursements domain.
 *
 * One pending claim per demo driver, so no name repeats in the queue.
 */
const CLAIMS = [
  {
    id: "CLM-2026-0807-001",
    driver: 0,
    vehicle: 0,
    plate: "LR72 HCP",
    kwh: 42.31,
    priceP: 29.9,
    startedAt: "2026-08-07T07:15:00Z",
    location: "London, Home",
    status: "pending",
  },
  {
    id: "CLM-2026-0806-004",
    driver: 1,
    vehicle: 1,
    plate: "LC71 FZD",
    kwh: 37.84,
    priceP: 29.92,
    startedAt: "2026-08-06T22:40:00Z",
    location: "Leeds, Home",
    status: "pending",
  },
  {
    id: "CLM-2026-0805-002",
    driver: 2,
    vehicle: 2,
    plate: "EN21 ZYT",
    kwh: 51.62,
    priceP: 29.97,
    startedAt: "2026-08-05T06:05:00Z",
    location: "Bristol, Home",
    status: "pending",
  },
  {
    id: "CLM-2026-0801-001",
    driver: 3,
    vehicle: 3,
    plate: "NC20 JWR",
    kwh: 56.3,
    priceP: 26.95,
    startedAt: "2026-08-01T05:30:00Z",
    location: "Newcastle, Home",
    status: "pending",
  },
  {
    id: "CLM-2026-0802-002",
    driver: 4,
    vehicle: 4,
    plate: "LV22 QWE",
    kwh: 39.75,
    priceP: 30.1,
    startedAt: "2026-08-02T06:45:00Z",
    location: "Liverpool, Home",
    status: "pending",
  },
  // Already actioned, so they sit outside the pending queue and give the
  // status filters something to show.
  {
    id: "CLM-2026-0729-002",
    driver: 3,
    vehicle: 0,
    plate: "LR72 HCP",
    kwh: 47.2,
    priceP: 26.4,
    startedAt: "2026-07-29T23:30:00Z",
    location: "London, Home",
    status: "approved",
    notes: "Approved by Alex Morgan",
  },
  {
    id: "CLM-2026-0725-004",
    driver: 4,
    vehicle: 1,
    plate: "LC71 FZD",
    kwh: 52.8,
    priceP: 25.75,
    startedAt: "2026-07-25T02:15:00Z",
    location: "Leeds, Home",
    status: "paid",
    notes: "Paid in July payroll run",
  },
];

/** kWh x pence-per-kWh, in pounds, rounded to the nearest penny. */
function amountGbp(kwh, priceP) {
  return Math.round(kwh * priceP) / 100;
}

/** Charging sessions run from startedAt until the energy is delivered at 7.2kW. */
function stoppedAt(startedAt, kwh) {
  const hours = kwh / 7.2;
  return new Date(new Date(startedAt).getTime() + hours * 3600 * 1000);
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { id: "asc" } });

  // Only the demo drivers from seed.js. Filtering on role would also match
  // real accounts created through /auth/register — they default to "driver" —
  // which would put actual people's names in the demo queue.
  const drivers = await prisma.user.findMany({
    where: { id: { startsWith: "drv-" } },
    orderBy: { id: "asc" },
  });

  if (vehicles.length === 0 || drivers.length === 0) {
    throw new Error(
      "No vehicles or demo drivers (drv-*) found. Run `npm run prisma:seed` " +
        "first — this seeder reuses the fleet rows it creates.",
    );
  }

  // Drop seeded rows that are no longer in CLAIMS, so trimming the list above
  // actually shrinks the queue. Scoped to this seeder's own id prefixes, so
  // claims created any other way are left alone. Claims go first — sessions
  // are their foreign key.
  const keepClaimIds = CLAIMS.map((c) => c.id);
  const keepSessionIds = keepClaimIds.map((id) => `ses-${id.toLowerCase()}`);

  const prunedClaims = await prisma.reimbursement.deleteMany({
    where: { id: { startsWith: "CLM-", notIn: keepClaimIds } },
  });
  const prunedSessions = await prisma.chargingSession.deleteMany({
    where: { id: { startsWith: "ses-clm-", notIn: keepSessionIds } },
  });

  if (prunedClaims.count > 0 || prunedSessions.count > 0) {
    console.log(
      `Pruned ${prunedClaims.count} stale claims and ` +
        `${prunedSessions.count} stale sessions`,
    );
  }

  let sessions = 0;
  let claims = 0;

  for (const claim of CLAIMS) {
    const vehicle = vehicles[claim.vehicle % vehicles.length];
    const driver = drivers[claim.driver % drivers.length];
    const sessionId = `ses-${claim.id.toLowerCase()}`;
    const amount = amountGbp(claim.kwh, claim.priceP);

    const session = {
      vehicleId: vehicle.id,
      driverId: driver.id,
      siteType: "home",
      siteLabel: claim.location,
      startedAt: new Date(claim.startedAt),
      stoppedAt: stoppedAt(claim.startedAt, claim.kwh),
      kwh: claim.kwh,
      pricePencePerKwh: claim.priceP,
      costGbp: amount,
      status: "completed",
    };

    await prisma.chargingSession.upsert({
      where: { id: sessionId },
      update: session,
      create: { id: sessionId, ...session },
    });
    sessions += 1;

    const reimbursement = {
      sessionId,
      driverId: driver.id,
      amountGbp: amount,
      status: claim.status,
      plate: claim.plate,
      tariff: TARIFF,
      source: SOURCE,
      notes: claim.notes ?? null,
    };

    await prisma.reimbursement.upsert({
      where: { id: claim.id },
      update: reimbursement,
      create: { id: claim.id, ...reimbursement },
    });
    claims += 1;
  }

  console.log(`Seeded ${sessions} home charging sessions`);
  console.log(
    `Seeded ${claims} reimbursement claims ` +
      `(${CLAIMS.filter((c) => c.status === "pending").length} pending)`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
