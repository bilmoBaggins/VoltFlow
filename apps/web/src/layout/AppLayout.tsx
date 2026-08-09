import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./AppLayout.css";

function ZapIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 2 4 11h5l-1 7 7-9h-5l1-7z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 12.5 5 7.8a1.6 1.6 0 0 1 1.5-1.1h7a1.6 1.6 0 0 1 1.5 1.1l1.5 4.7" />
      <rect x="2.5" y="12.5" width="15" height="3.5" rx="1" />
      <circle cx="6" cy="16.3" r="1.1" />
      <circle cx="14" cy="16.3" r="1.1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="6.5" r="3.3" />
      <path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 2.5h6.5L15.5 6.5V17a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z" />
      <path d="M11.5 2.5V6.5h4" />
      <path d="M6.8 10.5h6.4M6.8 13.3h6.4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3.5c.4 2.4 1.1 3.6 4 4-2.9.4-3.6 1.6-4 4-.4-2.4-1.1-3.6-4-4 2.9-.4 3.6-1.6 4-4z" />
      <path d="M15.5 12.8c.2 1.1.6 1.6 1.8 1.8-1.2.2-1.6.7-1.8 1.8-.2-1.1-.6-1.6-1.8-1.8 1.2-.2 1.6-.7 1.8-1.8z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 16.5v-5M9 16.5v-9M14.5 16.5v-3" />
      <path d="M2.5 16.5h15" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 3.2v1.7M10 15.1v1.7M16.8 10h-1.7M4.9 10H3.2M14.8 5.2l-1.2 1.2M6.4 13.4l-1.2 1.2M14.8 14.8l-1.2-1.2M6.4 6.6 5.2 5.4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.3 11.7 11.7 8.3" />
      <path d="M9 5.6l.9-.9a3 3 0 0 1 4.4 4.4l-.9.9M11 14.4l-.9.9a3 3 0 0 1-4.4-4.4l.9-.9" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2.5" width="8" height="15" rx="0.6" />
      <path d="M6.3 5.5h1M6.3 8.3h1M6.3 11.1h1M9.7 5.5h1M9.7 8.3h1M9.7 11.1h1" />
      <path d="M12 8h3.5a.5.5 0 0 1 .5.5v9" />
      <path d="M14 11h.7M14 13.5h.7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

type NavItemProps = {
  to?: string;
  end?: boolean;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
};

function NavItem({ to, end, icon, label, disabled }: NavItemProps) {
  if (disabled || !to) {
    return (
      <span className="nav-link disabled" aria-disabled="true">
        <span className="nav-icon">{icon}</span>
        <span className="nav-label">{label}</span>
        <span className="nav-soon">Soon</span>
      </span>
    );
  }
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const location = useLocation();
  const isReimbursementsActive =
    location.pathname.startsWith("/reimbursements");
  const [reimbursementsOpen, setReimbursementsOpen] = useState(
    isReimbursementsActive,
  );
  const [prevReimbursementsActive, setPrevReimbursementsActive] = useState(
    isReimbursementsActive,
  );

  // Adjusting state during render (not in an effect) on navigating into
  // /reimbursements — see https://react.dev/learn/you-might-not-need-an-effect
  if (isReimbursementsActive !== prevReimbursementsActive) {
    setPrevReimbursementsActive(isReimbursementsActive);
    if (isReimbursementsActive) {
      setReimbursementsOpen(true);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">
            <ZapIcon />
          </span>
          <span className="brand-mark">VoltFlow</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          <NavItem to="/" end icon={<GridIcon />} label="Overview" />
          <NavItem to="/vehicle/ev-01" icon={<CarIcon />} label="Vehicles" />
          <NavItem icon={<UserIcon />} label="Drivers" disabled />
          <NavItem to="/sessions" icon={<ZapIcon />} label="Charging" />

          <div className="nav-group">
            <div
              className={isReimbursementsActive ? "nav-row active" : "nav-row"}
            >
              <NavLink to="/reimbursements" className="nav-link">
                <span className="nav-icon">
                  <FileIcon />
                </span>
                <span className="nav-label">Reimbursements</span>
              </NavLink>
              <button
                type="button"
                className={
                  reimbursementsOpen ? "nav-chevron open" : "nav-chevron"
                }
                aria-expanded={reimbursementsOpen}
                aria-label={
                  reimbursementsOpen
                    ? "Collapse Reimbursements"
                    : "Expand Reimbursements"
                }
                onClick={() => setReimbursementsOpen((open) => !open)}
              >
                <ChevronDownIcon />
              </button>
            </div>
            {reimbursementsOpen && (
              <div className="nav-subgroup">
                <NavLink
                  to="/reimbursements"
                  end
                  className={({ isActive }) =>
                    isActive ? "nav-sublink active" : "nav-sublink"
                  }
                >
                  Queue
                </NavLink>
                <span className="nav-sublink disabled">
                  History
                  <span className="nav-soon">Soon</span>
                </span>
              </div>
            )}
          </div>

          <NavItem to="/ai" icon={<SparkleIcon />} label="Ask AI" />
          <NavItem icon={<BarChartIcon />} label="Reports" disabled />
          <NavItem icon={<GearIcon />} label="Settings" disabled />
          <NavItem icon={<LinkIcon />} label="Integrations" disabled />
        </nav>

        <button type="button" className="org-switcher">
          <span className="org-icon">
            <BuildingIcon />
          </span>
          <span className="org-text">
            <span className="org-name">Acme Logistics</span>
            <span className="org-tier">Enterprise</span>
          </span>
          <span className="org-chevron">
            <ChevronDownIcon />
          </span>
        </button>
      </aside>

      <div className="app-content">
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
