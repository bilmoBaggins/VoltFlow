import { Router } from "express";
import {
  getVehicleById,
  getVehicles,
  updateVehicleStatus,
} from "../dataStore.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getVehicles());
});

router.get("/:id", (req, res) => {
  const vehicle = getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
});

router.get("/:id/telemetry", (req, res) => {
  const vehicle = getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

  res.json({
    vehicleId: vehicle.id,
    batteryPercent: vehicle.batteryPercent,
    chargeRateKw: vehicle.chargeRateKw,
    status: vehicle.status,
    temperatureC: vehicle.temperatureC,
    siteType: vehicle.siteType,
    location: vehicle.location,
    updatedAt: vehicle.updatedAt,
  });
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body || {};
  const result = updateVehicleStatus(req.params.id, status);

  if (!result) return res.status(404).json({ error: "Vehicle not found" });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

export default router;
