/**
 * OWNER: Student 3 — Sessions & Costs
 * Task: Build sessions table UI (start with mock rows; wire API later).
 * Mockup: docs/mockups/voltflow-sessions-costs.png
 * API later: GET /sessions, POST /sessions/start, POST /sessions/:id/stop
 */
import { useEffect, useRef, useState } from "react";

const SITE_FILTERS = ["all", "home", "depot", "public"] as const;
type SiteFilter = (typeof SITE_FILTERS)[number];

const STAT_CARDS = [
  {
    icon: "wallet",
    label: "Total cost this week",
    value: "£1,248.75",
    sub: "All charging sessions",
  },
  {
    icon: "home",
    label: "Home reimbursements owed",
    value: "£842.13",
    sub: "Pending reimbursements",
  },
  {
    icon: "depot",
    label: "Depot energy cost",
    value: "£406.62",
    sub: "At Depot sites",
  },
] as const;

type IconName = "wallet" | "home" | "depot" | "search" | "calendar" | "export" | "chevron";

function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 11.5 12 4l8 7.5" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "depot":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 4v16M16 4v16M4 12h16" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "export":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v11" />
          <path d="m8 10 4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
  }
}

type ReimbursementStatus = "pending" | "not-required" | "paid";

const STATUS_LABEL: Record<ReimbursementStatus, string> = {
  pending: "Pending",
  "not-required": "Not required",
  paid: "Paid",
};

interface SessionRow {
  id: string;
  date: string; // ISO yyyy-mm-dd
  driver: string;
  vehiclePlate: string;
  vehicleModel: string;
  siteType: Exclude<SiteFilter, "all">;
  siteLabel: string;
  kwh: number;
  pricePerKwh: number;
  costGbp: number;
  status: ReimbursementStatus;
}

const DRIVERS = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "James Wilson",
  "Olivia Taylor",
  "Daniel Miller",
  "Sophia Anderson",
  "William Thomas",
  "Ava White",
  "Liam Harris",
  "Grace Clark",
];

const VEHICLES = [
  { plate: "RJ24 YWW", model: "Tesla Model 3" },
  { plate: "OV24 KXP", model: "Kia Niro EV" },
  { plate: "BX24 LTY", model: "Ford E-Transit" },
  { plate: "GN24 PSD", model: "Nissan Leaf" },
  { plate: "HT24 MQR", model: "Vauxhall Corsa-e" },
];

const SITES: { type: Exclude<SiteFilter, "all">; label: string }[] = [
  { type: "home", label: "Home" },
  { type: "home", label: "Home" },
  { type: "depot", label: "Leeds Depot" },
  { type: "depot", label: "Birmingham Depot" },
  { type: "depot", label: "Manchester Depot" },
  { type: "public", label: "Public – Ionity" },
];

const STATUSES: ReimbursementStatus[] = ["pending", "not-required", "paid"];

