import { Router } from "express";
import {
  getVehicleById,
  getVehicles,
  updateVehicleStatus,
} from "../dataStore.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await getVehicles());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/telemetry", async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    const result = await updateVehicleStatus(req.params.id, status);

    if (!result) return res.status(404).json({ error: "Vehicle not found" });
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
