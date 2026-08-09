/**
 * OWNER: unassigned — Driver portal (Phase 2 / optional role)
 * Task: Show the signed-in driver's own vehicle + home reimbursement status.
 * Mockup: docs/mockups/voltflow-driver-dashboard.png
 * API later: cost-today + reimbursement summary (no endpoint yet — mocked
 * below, same pattern as SessionsPage/ReimbursementsPage). Vehicle + battery
 * are real, via the existing GET /vehicles/:id + /vehicles/:id/telemetry.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import vanImage from "../assets/van.png";
import { fetchTelemetry, fetchVehicle } from "../api/client";
import type { Telemetry, Vehicle } from "../types/vehicle";
import "./DriverDashboardPage.css";

// Rough estimate only — no real efficiency figure exists per vehicle yet.
const MILES_PER_KWH = 2.8;

// No cost/reimbursement API yet; mirrors the mock-first pattern used on
// SessionsPage and ReimbursementsPage until those endpoints exist.
const MOCK_SUMMARY = {
  costTodayGbp: 2.4,
  reimbursement: {
    status: "Pending" as const,
    amountGbp: 4.32,
    submittedOn: "24 May 2025",
  },
  aiTip: {
    headline: "Wait until 11pm when price is lower.",
    reason: "Our AI has identified lower prices overnight.",
  },
};

const VEHICLE_IDS = ["ev-01", "ev-02", "ev-03", "ev-04", "ev-05"];

function statusLabel(vehicle: Vehicle): string {
  if (vehicle.status === "charging") {
    return vehicle.siteType === "home"
      ? "Charging at Home"
      : `Charging at ${vehicle.siteType}`;
  }
  if (vehicle.status === "driving") return "Driving";
  return "Idle";
}

export function DriverDashboardPage() {
  const [vehicleId, setVehicleId] = useState("ev-01");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [v, t] = await Promise.all([
          fetchVehicle(vehicleId),
          fetchTelemetry(vehicleId),
        ]);
        if (!cancelled) {
          setVehicle(v);
          setTelemetry(t);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load vehicle",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const estRangeMiles = vehicle
    ? Math.round(
        (vehicle.batteryCapacityKwh * vehicle.batteryPercent * MILES_PER_KWH) /
          100,
      )
    : null;

  return (
    <section className="page driver-page">
      <h1>My Vehicle</h1>
      <p className="page-owner">Driver portal · Phase 2 / optional role</p>
      <p className="page-hint">
        Own-vehicle view for a signed-in driver. Cost and reimbursement
        figures are mocked until those API endpoints exist — battery,
        status, and location are live from <code>GET /vehicles/:id</code>.
      </p>

      <label className="driver-vehicle-picker">
        Vehicle{" "}
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          {VEHICLE_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}
      {loading && !vehicle && <p className="muted">Loading vehicle…</p>}

      {vehicle && (
        <div className="driver-grid">
          <div className="driver-card driver-card--main">
            <div className="driver-card-info">
              <div className="driver-eyebrow">My Vehicle</div>
              <h2 className="driver-vehicle-name">{vehicle.name}</h2>

              <div className="driver-fact">
                <span className="driver-fact-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5.5 9.6V20h13V9.6" />
                    <path d="M10 13h4v4h-4z" />
                    <path d="M12 17v2.5" />
                  </svg>
                </span>
                <span>
                  <span className="driver-fact-label">Status</span>
                  <span className="driver-fact-value driver-fact-value--accent">
                    {statusLabel(vehicle)}
                    {vehicle.status === "charging" && telemetry
                      ? ` · ${telemetry.chargeRateKw} kW`
                      : ""}
                  </span>
                </span>
              </div>

              <div className="driver-fact">
                <span className="driver-fact-icon driver-fact-icon--muted" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                </span>
                <span>
                  <span className="driver-fact-label">Location</span>
                  <span className="driver-fact-value">
                    {vehicle.location.label}
                    <br />
                    {vehicle.location.postcode}
                  </span>
                </span>
              </div>

              <Link className="btn btn--outline" to={`/vehicle/${vehicle.id}`}>
                View Vehicle Details
              </Link>
            </div>

            <div className="driver-van-wrap">
              <img className="driver-van-image" src={vanImage} alt={vehicle.name} />

              <div className="driver-battery">
                <div className="driver-battery-value">
                  {vehicle.batteryPercent}
                  <span className="driver-battery-unit">%</span>
                </div>
                <div className="driver-battery-caption">Battery Level</div>
                <div className="driver-battery-bar">
                  <div
                    className="driver-battery-fill"
                    style={{ width: `${vehicle.batteryPercent}%` }}
                  />
                </div>
                <div className="driver-battery-range">
                  {estRangeMiles !== null
                    ? `Est. range ${estRangeMiles} mi`
                    : "Est. range —"}
                </div>
              </div>
            </div>
          </div>

          <div className="driver-side">
            <div className="driver-card driver-card--tint">
              <div className="driver-card-top">
                <div className="driver-eyebrow">Cost Today</div>
                <div className="driver-cost-icon" aria-hidden="true">
                  <svg width="28" height="30" viewBox="0 0 28 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
                    <path d="M4 3h20v26l-4-2.4-4 2.4-4-2.4-4 2.4-4-2.4z" />
                    <path d="M10 11h9M10 16h9M11 21h6" />
                  </svg>
                </div>
              </div>
              <div className="driver-stat">£{MOCK_SUMMARY.costTodayGbp.toFixed(2)}</div>
              <div className="driver-fact-label">
                Total charging cost
                <br />
                Today
              </div>
            </div>

            <div className="driver-card">
              <div className="driver-eyebrow">Reimbursement Status</div>
              <div className="driver-reimbursement-row">
                <div className="driver-stat driver-stat--sm">
                  {MOCK_SUMMARY.reimbursement.status}
                </div>
                <div className="driver-stat driver-stat--sm">
                  £{MOCK_SUMMARY.reimbursement.amountGbp.toFixed(2)}
                </div>
              </div>
              <div className="driver-fact-label">Total amount</div>

              <ol className="driver-stepper">
                <li className="driver-step driver-step--current">
                  <span className="driver-step-dot" />
                  <span className="driver-step-label">Pending</span>
                  <span className="driver-step-date">
                    Submitted
                    <br />
                    {MOCK_SUMMARY.reimbursement.submittedOn}
                  </span>
                </li>
                <li className="driver-step">
                  <span className="driver-step-dot" />
                  <span className="driver-step-label">Approved</span>
                  <span className="driver-step-date">–</span>
                </li>
                <li className="driver-step">
                  <span className="driver-step-dot" />
                  <span className="driver-step-label">Paid</span>
                  <span className="driver-step-date">–</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="driver-card driver-card--tint driver-tip">
            <div className="driver-tip-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c.6 4.6 2.4 6.6 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />
              </svg>
            </div>
            <div className="driver-tip-body">
              <div className="driver-eyebrow">Tip from AI</div>
              <div className="driver-tip-headline">{MOCK_SUMMARY.aiTip.headline}</div>
              <div className="driver-fact-label">{MOCK_SUMMARY.aiTip.reason}</div>
            </div>
            <Link className="btn btn--outline driver-tip-cta" to="/ai">
              View Optimal Charging Times
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
