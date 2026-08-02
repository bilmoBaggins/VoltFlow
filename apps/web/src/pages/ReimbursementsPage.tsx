/**
 * OWNER: Student 4 — Home reimbursement queue
 * Task: Pending → approved → paid UI (mock first).
 * Mockup: docs/mockups/voltflow-reimbursement-queue.png
 * API later: GET /reimbursements?status=pending, approve / mark-paid
 */
const MOCK_QUEUE = [
  {
    id: "rb-01",
    driverId: "drv-12",
    vehicleId: "ev-02",
    amountGbp: 2.18,
    status: "pending",
  },
  {
    id: "rb-02",
    driverId: "drv-07",
    vehicleId: "ev-05",
    amountGbp: 3.4,
    status: "approved",
  },
];

export function ReimbursementsPage() {
  return (
    <section className="page">
      <h1>Reimbursement queue</h1>
      <p className="page-owner">Student 4 · mock UI first</p>
      <p className="page-hint">
        Only <strong>home</strong> sessions get reimbursed. Add Approve / Mark
        paid buttons (can be fake click handlers until API exists).
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Amount (£)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_QUEUE.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.driverId}</td>
                <td>{r.vehicleId}</td>
                <td>{r.amountGbp.toFixed(2)}</td>
                <td>{r.status}</td>
                <td>
                  <button className="btn" type="button" disabled>
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
