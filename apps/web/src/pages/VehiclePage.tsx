/**
 * OWNER: Student 2 — Vehicle / Telemetry
 * Task: Show one EV from GET /vehicles/:id and /vehicles/:id/telemetry.
 * Mockup: detail slice of admin dashboard
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchTelemetry, fetchVehicle } from "../api/client";
import type { Telemetry, Vehicle } from "../types/vehicle";

export function VehiclePage() {
  const { id = "ev-01" } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const [v, t] = await Promise.all([
          fetchVehicle(id),
          fetchTelemetry(id),
        ]);
        if (!cancelled) {
          setVehicle(v);
          setTelemetry(t);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load vehicle");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="page">
      <h1>Vehicle detail</h1>
      <p className="page-owner">Student 2 · live API</p>
      <p className="page-hint">
        Use route param <code>:id</code>. Load vehicle + telemetry. Add a
        selector for ev-01…ev-05.
      </p>

      <p className="muted">
        Jump:{" "}
        {["ev-01", "ev-02", "ev-03", "ev-04", "ev-05"].map((vid, i) => (
          <span key={vid}>
            {i > 0 && " · "}
            <Link to={`/vehicle/${vid}`}>{vid}</Link>
          </span>
        ))}
      </p>

      {error && <p className="error">{error}</p>}

      {vehicle && (
        <div className="table-wrap">
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{vehicle.id}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{vehicle.name}</td>
              </tr>
              <tr>
                <th>Battery</th>
                <td>{vehicle.batteryPercent}%</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{vehicle.status}</td>
              </tr>
              <tr>
                <th>Charge rate</th>
                <td>{vehicle.chargeRateKw} kW</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>
                  {vehicle.location.label} ({vehicle.location.gridRegion})
                </td>
              </tr>
              <tr>
                <th>Telemetry updated</th>
                <td>{telemetry?.updatedAt ?? "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
