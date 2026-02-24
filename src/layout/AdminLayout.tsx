import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const navItems = [
  { to: "/", icon: "fa fa-home", label: "Home" },
  { to: "/calendar", icon: "fa fa-calendar", label: "Calendar" },
  { to: "/tasks", icon: "fa fa-tasks", label: "Tasks" },
  { to: "/cases", icon: "fa fa-briefcase", label: "Cases" },
  { to: "/contacts", icon: "bi bi-person-lines-fill", label: "Contacts" },
  { to: "/caseContacts", icon: "bi bi-link-45deg", label: "Case Contacts" },
  { to: "/pnc", icon: "fa fa-user-plus", label: "PNCs / Leads" },
  { to: "/messages", icon: "fa fa-comments", label: "Messages" },
  { to: "/calllog-text", icon: "fa fa-phone", label: "Call Log & Text" },
  { to: "/time-loss", icon: "fa fa-clock", label: "Time Loss" },
  { to: "/fee-list", icon: "bi bi-currency-dollar", label: "Fee List" },
  { to: "/excel-list", icon: "bi bi-file-excel", label: "Excel List" },
  { to: "/ChatPage", icon: "bi bi-chat", label: "ChatPage" },
];

const storedUser = localStorage.getItem("user");
const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
// console.log("loggedInUser",loggedInUser._id)

export default function AdminLayout() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Restore sidebar state
  useEffect(() => {
    const val = localStorage.getItem("cv_admin_sidebar_hidden");
    setSidebarHidden(val === "1");
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    document.body.classList.remove("admin-overlay");
  }, [location.pathname]);

  const wrapperClass = useMemo(() => {
    const parts = ["admin-app", "d-flex"];
    if (sidebarHidden) parts.push("sidebar-hidden");
    if (sidebarOpen) parts.push("sidebar-open");
    return parts.join(" ");
  }, [sidebarHidden, sidebarOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 992) {
      const hidden = !sidebarHidden;
      setSidebarHidden(hidden);
      localStorage.setItem("cv_admin_sidebar_hidden", hidden ? "1" : "0");
    } else {
      const open = !sidebarOpen;
      setSidebarOpen(open);
      document.body.classList.toggle("admin-overlay", open);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={wrapperClass}>
      <nav id="sidebar" className="sidebar text-white">
        <div className="sidebar-header p-2">
          <img
            src="/assets/images/logo.png"
            alt="logo"
            style={{ width: 150 }}
          />
        </div>

        <ul className="nav px-2 pt-3">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink className="nav-link text-white" to={item.to}>
                <i className={item.icon}></i> {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="content w-100">
        <header className="p-0">
          <div className="header-inner d-flex justify-content-between p-2">
            <div className="d-flex">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={toggleSidebar}
              >
                ☰
              </button>
              <input
                type="search"
                className="form-control"
                placeholder="Search"
              />
            </div>

            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                {loggedInUser.name}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <main className="p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



// const AdminLayout: React.FC = () => {
//   const { isConnected } = useSocket(); // ✅ inside component
// console.log("check",isConnected)
//   return (
//     <div>
//       {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
//     </div>
//   );
// };

// export default AdminLayout;