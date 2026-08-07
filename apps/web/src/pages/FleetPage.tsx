/**
 * OWNER: Student 1 — Fleet Dashboard
 * Task: Show all 5 EVs from GET /vehicles (table + refresh).
 * Mockup: docs/mockups/voltflow-admin-dashboard.png
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVehicles } from "../api/client";
import type { Vehicle } from "../types/vehicle";

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
    // Initial state already reflects "loading" (loading=true, error=null),
    // so only the async completion needs to touch state here.
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
    <section className="page">
      <h1>Fleet</h1>
      <p className="page-owner">Student 1 · live API</p>
      <p className="page-hint">
        Call <code>GET /vehicles</code>, show battery + status. Refresh should
        show new random values.
      </p>

      <p>
        <button
          className="btn"
          type="button"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Battery</th>
              <th>Status</th>
              <th>Site</th>
              <th>Region</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.batteryPercent}%</td>
                <td>{v.status}</td>
                <td>{v.siteType}</td>
                <td>{v.location.gridRegion}</td>
                <td>
                  <Link to={`/vehicle/${v.id}`}>Details</Link>
                </td>
              </tr>
            ))}
            {!loading && vehicles.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="muted">
                  No vehicles yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
