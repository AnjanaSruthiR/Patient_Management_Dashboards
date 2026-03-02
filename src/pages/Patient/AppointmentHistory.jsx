import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";

export default function AppointmentHistory() {
  const { authState, oktaAuth } = useOktaAuth();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [patientId, setPatientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    consultationType: "In-Person",
    reasonForVisit: "",
    paymentMethod: "Credit Card",
  });

  useEffect(() => {
    if (authState?.isAuthenticated) {
      oktaAuth.getUser().then((user) => {
        setPatientId(user.sub);
      });
    }
  }, [authState, oktaAuth]);

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [patientId, filter, search]);

  const fetchAppointments = async () => {
    let url = `http://localhost:5001/get-appointments/${patientId}?status=${filter}`;
    if (search) url += `&doctorName=${search}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5001/get-doctors");
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, ...formData }),
      });

      if (response.ok) {
        alert("🎉 Appointment booked successfully!");
        setIsModalOpen(false);
        fetchAppointments();
      } else {
        const errorData = await response.json();
        alert(`❌ Booking failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("❌ Booking Error:", error);
    }
  };

  return (
    <div className="p-6 border border-gray-300 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">📅 My Appointments</h1>

      {/* Search & Filters */}
      <div className="flex flex-col justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border rounded w-full md:w-1/3"
        />

        <div className="flex space-x-2">
          {["All", "Upcoming", "Completed", "Follow-up"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2 rounded-lg transition ${
                filter === status ? "bg-purple-600 text-white font-bold" : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment List - Boxed Layout */}
      <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            <div key={appt._id} className="bg-purple-50 shadow-lg p-6 rounded-lg hover:shadow-xl transition">
              <div className="flex items-center">
                {/* Doctor Image */}
                <img
                  src="https://i.pravatar.cc/60"
                  alt={appt.doctorId?.fullName || "Unknown Doctor"}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {appt.doctorId?.fullName || "Unknown Doctor"}{" "}
                    <span className="text-gray-500">
                      ({appt.doctorId?.specialization || "No Specialization"})
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    <strong>📅 Date:</strong> {appt.date} | <strong>🕒 Time:</strong> {appt.time}
                  </p>
                </div>
                {/* Appointment Status Badge */}
                <p
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    appt.status === "Completed"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-400 text-black"
                  }`}
                >
                  {appt.status}
                </p>
              </div>

              {/* Appointment Details */}
              <div className="mt-4 bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">📋 Reason for Visit:</h3>
                <p className="text-gray-600">{appt.reasonForVisit}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No appointments found.</p>
        )}
      </div>

      {/* Floating "Book Appointment" Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-700 transition flex items-center"
      >
        ➕ Book Appointment
      </button>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <select
                className="mb-3 p-2 border w-full"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fullName} ({doc.specialization})
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="mb-3 p-2 border w-full"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <input
                type="time"
                className="mb-3 p-2 border w-full"
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />

              <select
                className="mb-3 p-2 border w-full"
                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
              >
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
              </select>

              <textarea
                className="mb-3 p-2 border w-full"
                placeholder="Reason for visit"
                onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                required
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white p-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">
                  Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
