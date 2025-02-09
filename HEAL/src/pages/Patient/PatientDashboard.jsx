import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { authState, oktaAuth } = useOktaAuth();
  const [userName, setUserName] = useState("Patient");
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState?.isAuthenticated) {
      oktaAuth.getUser().then((user) => {
        setUserName(user.name || "Patient");
      });
    }
  }, [authState, oktaAuth]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5001/get-appointments/${authState?.idToken?.claims?.sub}`);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
    }
  };

  // ✅ Get upcoming appointments
  const upcomingAppointments = appointments
    .filter((appt) => appt.status === "Upcoming")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2); // Show only 2 upcoming

  // ✅ Health Tips
  const healthTips = [
    "Drink plenty of water daily. 💧",
    "Exercise for at least 30 minutes a day. 🏋️",
    "Eat more fresh vegetables and less processed food. 🥦",
    "Get at least 7-8 hours of sleep. 😴",
    "Practice mindfulness to reduce stress. 🧘",
  ];
  const [randomTip, setRandomTip] = useState("");

  useEffect(() => {
    setRandomTip(healthTips[Math.floor(Math.random() * healthTips.length)]);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ✅ HERO SECTION (Welcome + Doctor of the Month) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 text-black p-6 rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold">👋 Welcome, {userName}!</h1>
          <p className="text-lg">Your health is our priority. Stay updated & take care! 💙</p>
        </div>

        {/* Doctor of the Month */}
        <div className="bg-gradient-to-r from-purple-200 to-blue-200 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-700">🏆 Doctor of the Month</h2>
          <p className="text-lg text-gray-600">Dr. Alice Johnson (Cardiologist)</p>
          <p className="text-gray-500">Most Patient Visits This Month</p>
        </div>
      </div>

      {/* ✅ Health Tip of the Day */}
      <div className="p-6 bg-orange-100 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold text-gray-700">💡 Health Tip of the Day</h2>
        <p className="text-gray-600">{randomTip}</p>
      </div>

      {/* ✅ Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-200 p-5 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-green-700">✅ Total Appointments</h3>
          <p className="text-3xl font-bold text-gray-800">{appointments.length || 0}</p>
        </div>
        <div className="bg-yellow-200 p-5 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-yellow-700">🕒 Upcoming Appointments</h3>
          <p className="text-3xl font-bold text-gray-800">
            {appointments.filter((appt) => appt.status === "Upcoming").length || 0}
          </p>
        </div>
        <div className="bg-red-200 p-5 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-red-700">💳 Pending Payments</h3>
          <p className="text-3xl font-bold text-gray-800">
            {appointments.filter((appt) => appt.payment && appt.payment.paymentStatus === "Pending").length || 0} Pending
          </p>
        </div>
      </div>

      {/* ✅ Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="p-6 bg-blue-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-blue-700">📅 Your Next Appointments</h2>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {upcomingAppointments.map((appt) => (
              <div key={appt._id} className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/2">
                <p className="text-gray-700">
                  <strong>Doctor:</strong> {appt.doctorId?.fullName || "Unknown"}
                </p>
                <p className="text-gray-700">
                  <strong>Date:</strong> {appt.date} <br />
                  <strong>Time:</strong> {appt.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => navigate("/patient/appointment-history")} className="bg-purple-200 p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition">
          <h3 className="text-lg font-semibold text-purple-700">📅 View Appointments</h3>
          <p className="text-gray-600">Check past and upcoming appointments.</p>
        </div>
        <div onClick={() => navigate("/patient/prescription-history")} className="bg-green-200 p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition">
          <h3 className="text-lg font-semibold text-green-700">💊 View Prescriptions</h3>
          <p className="text-gray-600">See prescribed medications and doctor notes.</p>
        </div>
        <div onClick={() => navigate("/patient/payments-history")} className="bg-yellow-200 p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition">
          <h3 className="text-lg font-semibold text-yellow-700">💳 Payment History</h3>
          <p className="text-gray-600">Review past medical payments.</p>
        </div>
      </div>

      {/* ✅ Quick Contact */}
      <div className="mt-6 p-6 bg-red-200 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold text-red-700">📞 Emergency Contact</h2>
        <p className="text-gray-600">Need urgent medical help? Call **911** or your nearest hospital.</p>
      </div>
    </div>
  );
}