function buildSessions(count: number): SessionRow[] {
  return Array.from({ length: count }, (_, i) => {
    const driver = DRIVERS[i % DRIVERS.length];
    const vehicle = VEHICLES[i % VEHICLES.length];
    const site = SITES[i % SITES.length];
    const status = STATUSES[i % STATUSES.length];

    const day = 25 - Math.floor(i / 12); // spread across 19–25 May
    const minutesFromNoon = 480 - (i % 12) * 40;
    const hour = Math.max(6, Math.min(22, 12 + Math.floor(minutesFromNoon / 60)));
    const minute = Math.abs(minutesFromNoon % 60);
    const time = `${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;

    const kwh = Number((14 + ((i * 7) % 40) + (i % 4) * 0.6).toFixed(2));
    const pricePerKwh = Number(
      (site.type === "depot" ? 15.5 + (i % 5) * 0.4 : 20.5 + (i % 4) * 0.5).toFixed(2),
    );
    const costGbp = Number(((kwh * pricePerKwh) / 10).toFixed(2));

    const dayStr = String(day).padStart(2, "0");

    return {
      id: `S-202505${dayStr}-${time}`,
      date: `2025-05-${dayStr}`,
      driver,
      vehiclePlate: vehicle.plate,
      vehicleModel: vehicle.model,
      siteType: site.type,
      siteLabel: site.label,
      kwh,
      pricePerKwh,
      costGbp,
      status,
    };
  });
}

const MOCK_SESSIONS: SessionRow[] = buildSessions(78);
const PAGE_SIZE = 10;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

const DATE_PRESETS: { label: string; from: string; to: string }[] = [
  { label: "This week (19–25 May)", from: "2025-05-19", to: "2025-05-25" },
  { label: "Last 7 days", from: "2025-05-18", to: "2025-05-25" },
  { label: "Last 3 days", from: "2025-05-22", to: "2025-05-25" },
  { label: "All time", from: "2025-05-01", to: "2025-05-25" },
];

export function SessionsPage() {
  const [siteFilter, setSiteFilter] = useState<SiteFilter>("all");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("2025-05-19");
  const [dateTo, setDateTo] = useState("2025-05-25");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectFilter(filter: SiteFilter) {
    setSiteFilter(filter);
    setPage(1);
  }

  function applyPreset(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
    setDatePickerOpen(false);
  }

  const filtered = MOCK_SESSIONS.filter((s) => {
    if (siteFilter !== "all" && s.siteType !== siteFilter) return false;
    if (s.date < dateFrom || s.date > dateTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageSessions = filtered.slice(start, start + PAGE_SIZE);

  function goToPage(p: number) {
    setPage(Math.min(Math.max(p, 1), totalPages));
  }

  return (
    <section className="page">
      <h1>Charging Sessions</h1>

      <div className="filter-bar" role="group" aria-label="Filter by site type">
        {SITE_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              filter === siteFilter ? "filter-btn active" : "filter-btn"
            }
            onClick={() => selectFilter(filter)}
          >
            {filter === "all"
              ? "All"
              : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        {STAT_CARDS.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-icon">
              <Icon name={card.icon} />
            </div>
            <div className="stat-body">
              <p className="stat-label">{card.label}</p>
              <p className="stat-value">{card.value}</p>
              <p className="stat-sub">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sessions-panel">
        <div className="sessions-toolbar">
          <div className="date-picker" ref={datePickerRef}>
            <button
              type="button"
              className="toolbar-btn date-btn"
              onClick={() => setDatePickerOpen((open) => !open)}
            >
              <Icon name="calendar" />
              {formatDisplayDate(dateFrom)} – {formatDisplayDate(dateTo)}
              <Icon name="chevron" />
            </button>

            {datePickerOpen && (
              <div className="date-picker-panel">
                <div className="date-picker-presets">
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="date-preset-btn"
                      onClick={() => applyPreset(preset.from, preset.to)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="date-picker-custom">
                  <label>
                    From
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setPage(1);
                      }}
                    />
                  </label>
                  <label>
                    To
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setPage(1);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn date-done-btn"
                    onClick={() => setDatePickerOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          <label className="search-field">
            <Icon name="search" />
            <input type="text" placeholder="Search sessions..." />
          </label>

          <button type="button" className="toolbar-btn export-btn">
            <Icon name="export" />
            Export
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Site</th>
                <th>kWh</th>
                <th>Price p/kWh</th>
                <th>Cost GBP</th>
                <th>Reimbursement status</th>
              </tr>
            </thead>
            <tbody>
              {pageSessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.driver}</td>
                  <td>
                    <div className="vehicle-cell">
                      <span>{s.vehiclePlate}</span>
                      <span className="muted">{s.vehicleModel}</span>
                    </div>
                  </td>
                  <td>
                    <span className="site-cell">
                      <Icon name={s.siteType === "home" ? "home" : "depot"} />
                      {s.siteLabel}
                    </span>
                  </td>
                  <td>{s.kwh.toFixed(2)}</td>
                  <td>{s.pricePerKwh.toFixed(2)}</td>
                  <td>£{s.costGbp.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${s.status}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {pageSessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    No sessions for this filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <span className="muted">
            Showing {filtered.length === 0 ? 0 : start + 1} to{" "}
            {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
            sessions
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="page-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={p === currentPage ? "page-btn active" : "page-btn"}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="page-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
