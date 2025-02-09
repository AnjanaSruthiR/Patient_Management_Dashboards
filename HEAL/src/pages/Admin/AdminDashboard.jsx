import DashboardLayout from "../../components/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <h1 className="text-3xl font-bold">Welcome, Admin!</h1>
      <p>Manage doctors, patients, and appointments from here.</p>
    </DashboardLayout>
  );
}
