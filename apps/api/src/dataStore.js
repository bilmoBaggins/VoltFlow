import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { prisma } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesPath = join(__dirname, "../data/vehicles.json");

/** Fallback if MySQL/Prisma is unavailable. */
const jsonTemplates = JSON.parse(readFileSync(vehiclesPath, "utf8"));

const STATUSES = ["idle", "charging", "driving"];
const SITE_TYPES = ["depot", "home", "public"];

/** UK GSP codes from docs/ukGridRegions.md (no letter I). */
const GRID_REGIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function toNumber(value) {
  return typeof value === "number" ? value : Number(value);
}

/** Map a Prisma Vehicle row to the Fake EV API template shape. */
function mapDbVehicle(row) {
  return {
    id: row.id,
    name: row.name,
    batteryPercent: row.batteryPercent,
    chargeRateKw: toNumber(row.chargeRateKw),
    status: row.status,
    temperatureC: row.temperatureC,
    siteType: row.siteType,
    batteryCapacityKwh: toNumber(row.batteryCapacityKwh),
    location: {
      lat: toNumber(row.lat),
      lng: toNumber(row.lng),
      label: row.locationLabel,
      postcode: row.postcode,
      gridRegion: row.gridRegion,
    },
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function loadTemplates() {
  try {
    const rows = await prisma.vehicle.findMany({ orderBy: { id: "asc" } });
    if (rows.length === 0) {
      console.warn("Prisma: vehicles table empty — using JSON fallback");
      return jsonTemplates;
    }
    return rows.map(mapDbVehicle);
  } catch (err) {
    console.warn(
      `Prisma unavailable (${err.message}) — using JSON fallback`
    );
    return jsonTemplates;
  }
}

/** Build one randomized snapshot from a template. */
function randomizeVehicle(template) {
  const status = pick(STATUSES);
  const siteType = pick(SITE_TYPES);
  const gridRegion = pick(GRID_REGIONS);

  const lat = Number(
    (template.location.lat + (Math.random() - 0.5) * 0.02).toFixed(5)
  );
  const lng = Number(
    (template.location.lng + (Math.random() - 0.5) * 0.02).toFixed(5)
  );

  return {
    ...template,
    batteryPercent: randInt(5, 98),
    status,
    chargeRateKw:
      status === "charging" ? Number((3 + Math.random() * 8).toFixed(1)) : 0,
    temperatureC: randInt(18, 40),
    siteType,
    location: {
      ...template.location,
      lat,
      lng,
      gridRegion,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** NEW random values every call (templates from MySQL via Prisma). */
export async function getVehicles() {
  const templates = await loadTemplates();
  return templates.map(randomizeVehicle);
}

export async function getVehicleById(id) {
  const templates = await loadTemplates();
  const template = templates.find((v) => v.id === id);
  if (!template) return null;
  return randomizeVehicle(template);
}

/**
 * Demo control: return a randomized vehicle forced to a given status.
 * Persists status to MySQL when Prisma is available.
 */
export async function updateVehicleStatus(id, status) {
  const allowed = ["idle", "charging", "driving"];
  if (!allowed.includes(status)) {
    return { error: "Invalid status. Use idle | charging | driving" };
  }

  const templates = await loadTemplates();
  const template = templates.find((v) => v.id === id);
  if (!template) return null;

  const vehicle = randomizeVehicle(template);
  vehicle.status = status;
  vehicle.chargeRateKw =
    status === "charging" ? Number((3 + Math.random() * 8).toFixed(1)) : 0;
  vehicle.updatedAt = new Date().toISOString();

  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        status,
        chargeRateKw: vehicle.chargeRateKw,
        batteryPercent: vehicle.batteryPercent,
        temperatureC: vehicle.temperatureC,
        siteType: vehicle.siteType,
        lat: vehicle.location.lat,
        lng: vehicle.location.lng,
        gridRegion: vehicle.location.gridRegion,
      },
    });
  } catch (err) {
    console.warn(`Prisma update skipped: ${err.message}`);
  }

  return vehicle;
}
