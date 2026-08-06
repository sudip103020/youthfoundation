import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";


const Sidebar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const role = user.role;

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {
      await signOut(auth);

      // Remove login session
      localStorage.removeItem("user");

      navigate("/admin/login");

    } catch (error) {
      console.error(error);
      alert("Logout failed.");
    }
  };

  return (
    <div
      className="bg-dark text-white p-3 d-flex flex-column"
      style={{
        width: "250px",
        minHeight: "100vh",
      }}
    >
      <h4 className="text-center mb-4">Admin Panle </h4>




      <ul className="nav flex-column">

        <li className="nav-item mb-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive
                ? "bg-primary text-white rounded"
                : "text-white"
              }`
            }
          >
            🏠 Dashboard
          </NavLink>
        </li>

        {(role === "admin" || role === "editor") && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/members"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              ➕ Add Member
            </NavLink>
          </li>
        )}

        {(role === "admin" || role === "editor") && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/viewmembers"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              👥 View Members
            </NavLink>
          </li>
        )}

        {role === "admin" && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/subscription"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              💰 Subscription
            </NavLink>
          </li>
        )}

        {(role === "admin" || role === "editor") && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/notice"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              📢 Notice
            </NavLink>
          </li>
        )}


        {role === "admin" && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/donation"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              ❤️ Donation
            </NavLink>
          </li>
        )}

        {role === "admin" && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/expense"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              👛 Expense
            </NavLink>
          </li>
        )}

        {(role === "admin" || role === "editor") && (
          <li className="nav-item mb-2">
            <NavLink
              to="/admin/adminactivities"
              className={({ isActive }) =>
                `nav-link ${isActive
                  ? "bg-primary text-white rounded"
                  : "text-white"
                }`
              }
            >
              📷 Activities
            </NavLink>
          </li>
        )}

        <li className="nav-item mb-2">
          <button
            onClick={handleLogout}
            className="btn btn-danger w-100"
          >
            🚪 Logout
          </button>
        </li>

      </ul>



    </div>
  );
};

export default Sidebar;