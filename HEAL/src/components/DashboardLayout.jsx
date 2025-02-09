import { useOktaAuth } from "@okta/okta-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa"; // Add this line

export default function DashboardLayout({ children, title }) {
  const navigate = useNavigate();
  const { authState, oktaAuth } = useOktaAuth();
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userName = authState?.accessToken?.claims?.name || "User";

  useEffect(() => {
    if (!authState?.isAuthenticated) {
      navigate("/");
    } else {
      oktaAuth.getUser().then((user) => {
        console.log("🔍 Dashboard Debug: User Data:", user);

        // Assign user role based on Okta groups
        let role = "Patient"; // Default role
        if (user.groups?.includes("HEAL_Admins")) role = "Admin";
        else if (user.groups?.includes("HEAL_Doctors")) role = "Doctor";

        console.log("📌 Assigned Role:", role);
        setUserRole(role);
      });
    }
  }, [authState, oktaAuth, navigate]);

  const handleLogout = async () => {
    await oktaAuth.signOut();
  };

  // **Dynamically generate Sidebar links**
  const sidebarLinks = {
    Admin: [
      { path: "/admin/dashboard", label: "🏠 Dashboard" },
      { path: "/admin/manage-doctors", label: "👨‍⚕️ Manage Doctors" },
      { path: "/admin/manage-patients", label: "🩺 Manage Patients" },
      { path: "/admin/manage-appointments", label: "📅 Manage Appointments" },
    ],
    Doctor: [
      { path: "/doctor/dashboard", label: "🏠 Dashboard" },
      { path: "/doctor/patients", label: "👩‍⚕️ My Patients" },
      { path: "/doctor/appointments", label: "📅 Appointments" },
    ],
    Patient: [
      { path: "/patient/dashboard", label: "🏠 Dashboard" },
      { path: "/patient/medical-history", label: "🏥 Medical History" },
      { path: "/patient/appointment-history", label: "📜 Appointment History" },
      { path: "/patient/prescription-history", label: "💊 Prescriptions" },
      { path: "/patient/payment-history", label: "💰 Payments" },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Unified Sidebar + Header Strip */}
      <aside className="w-72 bg-white shadow-lg flex flex-col p-6">
        {/* HEAL Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="HEAL Logo" className="w-34" />
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6 mt-6">
          <img src="https://i.pravatar.cc/70" alt="User" className="w-16 h-16 rounded-full border" />
          <h2 className="text-lg font-semibold mt-2">{userName}</h2>
          <p className="text-sm text-gray-500">{userRole}</p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="w-full">
          <ul className="space-y-3">
            {sidebarLinks[userRole]?.map((item) => (
              <li key={item.path}>
                <a href={item.path} className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Unified Header (No Border on Top) */}
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
          {/* Dashboard Title (Center) */}
          <h2 className="text-2xl font-semibold text-gray-900 mx-auto"></h2>

          {/* Profile Dropdown (Right Side) */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
              <FaUserCircle className="text-3xl text-gray-600 hover:text-gray-800 transition" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100" onClick={() => navigate("/profile")}>
                  👤 Profile
                </button>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6 bg-white shadow-md rounded-lg flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
