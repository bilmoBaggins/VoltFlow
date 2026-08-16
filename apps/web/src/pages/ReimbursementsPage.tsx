/**
 * OWNER: Student 4 — Home reimbursement queue
 * Mockup: docs/mockups/voltflow-reimbursement-queue.png
 * Data: GET /reimbursements?status=pending, PATCH /reimbursements/:id/status
 */
import { useEffect, useMemo, useState } from "react";
import { fetchReimbursements, updateReimbursementStatus } from "../api/client";
import type { ClaimStatus, ReimbursementClaim } from "../types/reimbursement";
import "./ReimbursementsPage.css";

/** Seeded charging times are UK local wall-clock times; render them as stored. */
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

function formatTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

/** Matches the row density in the mockup. */
const PAGE_SIZE = 3;

/** One entry per filterable column; all values are raw input strings. */
interface Filters {
  driver: string;
  vehicle: string;
  energyMin: string;
  energyMax: string;
  amountMin: string;
  amountMax: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

/** Opens on the pending queue, which is what this page is named for. */
const EMPTY_FILTERS: Filters = {
  driver: "",
  vehicle: "",
  energyMin: "",
  energyMax: "",
  amountMin: "",
  amountMax: "",
  dateFrom: "",
  dateTo: "",
  status: "pending",
};

function isEmptyFilters(filters: Filters): boolean {
  return (Object.keys(filters) as (keyof Filters)[]).every(
    (key) => filters[key] === EMPTY_FILTERS[key],
  );
}

function includesText(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

/** Blank bounds are ignored; a non-numeric bound is treated as blank. */
function withinRange(value: number, min: string, max: string): boolean {
  const lower = Number.parseFloat(min);
  const upper = Number.parseFloat(max);
  if (!Number.isNaN(lower) && value < lower) return false;
  if (!Number.isNaN(upper) && value > upper) return false;
  return true;
}

function matchesFilters(claim: ReimbursementClaim, filters: Filters): boolean {
  if (filters.status && claim.status !== filters.status) return false;

  if (
    filters.driver.trim() &&
    !includesText(`${claim.driverName} ${claim.driverId}`, filters.driver)
  ) {
    return false;
  }

  if (
    filters.vehicle.trim() &&
    !includesText(`${claim.vehicleModel} ${claim.plate}`, filters.vehicle)
  ) {
    return false;
  }

  if (!withinRange(claim.energyKwh, filters.energyMin, filters.energyMax)) {
    return false;
  }

  if (!withinRange(amountFor(claim), filters.amountMin, filters.amountMax)) {
    return false;
  }

  // chargedAt is UTC and rendered as UTC, so comparing the date part as a
  // string matches what the Date column actually shows.
  const day = claim.chargedAt.slice(0, 10);
  if (filters.dateFrom && day < filters.dateFrom) return false;
  if (filters.dateTo && day > filters.dateTo) return false;

  return true;
}

function loadErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to load claims";
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** The API already computes the payable amount; fall back for older rows. */
function amountFor(claim: ReimbursementClaim): number {
  return claim.amountGbp ?? (claim.energyKwh * claim.priceP) / 100;
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

/**
 * Gold marks a claim still waiting on a decision, so it applies only while the
 * claim is pending — once approved or paid, the steps reached are green.
 * Rejected claims render a plain badge instead of this stepper.
 */
function stepState(status: ClaimStatus, i: number): string {
  const idx = stepIndex(status);
  if (i < idx) return "done";
  if (i === idx) return status === "pending" ? "current" : "done";
  return "upcoming";
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

export function ReimbursementsPage() {
  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  /** Claim awaiting a rejection reason, and the reason being typed. */
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [requestedPage, setRequestedPage] = useState(1);

  const pending = useMemo(
    () => claims.filter((claim) => matchesFilters(claim, filters)),
    [claims, filters],
  );
  const selected = claims.find((c) => c.id === selectedId) ?? null;
  const filtersActive = !isEmptyFilters(filters);

  const totalPages = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  // Derived rather than stored, so the page stays valid when filtering or
  // actioning shrinks the list out from under it.
  const page = Math.min(requestedPage, totalPages);
  const firstIndex = (page - 1) * PAGE_SIZE;
  const visible = pending.slice(firstIndex, firstIndex + PAGE_SIZE);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setRequestedPage(1);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setRequestedPage(1);
  }

  /**
   * Mount fetch. State is only ever set from the promise callbacks — a
   * synchronous setState in an effect body cascades an extra render, which
   * react-hooks/set-state-in-effect rejects. `loading` already starts true.
   *
   * Every claim is fetched so the status filter can reach decided ones; the
   * filter defaults to pending, which is the queue this page is named for.
   */
  useEffect(() => {
    fetchReimbursements()
      .then(setClaims)
      .catch((err: unknown) => {
        setError(loadErrorMessage(err));
        setClaims([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /** Reload from a click, where setting state synchronously is fine. */
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setClaims(await fetchReimbursements());
    } catch (err) {
      setError(loadErrorMessage(err));
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * The actioned claim stays in the table showing its new status, so the
   * decision is visible straight away. It leaves the default view on the next
   * reload, when the pending filter is reapplied.
   */
  async function setStatus(id: string, status: ClaimStatus, notes?: string) {
    setActioningId(id);
    setError(null);
    try {
      const updated = await updateReimbursementStatus(id, status, notes);
      setClaims((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${status} the claim`,
      );
    } finally {
      setActioningId(null);
    }
  }

  function openRejectDialog(id: string) {
    setRejectingId(id);
    setRejectReason("");
  }

  async function confirmReject() {
    const id = rejectingId;
    const reason = rejectReason.trim();
    if (!id || reason === "") return;
    setRejectingId(null);
    await setStatus(id, "rejected", reason);
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
      <div className={selected ? "rb-content" : "rb-content is-full"}>
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
              onClick={refresh}
              aria-label="Refresh"
              title="Reload claims"
              disabled={loading}
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
                <tr className="rb-filter-row">
                  <th>
                    <input
                      type="search"
                      className="rb-filter-input"
                      placeholder="Name or ID"
                      aria-label="Filter by driver"
                      value={filters.driver}
                      onChange={(e) => setFilter("driver", e.target.value)}
                    />
                  </th>
                  <th>
                    <input
                      type="search"
                      className="rb-filter-input"
                      placeholder="Model or plate"
                      aria-label="Filter by vehicle"
                      value={filters.vehicle}
                      onChange={(e) => setFilter("vehicle", e.target.value)}
                    />
                  </th>
                  <th>
                    <div className="rb-filter-range">
                      <input
                        type="number"
                        className="rb-filter-input"
                        placeholder="Min"
                        aria-label="Minimum energy in kWh"
                        value={filters.energyMin}
                        onChange={(e) => setFilter("energyMin", e.target.value)}
                      />
                      <input
                        type="number"
                        className="rb-filter-input"
                        placeholder="Max"
                        aria-label="Maximum energy in kWh"
                        value={filters.energyMax}
                        onChange={(e) => setFilter("energyMax", e.target.value)}
                      />
                    </div>
                  </th>
                  <th>
                    <div className="rb-filter-range">
                      <input
                        type="number"
                        className="rb-filter-input"
                        placeholder="Min £"
                        aria-label="Minimum amount in pounds"
                        value={filters.amountMin}
                        onChange={(e) => setFilter("amountMin", e.target.value)}
                      />
                      <input
                        type="number"
                        className="rb-filter-input"
                        placeholder="Max £"
                        aria-label="Maximum amount in pounds"
                        value={filters.amountMax}
                        onChange={(e) => setFilter("amountMax", e.target.value)}
                      />
                    </div>
                  </th>
                  <th>
                    <div className="rb-filter-range">
                      <input
                        type="date"
                        className="rb-filter-input"
                        aria-label="Charged on or after"
                        value={filters.dateFrom}
                        onChange={(e) => setFilter("dateFrom", e.target.value)}
                      />
                      <input
                        type="date"
                        className="rb-filter-input"
                        aria-label="Charged on or before"
                        value={filters.dateTo}
                        onChange={(e) => setFilter("dateTo", e.target.value)}
                      />
                    </div>
                  </th>
                  <th>
                    <select
                      className="rb-filter-input"
                      aria-label="Filter by status"
                      value={filters.status}
                      onChange={(e) => setFilter("status", e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="rb-filter-clear"
                      onClick={resetFilters}
                      disabled={!filtersActive}
                    >
                      Reset
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((claim) => (
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
                    <td>{formatDate(claim.chargedAt)}</td>
                    <td>
                      <span className={`rb-badge rb-badge-${claim.status}`}>
                        {claim.status[0].toUpperCase() + claim.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {claim.status === "pending" ? (
                        <div className="rb-actions">
                          <button
                            type="button"
                            className="rb-btn rb-btn-approve"
                            disabled={actioningId === claim.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void setStatus(claim.id, "approved");
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="rb-btn rb-btn-reject"
                            disabled={actioningId === claim.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openRejectDialog(claim.id);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="rb-actioned">
                          {claim.status === "rejected"
                            ? "Rejected"
                            : "Actioned"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={7} className="rb-empty">
                      Loading claims…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="rb-empty rb-error">
                      {error}
                      <button
                        type="button"
                        className="rb-btn rb-btn-approve"
                        onClick={refresh}
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                )}
                {!loading && !error && pending.length === 0 && (
                  <tr>
                    <td colSpan={7} className="rb-empty">
                      {claims.length === 0
                        ? "All caught up — no claims."
                        : "No claims match these filters."}
                      {claims.length > 0 && filtersActive && (
                        <button
                          type="button"
                          className="rb-btn rb-btn-approve"
                          onClick={resetFilters}
                        >
                          Reset filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rb-pagination">
            <span className="muted">
              {pending.length === 0
                ? "Showing 0 claims"
                : `Showing ${firstIndex + 1}–${firstIndex + visible.length} of ${pending.length}`}
              {pending.length !== claims.length &&
                ` (filtered from ${claims.length})`}
            </span>
            <nav className="rb-pager" aria-label="Pagination">
              <button
                type="button"
                className="rb-pager-btn"
                onClick={() => setRequestedPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    className={
                      number === page ? "rb-pager-page" : "rb-pager-btn"
                    }
                    onClick={() => setRequestedPage(number)}
                    aria-label={`Page ${number}`}
                    aria-current={number === page ? "page" : undefined}
                  >
                    {number}
                  </button>
                ),
              )}
              <button
                type="button"
                className="rb-pager-btn"
                onClick={() => setRequestedPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          </div>
        </section>

        {selected && (
          <aside className="rb-details">
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
            {/* A rejected claim never enters the approve/pay track, so the
                timeline would only show steps it can never reach. */}
            {selected.status === "rejected" ? (
              <div className="rb-status-rejected">Rejected</div>
            ) : (
              <div className="rb-stepper">
                {STEPS.map((step, i) => {
                  const state = stepState(selected.status, i);
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
            )}

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
                  {formatDate(selected.chargedAt)},{" "}
                  {formatTime(selected.chargedAt)}
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
                <dd
                  className={
                    selected.status === "rejected" ? "rb-note-reason" : ""
                  }
                >
                  {selected.notes}
                </dd>
              </div>
            </dl>

            {selected.status === "pending" ? (
              <div className="rb-details-actions">
                <button
                  type="button"
                  className="rb-btn-wide rb-btn-approve-wide"
                  disabled={actioningId === selected.id}
                  onClick={() => void setStatus(selected.id, "approved")}
                >
                  {actioningId === selected.id ? "Saving…" : "Approve claim"}
                </button>
                <button
                  type="button"
                  className="rb-btn-wide rb-btn-reject-wide"
                  disabled={actioningId === selected.id}
                  onClick={() => openRejectDialog(selected.id)}
                >
                  Reject claim
                </button>
              </div>
            ) : (
              <div className="rb-details-actions">
                <p
                  className={`rb-outcome rb-outcome-${
                    selected.status === "rejected" ? "rejected" : "approved"
                  }`}
                >
                  {selected.status === "rejected"
                    ? "This claim was rejected."
                    : `This claim was ${selected.status}.`}
                </p>
                {/* Paying is only the step after approval — a rejected or
                        already-paid claim has nowhere left to go. */}
                {selected.status === "approved" && (
                  <button
                    type="button"
                    className="rb-btn-wide rb-btn-paid-wide"
                    disabled={actioningId === selected.id}
                    onClick={() => void setStatus(selected.id, "paid")}
                  >
                    {actioningId === selected.id ? "Saving…" : "Mark as paid"}
                  </button>
                )}
              </div>
            )}
          </aside>
        )}
      </div>

      {rejectingId && (
        <div
          className="rb-modal-backdrop"
          role="presentation"
          onClick={() => setRejectingId(null)}
        >
          <div
            className="rb-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rb-reject-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="rb-reject-title">Reject claim</h2>
            <p className="rb-modal-text">
              Give a reason for rejecting {rejectingId}. It is saved to the
              claim&rsquo;s notes.
            </p>
            <label className="rb-modal-label" htmlFor="rb-reject-reason">
              Reason
            </label>
            <textarea
              id="rb-reject-reason"
              className="rb-modal-input"
              rows={3}
              autoFocus
              value={rejectReason}
              placeholder="e.g. Duplicate of an earlier claim"
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="rb-modal-actions">
              <button
                type="button"
                className="rb-btn rb-btn-reject"
                onClick={() => setRejectingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rb-btn rb-btn-confirm-reject"
                disabled={rejectReason.trim() === ""}
                onClick={() => void confirmReject()}
              >
                Reject claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
