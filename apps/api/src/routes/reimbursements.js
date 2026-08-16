import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

const STATUSES = ["pending", "approved", "paid", "rejected"];

const TARIFF_FALLBACK = "Octopus Agile (Flexible)";
const SOURCE_FALLBACK = "Charge point telemetry";

/** Prisma returns Decimal columns as objects; the API speaks plain numbers. */
function num(value) {
  return value === null || value === undefined ? null : Number(value);
}

/**
 * Flattens a claim and its session/vehicle/driver joins into the shape the
 * reimbursements page renders. Money is derived from the session's energy and
 * price so the row always agrees with the cost breakdown shown in the UI.
 */
function toClaim(row) {
  const session = row.session;
  const vehicle = session?.vehicle;
  const driver = session?.driver;

  return {
    id: row.id,
    driverName: driver?.name ?? "Unknown driver",
    driverId: row.driverId,
    vehicleModel: vehicle?.name ?? "Unknown vehicle",
    plate: row.plate ?? vehicle?.id ?? "—",
    energyKwh: num(session?.kwh) ?? 0,
    priceP: num(session?.pricePencePerKwh) ?? 0,
    amountGbp: num(row.amountGbp) ?? 0,
    chargedAt: (session?.startedAt ?? row.createdAt).toISOString(),
    status: row.status,
    location: session?.siteLabel ?? vehicle?.locationLabel ?? "—",
    gridRegion: vehicle?.gridRegion ?? "—",
    tariff: row.tariff ?? TARIFF_FALLBACK,
    source: row.source ?? SOURCE_FALLBACK,
    notes: row.notes ?? "–",
  };
}

const claimInclude = {
  session: { include: { vehicle: true, driver: true } },
};

/** GET /reimbursements[?status=pending] */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    if (status && !STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }

    const rows = await prisma.reimbursement.findMany({
      where: status ? { status } : undefined,
      include: claimInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json(rows.map(toClaim));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /reimbursements/:id/status — approve / reject / mark paid */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, notes } = req.body || {};

    if (!STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }

    const reason = typeof notes === "string" ? notes.trim() : "";

    // A rejection has to say why — the driver is being told no, and the note
    // is the only record of the reason.
    if (status === "rejected" && reason === "") {
      return res
        .status(400)
        .json({ error: "A reason is required when rejecting a claim" });
    }

    const existing = await prisma.reimbursement.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Reimbursement not found" });
    }

    const updated = await prisma.reimbursement.update({
      where: { id: req.params.id },
      data: { status, ...(reason === "" ? {} : { notes: reason }) },
      include: claimInclude,
    });

    res.json(toClaim(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
