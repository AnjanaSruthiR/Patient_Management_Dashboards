import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";

export default function PrescriptionHistory() {
  const { authState, oktaAuth } = useOktaAuth();
  const [prescriptions, setPrescriptions] = useState([]);
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
      fetchPrescriptions();
    }
  }, [patientId, search, sortOrder]);

  const fetchPrescriptions = async () => {
    let url = `http://localhost:5001/get-prescriptions/${patientId}`;
    if (search) url += `?doctorName=${search}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // ✅ Sort prescriptions by date
      const sortedData = data.sort((a, b) => {
        return sortOrder === "newest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      });

      // ✅ Group by doctor
      const groupedByDoctor = sortedData.reduce((acc, presc) => {
        const doctorName = presc.doctorId
          ? `${presc.doctorId.fullName} (${presc.doctorId.specialization})`
          : "Unknown Doctor";
        
        if (!acc[doctorName]) acc[doctorName] = [];
        acc[doctorName].push(presc);
        return acc;
      }, {});

      setPrescriptions(groupedByDoctor);
    } catch (error) {
      console.error("❌ Error fetching prescriptions:", error);
    }
  };

  return (
    <div className="p-6 border border-gray-300 bg-white shadow-md rounded-lg"> {/* Light Grey Border */}
      <h1 className="text-3xl font-bold mb-6 text-center">💊 My Prescriptions</h1>
  
      {/* Search & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by doctor name..."
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
  
      {/* Prescription List - Grouped by Doctor */}
      <div className="space-y-6">
        {Object.entries(prescriptions).length > 0 ? (
          Object.entries(prescriptions).map(([doctorName, doctorPrescriptions]) => (
            <div key={doctorName} className="bg-purple-50 shadow-lg p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-700">{doctorName}</h2>
  
              {doctorPrescriptions.map((prescription) => (
                <div key={prescription._id} className="pb-4">
                  <p className="text-gray-600">
                    <strong>📅 Date:</strong> {prescription.date} | <strong>🕒 Time:</strong> {prescription.time}
                  </p>
  
                  {/* Doctor Notes */}
                  <div className="bg-white p-4 rounded-md mt-4">
                    <h3 className="font-semibold text-gray-700">📋 Doctor's Notes:</h3>
                    <p className="text-gray-600">{prescription.doctorNotes}</p>
                  </div>
  
                  {/* Medications - Displayed in Cards */}
                  <h3 className="font-semibold text-gray-700 mt-4 mb-3">💊 Medications:</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prescription.medications.map((med, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white transition hover:scale-105 hover:shadow-md"
                      >
                        <h4 className="text-blue-600 font-semibold">{med.name}</h4>
                        <p className="text-sm text-gray-600">{med.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No prescriptions found.</p>
        )}
      </div>
    </div>
  );
}  