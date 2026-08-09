/**
 * OWNER: Student 4 — Home reimbursement queue
 * Mockup: docs/mockups/voltflow-reimbursement-queue.png
 * Mock data for now — API later: GET /reimbursements?status=pending, approve / mark-paid
 */
import { useState } from "react";
import "./ReimbursementsPage.css";

type ClaimStatus = "pending" | "approved" | "paid" | "rejected";

interface ReimbursementClaim {
  id: string;
  driverName: string;
  driverId: string;
  vehicleModel: string;
  plate: string;
  energyKwh: number;
  priceP: number;
  date: string;
  time: string;
  status: ClaimStatus;
  location: string;
  gridRegion: string;
  tariff: string;
  source: string;
  notes: string;
}

const INITIAL_CLAIMS: ReimbursementClaim[] = [
  {
    id: "CLM-2026-0807-001",
    driverName: "Olivia Smith",
    driverId: "DRV-1048",
    vehicleModel: "Tesla Model Y",
    plate: "LR72 HCP",
    energyKwh: 42.31,
    priceP: 29.9,
    date: "7 Aug 2026",
    time: "07:15",
    status: "pending",
    location: "London, Home",
    gridRegion: "C",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0806-004",
    driverName: "James Wright",
    driverId: "DRV-1023",
    vehicleModel: "Kia EV6",
    plate: "LC71 FZD",
    energyKwh: 37.84,
    priceP: 29.92,
    date: "6 Aug 2026",
    time: "22:40",
    status: "pending",
    location: "Leeds, Home",
    gridRegion: "M",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0805-002",
    driverName: "Emma Harris",
    driverId: "DRV-1077",
    vehicleModel: "Hyundai IONIQ 5",
    plate: "EN21 ZYT",
    energyKwh: 51.62,
    priceP: 29.97,
    date: "5 Aug 2026",
    time: "06:05",
    status: "pending",
    location: "Bristol, Home",
    gridRegion: "L",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0801-001",
    driverName: "Ryan Walsh",
    driverId: "DRV-1140",
    vehicleModel: "Ford Mustang Mach-E",
    plate: "NC20 JWR",
    energyKwh: 56.3,
    priceP: 26.95,
    date: "1 Aug 2026",
    time: "05:30",
    status: "pending",
    location: "Newcastle, Home",
    gridRegion: "F",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0802-002",
    driverName: "Daniel Clarke",
    driverId: "DRV-1129",
    vehicleModel: "BMW i4",
    plate: "LV22 QWE",
    energyKwh: 39.75,
    priceP: 30.1,
    date: "2 Aug 2026",
    time: "06:45",
    status: "pending",
    location: "Liverpool, Home",
    gridRegion: "D",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0802-009",
    driverName: "Megan Foster",
    driverId: "DRV-1177",
    vehicleModel: "Renault Megane E-Tech",
    plate: "KT77 LMN",
    energyKwh: 36.85,
    priceP: 31.2,
    date: "2 Aug 2026",
    time: "22:00",
    status: "pending",
    location: "Maidstone, Home",
    gridRegion: "J",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0803-005",
    driverName: "Sophie Turner",
    driverId: "DRV-1115",
    vehicleModel: "VW ID.4",
    plate: "NG68 RPX",
    energyKwh: 45.1,
    priceP: 27.85,
    date: "3 Aug 2026",
    time: "23:05",
    status: "pending",
    location: "Nottingham, Home",
    gridRegion: "B",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0804-003",
    driverName: "Liam Brown",
    driverId: "DRV-1102",
    vehicleModel: "Nissan Leaf",
    plate: "BD19 MKL",
    energyKwh: 33.2,
    priceP: 28.4,
    date: "4 Aug 2026",
    time: "19:20",
    status: "pending",
    location: "Cambridge, Home",
    gridRegion: "A",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0804-008",
    driverName: "Harry Osei",
    driverId: "DRV-1163",
    vehicleModel: "Skoda Enyaq",
    plate: "SO18 ZQP",
    energyKwh: 44.6,
    priceP: 27.1,
    date: "4 Aug 2026",
    time: "07:50",
    status: "pending",
    location: "Southampton, Home",
    gridRegion: "H",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0805-010",
    driverName: "Callum Reid",
    driverId: "DRV-1188",
    vehicleModel: "Audi Q4 e-tron",
    plate: "CF44 VBN",
    energyKwh: 50.15,
    priceP: 28.05,
    date: "5 Aug 2026",
    time: "18:35",
    status: "pending",
    location: "Cardiff, Home",
    gridRegion: "K",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0806-007",
    driverName: "Chloe Bennett",
    driverId: "DRV-1152",
    vehicleModel: "MG4",
    plate: "MA69 GHT",
    energyKwh: 41.05,
    priceP: 29.35,
    date: "6 Aug 2026",
    time: "20:15",
    status: "pending",
    location: "Manchester, Home",
    gridRegion: "G",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0808-006",
    driverName: "Priya Patel",
    driverId: "DRV-1134",
    vehicleModel: "Polestar 2",
    plate: "BM71 XYT",
    energyKwh: 48.9,
    priceP: 28.75,
    date: "8 Aug 2026",
    time: "21:10",
    status: "pending",
    location: "Birmingham, Home",
    gridRegion: "E",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
  {
    id: "CLM-2026-0809-011",
    driverName: "Isla Campbell",
    driverId: "DRV-1199",
    vehicleModel: "Tesla Model 3",
    plate: "ED12 QRS",
    energyKwh: 38.4,
    priceP: 29.6,
    date: "9 Aug 2026",
    time: "06:10",
    status: "pending",
    location: "Edinburgh, Home",
    gridRegion: "N",
    tariff: "Octopus Agile (Flexible)",
    source: "Charge point telemetry",
    notes: "–",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function amountFor(claim: ReimbursementClaim): number {
  return (claim.energyKwh * claim.priceP) / 100;
}

const STEPS: { key: ClaimStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "paid", label: "Paid" },
];

function stepIndex(status: ClaimStatus): number {
  if (status === "rejected") return -1;
  return STEPS.findIndex((s) => s.key === status);
}

function IconMenu() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8M3 12a9 9 0 0 0 15.3 6.4L21 16M21 8V3M21 8h-5M3 16v5M3 16h5" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconCopy() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function IconNote() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Overview", icon: "🚗" },
  { label: "Vehicles", icon: "🚙" },
  { label: "Drivers", icon: "🧑" },
  { label: "Charging", icon: "⚡" },
  { label: "Reimbursements", icon: "📄", active: true },
  { label: "Reports", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
  { label: "Integrations", icon: "🔗" },
];

export function ReimbursementsPage() {
  const [claims, setClaims] = useState<ReimbursementClaim[]>(INITIAL_CLAIMS);
  const pending = claims.filter((c) => c.status === "pending");
  const [selectedId, setSelectedId] = useState<string | null>(
    pending[0]?.id ?? null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = claims.find((c) => c.id === selectedId) ?? null;

  function setStatus(id: string, status: ClaimStatus) {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setSelectedId((current) => {
      if (current !== id) return current;
      const remaining = claims.filter(
        (c) => c.status === "pending" && c.id !== id,
      );
      return remaining[0]?.id ?? null;
    });
  }

  function resetDemo() {
    setClaims(INITIAL_CLAIMS);
    setSelectedId(INITIAL_CLAIMS[0].id);
  }

  async function copyClaimId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — nothing to fall back to in this demo
    }
  }

  return (
    <div className="rb-shell">
      <aside className={`rb-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="rb-logo">
          <span className="rb-logo-mark">⚡</span>
          <span className="rb-logo-text">VoltFlow</span>
        </div>

        <nav className="rb-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              <button
                type="button"
                className={`rb-nav-link ${item.active ? "active" : ""}`}
              >
                <span className="rb-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
              {item.active && (
                <div className="rb-subnav">
                  <button type="button" className="rb-subnav-link active">
                    Queue
                  </button>
                  <button type="button" className="rb-subnav-link">
                    History
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="rb-org">
          <span className="rb-org-icon" aria-hidden="true">
            🏢
          </span>
          <div className="rb-org-text">
            <strong>Acme Logistics</strong>
            <span>Enterprise</span>
          </div>
          <IconChevronDown />
        </div>
      </aside>

      <div className="rb-main">
        <header className="rb-topbar">
          <div className="rb-topbar-left">
            <button
              type="button"
              className="rb-icon-btn rb-menu-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              <IconMenu />
            </button>
            <div className="rb-breadcrumb">
              <span className="muted">Home</span>
              <span className="muted"> / </span>
              <span>Reimbursements</span>
            </div>
          </div>
          <div className="rb-topbar-right">
            <button
              type="button"
              className="rb-icon-btn"
              aria-label="Notifications"
            >
              <IconBell />
            </button>
            <div className="rb-user">
              <span className="rb-avatar">AM</span>
              <div className="rb-user-text">
                <strong>Alex Morgan</strong>
                <span>Fleet Admin</span>
              </div>
              <IconChevronDown />
            </div>
          </div>
        </header>

        <div className="rb-content">
          <section className="rb-queue">
            <div className="rb-queue-head">
              <div>
                <h1>Pending reimbursements</h1>
                <p className="rb-subtitle">
                  Review and action home charging claims submitted by drivers.
                </p>
              </div>
              <button
                type="button"
                className="rb-icon-btn"
                onClick={resetDemo}
                aria-label="Refresh"
                title="Reset demo data"
              >
                <IconRefresh />
              </button>
            </div>

            <div className="rb-table-wrap">
              <table className="rb-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Energy (kWh)</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((claim) => (
                    <tr
                      key={claim.id}
                      className={claim.id === selectedId ? "is-selected" : ""}
                      onClick={() => setSelectedId(claim.id)}
                    >
                      <td>
                        <div className="rb-cell-person">
                          <span className="rb-avatar rb-avatar-sm">
                            {initials(claim.driverName)}
                          </span>
                          <div>
                            <div className="rb-primary">{claim.driverName}</div>
                            <div className="rb-secondary">{claim.driverId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="rb-primary">{claim.vehicleModel}</div>
                        <div className="rb-secondary">{claim.plate}</div>
                      </td>
                      <td>{claim.energyKwh.toFixed(2)} kWh</td>
                      <td className="rb-amount">
                        £{amountFor(claim).toFixed(2)}
                      </td>
                      <td>{claim.date}</td>
                      <td>
                        <span className={`rb-badge rb-badge-${claim.status}`}>
                          {claim.status[0].toUpperCase() +
                            claim.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="rb-actions">
                          <button
                            type="button"
                            className="rb-btn rb-btn-approve"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatus(claim.id, "approved");
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rb-btn rb-btn-reject"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatus(claim.id, "rejected");
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && (
                    <tr>
                      <td colSpan={7} className="rb-empty">
                        All caught up — no pending claims.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rb-pagination">
              <span className="muted">
                Showing {pending.length} of {pending.length}
              </span>
              <div className="rb-pager">
                <button type="button" className="rb-pager-btn" disabled>
                  ‹
                </button>
                <span className="rb-pager-page">1</span>
                <button type="button" className="rb-pager-btn" disabled>
                  ›
                </button>
              </div>
            </div>
          </section>

          <aside className="rb-details">
            {!selected && (
              <div className="rb-details-empty">
                <p>Select a claim to see its details.</p>
              </div>
            )}
            {selected && (
              <>
                <div className="rb-details-head">
                  <h2>Claim details</h2>
                  <button
                    type="button"
                    className="rb-icon-btn"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close claim details"
                  >
                    <IconClose />
                  </button>
                </div>

                <button
                  type="button"
                  className="rb-claim-id"
                  onClick={() => copyClaimId(selected.id)}
                  title="Copy claim ID"
                >
                  <span>
                    Claim ID: <strong>{selected.id}</strong>
                  </span>
                  <IconCopy />
                </button>
                {copied && <div className="rb-copied">Copied!</div>}

                <div className="rb-people">
                  <div className="rb-cell-person">
                    <span className="rb-avatar rb-avatar-sm">
                      {initials(selected.driverName)}
                    </span>
                    <div>
                      <div className="rb-primary">{selected.driverName}</div>
                      <div className="rb-secondary">{selected.driverId}</div>
                    </div>
                  </div>
                  <div className="rb-vehicle-info">
                    <div className="rb-primary">{selected.vehicleModel}</div>
                    <div className="rb-secondary">{selected.plate}</div>
                  </div>
                </div>

                <div className="rb-section-label">Status</div>
                <div className="rb-stepper">
                  {STEPS.map((step, i) => {
                    const idx = stepIndex(selected.status);
                    const state =
                      selected.status === "rejected"
                        ? "rejected"
                        : i < idx
                          ? "done"
                          : i === idx
                            ? "current"
                            : "upcoming";
                    return (
                      <div className="rb-step" key={step.key}>
                        {i > 0 && (
                          <div className={`rb-step-line step-${state}`} />
                        )}
                        <div className="rb-step-node">
                          <span className={`rb-step-circle step-${state}`}>
                            {i + 1}
                          </span>
                          <span className="rb-step-label">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rb-section-label">Cost breakdown</div>
                <div className="rb-cost-card">
                  <div className="rb-cost-row">
                    <div className="rb-cost-item">
                      <span className="rb-cost-label">Energy (kWh)</span>
                      <span className="rb-cost-value">
                        {selected.energyKwh.toFixed(2)}
                      </span>
                    </div>
                    <span className="rb-cost-op">×</span>
                    <div className="rb-cost-item">
                      <span className="rb-cost-label">Agile price (p/kWh)</span>
                      <span className="rb-cost-value">
                        {selected.priceP.toFixed(2)}
                      </span>
                    </div>
                    <span className="rb-cost-op">=</span>
                    <div className="rb-cost-item">
                      <span className="rb-cost-label">Amount</span>
                      <span className="rb-cost-value rb-cost-total">
                        £{amountFor(selected).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="rb-cost-formula">
                    {selected.energyKwh.toFixed(2)} kWh × £
                    {(selected.priceP / 100).toFixed(4)} = £
                    {amountFor(selected).toFixed(2)}
                  </div>
                </div>

                <dl className="rb-detail-list">
                  <div className="rb-detail-row">
                    <dt>
                      <IconCalendar /> Date
                    </dt>
                    <dd>
                      {selected.date}, {selected.time}
                    </dd>
                  </div>
                  <div className="rb-detail-row">
                    <dt>
                      <IconPin /> Location
                    </dt>
                    <dd>{selected.location}</dd>
                  </div>
                  <div className="rb-detail-row">
                    <dt>
                      <IconGrid /> Grid region
                    </dt>
                    <dd>{selected.gridRegion}</dd>
                  </div>
                  <div className="rb-detail-row">
                    <dt>
                      <IconTag /> Tariff
                    </dt>
                    <dd>{selected.tariff}</dd>
                  </div>
                  <div className="rb-detail-row">
                    <dt>
                      <IconDoc /> Source
                    </dt>
                    <dd>{selected.source}</dd>
                  </div>
                  <div className="rb-detail-row">
                    <dt>
                      <IconNote /> Notes
                    </dt>
                    <dd>{selected.notes}</dd>
                  </div>
                </dl>

                <div className="rb-details-actions">
                  <button
                    type="button"
                    className="rb-btn-wide rb-btn-approve-wide"
                    onClick={() => setStatus(selected.id, "approved")}
                  >
                    Approve claim
                  </button>
                  <button
                    type="button"
                    className="rb-btn-wide rb-btn-reject-wide"
                    onClick={() => setStatus(selected.id, "rejected")}
                  >
                    Reject claim
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
