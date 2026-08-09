import { NavLink, Outlet } from "react-router-dom";
import "./AppLayout.css";

const links = [
  { to: "/vehicle/ev-01", label: "Vehicle", owner: "Student 2" },
  { to: "/sessions", label: "Sessions", owner: "Student 3" },
  { to: "/reimbursements", label: "Reimbursements", owner: "Student 4" },
  { to: "/ai", label: "Ask AI", owner: "Student 5" },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">VoltFlow</span>
          <span className="brand-sub">Fleet portal</span>
        </div>
        <nav className="app-nav" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              title={`Owned by ${link.owner}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
