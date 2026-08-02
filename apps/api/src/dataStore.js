import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesPath = join(__dirname, "../data/vehicles.json");

/** Seed templates (ids / names / home regions stay fixed). */
const templates = JSON.parse(readFileSync(vehiclesPath, "utf8"));

const STATUSES = ["idle", "charging", "driving"];
const SITE_TYPES = ["depot", "home", "public"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/** Build one randomized snapshot from a template. */
function randomizeVehicle(template) {
  const status = pick(STATUSES);
  const siteType = pick(SITE_TYPES);

  // Tiny GPS jitter so map pins move slightly (~±0.01 degrees)
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
    },
    updatedAt: new Date().toISOString(),
  };
}

/** NEW random values every call. */
export function getVehicles() {
  return templates.map(randomizeVehicle);
}

export function getVehicleById(id) {
  const template = templates.find((v) => v.id === id);
  if (!template) return null;
  return randomizeVehicle(template);
}

/**
 * Demo control: return a randomized vehicle forced to a given status.
 * Still random battery/temp — only status (and chargeRate) is forced.
 */
export function updateVehicleStatus(id, status) {
  const template = templates.find((v) => v.id === id);
  if (!template) return null;

  const allowed = ["idle", "charging", "driving"];
  if (!allowed.includes(status)) {
    return { error: "Invalid status. Use idle | charging | driving" };
  }

  const vehicle = randomizeVehicle(template);
  vehicle.status = status;
  vehicle.chargeRateKw =
    status === "charging" ? Number((3 + Math.random() * 8).toFixed(1)) : 0;
  vehicle.updatedAt = new Date().toISOString();
  return vehicle;
}
