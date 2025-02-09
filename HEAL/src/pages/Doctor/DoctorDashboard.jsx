import DashboardLayout from "../../components/DashboardLayout";
import { useState } from "react";

export default function DoctorDashboard() {
  const doctorId = "65af72c8b6e7a4a123456789"; // Replace with logged-in Doctor ID
  const [availability, setAvailability] = useState([]);
  const [day, setDay] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // ✅ Function to Add Availability (Stores in UI)
  const handleAddAvailability = () => {
    if (!day || !fromTime || !toTime) {
      alert("❌ Please select all fields (Day, From, To)!");
      return;
    }

    setAvailability([...availability, { day, fromTime, toTime }]);
  };

  // ✅ Function to Save Availability to Database
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/doctor/set-availability/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Availability updated!");
        setAvailability([]);  // Clear UI after saving
      } else {
        alert(`⚠ Update failed: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Update Error:", error);
      alert("❌ An error occurred.");
    }
  };

  return (
    <DashboardLayout title="Doctor Dashboard">    
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Doctor Availability</h1>

      <div className="bg-white p-4 rounded shadow-md w-96 mb-4">
        <select className="mb-3 p-2 border w-full" onChange={(e) => setDay(e.target.value)}>
          <option value="">Select Day</option>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <input type="time" className="mb-3 p-2 border w-full" onChange={(e) => setFromTime(e.target.value)} />
        <input type="time" className="mb-3 p-2 border w-full" onChange={(e) => setToTime(e.target.value)} />
        <button onClick={handleAddAvailability} className="bg-blue-600 text-white p-2 w-full rounded">Add Availability</button>
      </div>

      {/* ✅ Show Added Availabilities Before Saving */}
      {availability.length > 0 && (
        <div className="bg-white p-4 rounded shadow-md w-96 mb-4">
          <h2 className="text-xl font-bold mb-2">Added Availability</h2>
          {availability.map((slot, index) => (
            <p key={index} className="mb-2">
              <strong>{slot.day}:</strong> {slot.fromTime} - {slot.toTime}
            </p>
          ))}
        </div>
      )}

      <button onClick={handleSave} className="bg-green-600 text-white p-2 w-96 rounded">Save Availability</button>
    </div>
    </DashboardLayout>
  );
}
