import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Security, LoginCallback } from "@okta/okta-react";
import { OktaAuth } from "@okta/okta-auth-js";
import { oktaConfig } from "./config/oktaConfig";
import SecureRoute from "./components/SecureRoute";

// Import Dashboards
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageDoctors from "./pages/Admin/ManageDoctors";
import ManagePatients from "./pages/Admin/ManagePatients";
// import ManageAppointments from "./pages/Admin/ManageAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
// import PatientList from "./pages/Doctor/PatientList";
// import Appointments from "./pages/Doctor/Appointments";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import AppointmentHistory from "./pages/Patient/AppointmentHistory";
import PrescriptionHistory from "./pages/Patient/PrescriptionHistory";
import PaymentsHistory from "./pages/Patient/PaymentHistory";
import ProfilePage from "./pages/Patient/Profile";
import MedicalHistoryPage from "./pages/Patient/MedicalHistory";

const oktaAuth = new OktaAuth(oktaConfig);

function AppRoutes() {
  const navigate = useNavigate();

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    try {
        console.log("🔄 Retrieving user...");
        const user = await oktaAuth.getUser();
        console.log("✅ User retrieved:", user);

        const userGroups = user?.groups || [];
        let redirectPath = "/login"; // Default

        if (userGroups.includes("HEAL_Admins")) redirectPath = "/admin/dashboard";
        else if (userGroups.includes("HEAL_Doctors")) redirectPath = "/doctor/dashboard";
        else if (userGroups.includes("HEAL_Patients")) redirectPath = "/patient/dashboard";

        console.log(`🚀 Redirecting to: ${redirectPath}`);
        navigate(originalUri || redirectPath);
    } catch (error) {
        console.error("❌ Error fetching user details:", error);
        navigate("/login");
    }
};

return (
  <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/callback" element={<LoginCallback />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<SecureRoute allowedRoles={['Admin']}><DashboardLayout title="Admin Dashboard"><AdminDashboard /></DashboardLayout></SecureRoute>} />
      <Route path="/admin/manage-doctors" element={<SecureRoute allowedRoles={['Admin']}><DashboardLayout title="Manage Doctors"><ManageDoctors /></DashboardLayout></SecureRoute>} />
      
      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<SecureRoute allowedRoles={['Doctor']}><DashboardLayout title="Doctor Dashboard"><DoctorDashboard /></DashboardLayout></SecureRoute>} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={<SecureRoute allowedRoles={['Patient']}><DashboardLayout title="Patient Dashboard"><PatientDashboard /></DashboardLayout></SecureRoute>} />
      <Route path="/patient/appointment-history" element={<SecureRoute allowedRoles={['Patient']}><DashboardLayout title="Appointment History"><AppointmentHistory /></DashboardLayout></SecureRoute>} />
      <Route path="/patient/Prescription-history" element={<SecureRoute allowedRoles={['Patient']}><DashboardLayout title="My Prescriptions"><PrescriptionHistory /></DashboardLayout></SecureRoute>}/>
      <Route path="/patient/Payment-history" element={<SecureRoute allowedRoles={['Patient']}><DashboardLayout title="My Paynment History"><PaymentsHistory /></DashboardLayout></SecureRoute>}/>
      <Route path="/profile" element={<SecureRoute allowedRoles={['Patient']}><DashboardLayout title="My Profile"><ProfilePage /></DashboardLayout></SecureRoute>} />
      <Route path="/patient/Medical-history" element={<SecureRoute allowedRoles={['Patient']}><DashboardLayout title="My Medical History"><MedicalHistoryPage /></DashboardLayout></SecureRoute>} />
      </Routes>
  </Security>
);
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
