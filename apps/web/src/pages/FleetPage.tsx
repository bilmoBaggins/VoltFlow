/**
 * OWNER: Student 1 — Fleet Dashboard
 * Task: Show all 5 EVs from GET /vehicles (table + refresh).
 * Mockup: docs/mockups/voltflow-admin-dashboard.png
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVehicles } from "../api/client";
import type { SiteType, Vehicle, VehicleStatus } from "../types/vehicle";
import vanThumb from "../assets/van.png";
import "./FleetPage.css";

const REGION_LABELS: Record<string, string> = {
  A: "Eastern England, UK",
  B: "East Midlands, UK",
  C: "London, UK",
  D: "Merseyside, UK",
  E: "West Midlands, UK",
  F: "North East, UK",
  G: "North West, UK",
  H: "Southern England, UK",
  J: "South East, UK",
  K: "South Wales, UK",
  L: "South West, UK",
  M: "Yorkshire, UK",
  N: "Southern Scotland, UK",
  P: "Northern Scotland, UK",
};

function statusClass(status: VehicleStatus): string {
  if (status === "charging") return "fo-badge fo-badge-charging";
  if (status === "driving") return "fo-badge fo-badge-driving";
  return "fo-badge fo-badge-idle";
}

function siteLabel(site: SiteType): string {
  if (site === "home") return "Home";
  if (site === "depot") return "Depot";
  return "Public";
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6c-2.4 0-4.4 1.9-4.4 4.3 0 3.2 4.4 8.5 4.4 8.5s4.4-5.3 4.4-8.5C12.4 3.5 10.4 1.6 8 1.6z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="5.9" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 7.5 8 2.8l5.5 4.7V13a.7.7 0 0 1-.7.7H3.2a.7.7 0 0 1-.7-.7V7.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="3.2"
        y="2.5"
        width="6.5"
        height="11"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M9.7 6.2h3.1a.5.5 0 0 1 .5.5V13.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function SiteIcon({ site }: { site: SiteType }) {
  if (site === "home") return <HomeIcon />;
  if (site === "depot") return <BuildingIcon />;
  return <PinIcon />;
}

function locationText(vehicle: Vehicle): string {
  return (
    REGION_LABELS[vehicle.location.gridRegion] ?? vehicle.location.label ?? "UK"
  );
}

export function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await fetchVehicles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles()
      .then(setVehicles)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load vehicles",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="page fleet-page">
      <div className="fleet-page-head">
        <div>
          <h1>Fleet</h1>
          <p className="page-owner">
            Live Fake EV data · refresh for new values
          </p>
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <article className="fo-card">
        <header className="fo-card-head">
          <h2>Fleet Overview</h2>
        </header>

        <div className="fo-table-wrap">
          <table className="fo-table">
            <thead>
              <tr>
                <th>Van</th>
                <th>Battery</th>
                <th>Status</th>
                <th>Site Type</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link to={`/vehicle/${v.id}`} className="fo-van">
                      <img
                        className="fo-van-thumb"
                        src={vanThumb}
                        alt=""
                        width={44}
                        height={28}
                      />
                      <span className="fo-van-name">{v.name}</span>
                    </Link>
                  </td>
                  <td>
                    <div className="fo-battery">
                      <span className="fo-battery-pct">
                        {v.batteryPercent}%
                      </span>
                      <div
                        className="fo-battery-track"
                        role="progressbar"
                        aria-valuenow={v.batteryPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${v.name} battery`}
                      >
                        <div
                          className="fo-battery-fill"
                          style={{ width: `${v.batteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={statusClass(v.status)}>
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="fo-site">
                      <span className="fo-site-icon">
                        <SiteIcon site={v.siteType} />
                      </span>
                      {siteLabel(v.siteType)}
                    </span>
                  </td>
                  <td>
                    <span className="fo-location">
                      <span className="fo-site-icon">
                        <PinIcon />
                      </span>
                      {locationText(v)}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && vehicles.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="muted">
                    No vehicles yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="fo-card-foot">
          <Link to="/vehicle/ev-01" className="fo-view-all">
            View all fleet
          </Link>
        </footer>
      </article>
    </section>
  );
}
