import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";

export default function PaymentsHistory() {
  const { authState, oktaAuth } = useOktaAuth();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    if (authState?.isAuthenticated) {
      oktaAuth.getUser().then((user) => {
        setPatientId(user.sub);
      });
    }
  }, [authState, oktaAuth]);

  useEffect(() => {
    if (patientId) {
      fetchPayments();
    }
  }, [patientId, search, sortOrder]);

  const fetchPayments = async () => {
    let url = `http://localhost:5001/get-payments/${patientId}?sort=${sortOrder}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("🔍 Payment Data from API:", data); // ✅ Log API response
      setPayments(data);
    } catch (error) {
      console.error("❌ Error fetching payments:", error);
    }
  };
  
  return (
    <div className="p-6 border border-gray-300 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">💳 Payment History</h1>

      {/* Search & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Doctor or Transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border rounded w-full md:w-1/3"
        />

        {/* Sorting Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSortOrder("newest")}
            className={`px-5 py-2 rounded-lg transition ${
              sortOrder === "newest" ? "bg-custom-purple text-white font-bold" : "bg-gray-200 text-gray-700"
            }`}
          >
            New to Old
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`px-5 py-2 rounded-lg transition ${
              sortOrder === "oldest" ? "bg-custom-purple text-white font-bold" : "bg-gray-200 text-gray-700"
            }`}
          >
            Old to New
          </button>
        </div>
      </div>

      {/* Payment List - Boxed UI */}
      <div className="space-y-6">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment._id} className="bg-purple-50 shadow-lg p-6 rounded-lg hover:shadow-xl transition">
              <h2 className="text-lg font-semibold text-blue-700">
                {payment.doctorId?.fullName || "Unknown Doctor"} ({payment.doctorId?.specialization || "No Specialization"})
              </h2>
              <p className="text-gray-600">
                <strong>📅 Date:</strong> {payment.date} | <strong>🆔 Transaction ID:</strong> {payment.payment?.transactionId || "N/A"}
              </p>

              {/* Payment Status */}
              <p className={`px-3 py-1 rounded text-sm font-semibold ${
                payment.payment?.paymentStatus === "Paid"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-black"
              }`}>
                {payment.payment?.paymentStatus || "Unknown"}
              </p>

              {/* Payment Breakdown */}
              <div className="bg-gray-100 p-4 rounded-md mt-4">
                <h3 className="font-semibold text-gray-700">💰 Payment Details:</h3>
                <p><strong>💳 Method:</strong> {payment.payment?.paymentMethod || "N/A"}</p>
                <p><strong>💵 Consultation Fee:</strong> ${payment.payment?.consultationFee?.toFixed(2) ?? "N/A"}</p>
                <p><strong>💊 Medication Charges:</strong> ${payment.payment?.medicationCharges?.toFixed(2) ?? "N/A"}</p>
                <p><strong>💲 Total Paid:</strong> ${payment.payment?.totalAmount?.toFixed(2) ?? "N/A"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No payments found.</p>
        )}
      </div>
    </div>
  );
}
