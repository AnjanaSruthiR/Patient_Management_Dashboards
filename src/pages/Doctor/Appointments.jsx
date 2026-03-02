import { useEffect, useState } from "react";

export default function DoctorAppointments() {
  const doctorId = "65af72c8b6e7a4a123456789";  // Replace with logged-in Doctor ID
  const [appointments, setAppointments] = useState([]);
  const [consultationFee, setConsultationFee] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5001/doctor/appointments/${doctorId}`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("❌ Error fetching appointments:", err));
  }, []);

  const handleAction = async (appointmentId, status) => {
    const fee = consultationFee || 50;  // Default fee if not entered
    try {
      const response = await fetch(`http://localhost:5001/doctor/approve-appointment/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, consultationFee: fee }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`🎉 Appointment ${status}!`);
        setAppointments((prev) => prev.filter((appt) => appt._id !== appointmentId));  // Remove approved/rejected
      } else {
        alert(`⚠ Update failed: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Update Error:", error);
      alert("❌ An error occurred.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Pending Appointments</h1>
      {appointments.length === 0 ? (
        <p>No pending appointments</p>
      ) : (
        appointments.map((appt) => (
          <div key={appt._id} className="bg-white p-4 rounded shadow-md w-96 mb-4">
            <p><strong>Patient:</strong> {appt.patientId.fullName}</p>
            <p><strong>Date:</strong> {appt.date} - {appt.time}</p>
            <p><strong>Consultation Type:</strong> {appt.consultationType}</p>
            <p><strong>Reason:</strong> {appt.reasonForVisit}</p>
            
            <input
              type="number"
              className="mb-2 p-2 border w-full"
              placeholder="Enter Consultation Fee"
              onChange={(e) => setConsultationFee(e.target.value)}
            />

            <button onClick={() => handleAction(appt._id, "Approved")} className="bg-green-600 text-white p-2 w-full rounded mb-2">
              Approve
            </button>
            <button onClick={() => handleAction(appt._id, "Rejected")} className="bg-red-600 text-white p-2 w-full rounded">
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
}
