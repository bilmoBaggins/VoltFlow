/**
 * OWNER: Student 5 — Ask AI Advisor
 * Task: Pick a vehicle, show CHARGE / WAIT / STOP + reason (mock first).
 * Mockup: docs/mockups/voltflow-ai-advisor.png
 * API later: POST /ai/decide
 */
import { useState } from "react";

type Decision = "CHARGE" | "WAIT" | "STOP";

const MOCK_DECISION: { action: Decision; reason: string } = {
  action: "WAIT",
  reason: "Price is high and battery is above 40%. Wait for cheaper window.",
};

export function AiAdvisorPage() {
  const [vehicleId, setVehicleId] = useState("ev-01");
  const [result, setResult] = useState<typeof MOCK_DECISION | null>(null);

  return (
    <section className="page">
      <h1>Ask AI</h1>
      <p className="page-owner">Student 5 · mock UI first</p>
      <p className="page-hint">
        Build the form + result panel now. Later call{" "}
        <code>POST /ai/decide</code> with vehicle + grid snapshot.
      </p>

      <label>
        Vehicle{" "}
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          {["ev-01", "ev-02", "ev-03", "ev-04", "ev-05"].map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </label>

      <p>
        <button
          className="btn"
          type="button"
          onClick={() => setResult(MOCK_DECISION)}
        >
          Ask AI
        </button>
      </p>

      {result && (
        <div className="table-wrap">
          <table>
            <tbody>
              <tr>
                <th>Vehicle</th>
                <td>{vehicleId}</td>
              </tr>
              <tr>
                <th>Action</th>
                <td>{result.action}</td>
              </tr>
              <tr>
                <th>Reason</th>
                <td>{result.reason}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
