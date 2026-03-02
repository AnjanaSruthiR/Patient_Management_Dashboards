import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";

export default function MedicalHistoryPage() {
  const { authState, oktaAuth } = useOktaAuth();
  const [medicalHistory, setMedicalHistory] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    if (authState?.isAuthenticated) {
      oktaAuth.getUser().then((user) => fetchMedicalHistory(user.sub));
    }
  }, [authState, oktaAuth]);

  const fetchMedicalHistory = async (oktaUserId) => {
    try {
      const response = await fetch(`http://localhost:5001/get-medical-history/${oktaUserId}`);
      const data = await response.json();
      setMedicalHistory(data);
      setFormData(data);
    } catch (error) {
      console.error("❌ Error fetching medical history:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5001/update-medical-history/${medicalHistory.oktaUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: formData.age,
          weight: formData.weight,
          height: formData.height,
          bloodGroup: formData.bloodGroup,
          medicalHistory: formData.medicalHistory,
          currentMedications: formData.currentMedications, 
          allergies: formData.allergies  
        }),
      });
  
      if (response.ok) {
        alert("✅ Medical history updated successfully!");
        setMedicalHistory(formData);
        setIsEditing(false);
      } else {
        alert("❌ Failed to update medical history.");
      }
    } catch (error) {
      console.error("❌ Error updating medical history:", error);
    }
  };
  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-200 to-purple-300 text-black p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold">🏥 Medical History</h1>
        <button 
          className="px-5 py-2 bg-white text-indigo-600 font-bold rounded-lg shadow-md hover:bg-gray-200 transition"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      <div className="mt-8 bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
        {/* Age, Weight, Height - Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "📆 Age", key: "age", suffix: " years" },
            { label: "⚖️ Weight", key: "weight", suffix: " kg" },
            { label: "📏 Height", key: "height", suffix: " cm" },
          ].map((field) => (
            <div key={field.key} className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-700">{field.label}</h3>
              {isEditing ? (
                <input
                  type="number"
                  name={field.key}
                  value={formData[field.key]}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded-lg bg-white shadow-sm"
                />
              ) : (
                <p className="text-gray-600">{medicalHistory[field.key]} {field.suffix}</p>
              )}
            </div>
          ))}
        </div>

        {/* Blood Group & Medical Conditions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700">🩸 Blood Group</h3>
            {isEditing ? (
              <input
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-lg bg-white shadow-sm"
              />
            ) : (
              <p className="text-gray-600">{medicalHistory.bloodGroup}</p>
            )}
          </div>
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700">📜 Medical Conditions</h3>
            {isEditing ? (
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-lg bg-white shadow-sm"
              />
            ) : (
              <p className="text-gray-600">{medicalHistory.medicalHistory || "No recorded conditions"}</p>
            )}
          </div>
        </div>

        {/* Additional Fields for a More Comprehensive Medical History */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700">💊 Current Medications</h3>
            {isEditing ? (
              <textarea
                name="currentMedications"
                value={formData.currentMedications || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-lg bg-white shadow-sm"
              />
            ) : (
              <p className="text-gray-600">{medicalHistory.currentMedications || "None"}</p>
            )}
          </div>
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700">🔬 Allergies</h3>
            {isEditing ? (
              <textarea
                name="allergies"
                value={formData.allergies || ""}
                onChange={handleInputChange}
                className="w-full border p-2 rounded-lg bg-white shadow-sm"
              />
            ) : (
              <p className="text-gray-600">{medicalHistory.allergies || "No known allergies"}</p>
            )}
          </div>
        </div>

        {/* Update Button */}
        {isEditing && (
          <div className="mt-6 text-center">
            <button 
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105"
              onClick={handleUpdate}
            >
              ✅ Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
