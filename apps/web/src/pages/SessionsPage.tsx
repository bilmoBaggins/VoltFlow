/**
 * OWNER: Student 3 — Sessions & Costs
 * Task: Build sessions table UI (start with mock rows; wire API later).
 * Mockup: docs/mockups/voltflow-sessions-costs.png
 * API later: GET /sessions, POST /sessions/start, POST /sessions/:id/stop
 */
const MOCK_SESSIONS = [
  {
    id: "ses-01",
    vehicleId: "ev-02",
    siteType: "home",
    kwh: 12.4,
    costGbp: 2.18,
    status: "completed",
  },
  {
    id: "ses-02",
    vehicleId: "ev-01",
    siteType: "depot",
    kwh: 8.1,
    costGbp: 1.05,
    status: "active",
  },
];

export function SessionsPage() {
  return (
    <section className="page">
      <h1>Sessions & costs</h1>
      <p className="page-owner">Student 3 · mock UI first</p>
      <p className="page-hint">
        Build the table and forms now with mock data. Replace mocks when Backend
        ships sessions endpoints.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Vehicle</th>
              <th>Site</th>
              <th>kWh</th>
              <th>Cost (£)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SESSIONS.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.vehicleId}</td>
                <td>{s.siteType}</td>
                <td>{s.kwh}</td>
                <td>{s.costGbp.toFixed(2)}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
