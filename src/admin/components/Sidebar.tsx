import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const Sidebar = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {
      await signOut(auth);

      localStorage.removeItem("user");

      navigate("/admin/login");
    } catch (error) {
      console.error(error);
      alert("Logout failed.");
    }
  };

  // Mobile menu click করলে sidebar close হবে
  const handleMenuClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="mobile-admin-header">
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>

        <h5>Admin Panel</h5>
      </div>


      {/* ================= OVERLAY ================= */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}


      {/* ================= SIDEBAR ================= */}
      <aside
        className={`admin-sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* Sidebar Header */}
        <div className="sidebar-header">

          <h4>Admin Panel</h4>

          {/* Mobile Close Button */}
          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>

        </div>


        {/* ================= MENU ================= */}
        <ul className="nav flex-column sidebar-menu">

          {/* Dashboard */}
          <li className="nav-item">
            <NavLink
              to="/admin/dashboard"
              onClick={handleMenuClick}
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? "bg-primary text-white rounded"
                    : "text-white"
                }`
              }
            >
              🏠 Dashboard
            </NavLink>
          </li>


          {/* Settings */}
          <li className="nav-item">
            <NavLink
              to="/admin/settings"
              onClick={handleMenuClick}
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? "bg-primary text-white rounded"
                    : "text-white"
                }`
              }
            >
              ⚙️ Settings
            </NavLink>
          </li>


          {/* Add Member */}
          {(role === "admin" || role === "editor") && (
            <li className="nav-item">
              <NavLink
                to="/admin/members"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                ➕ Add Member
              </NavLink>
            </li>
          )}


          {/* View Members */}
          {(role === "admin" || role === "editor") && (
            <li className="nav-item">
              <NavLink
                to="/admin/viewmembers"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                👥 View Members
              </NavLink>
            </li>
          )}


          {/* Subscription */}
          {(role === "admin" || role === "account") && (
            <li className="nav-item">
              <NavLink
                to="/admin/subscription"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                💰 Subscription
              </NavLink>
            </li>
          )}


          {/* Notice */}
          {(role === "admin" || role === "editor") && (
            <li className="nav-item">
              <NavLink
                to="/admin/notice"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                📢 Notice
              </NavLink>
            </li>
          )}


          {/* Donation */}
          {role === "admin" && (
            <li className="nav-item">
              <NavLink
                to="/admin/donation"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                ❤️ Donation
              </NavLink>
            </li>
          )}


          {/* Expense */}
          {(role === "admin" || role === "account") && (
            <li className="nav-item">
              <NavLink
                to="/admin/expense"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                👛 Expense
              </NavLink>
            </li>
          )}


          {/* Activities */}
          {(role === "admin" || role === "editor") && (
            <li className="nav-item">
              <NavLink
                to="/admin/adminactivities"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                📷 Activities
              </NavLink>
            </li>
          )}


          {/* Medical Info */}
          {(role === "admin" || role === "editor") && (
            <li className="nav-item">
              <NavLink
                to="/admin/medical-info"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                🩺 Medical Info
              </NavLink>
            </li>
          )}


          {/* Emergency Numbers */}
          {(role === "admin" || role === "editor") && (
            <li className="nav-item">
              <NavLink
                to="/admin/emergency-numbers"
                onClick={handleMenuClick}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "bg-primary text-white rounded"
                      : "text-white"
                  }`
                }
              >
                🚨 Emergency Numbers
              </NavLink>
            </li>
          )}


          {/* Logout */}
          <li className="nav-item logout-item">

            <button
              onClick={handleLogout}
              className="btn btn-danger w-100"
            >
              🚪 Logout
            </button>

          </li>

        </ul>

      </aside>
    </>
  );
};

export default Sidebar;

