import DashboardLayout from "../../components/DashboardLayout";

export default function PatientList() {
  return (
    <DashboardLayout title="Patient List">
      <h1 className="text-3xl font-bold">Your Patients</h1>
      <p>Here you can see all patients assigned to you.</p>
    </DashboardLayout>
  );
}
