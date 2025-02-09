import { useEffect, useState } from "react";
import { useOktaAuth } from "@okta/okta-react";

export default function ProfilePage() {
  const { authState, oktaAuth } = useOktaAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [agreeToDelete, setAgreeToDelete] = useState(false);

  useEffect(() => {
    if (authState?.isAuthenticated) {
      fetchProfile();
    }
  }, [authState]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5001/get-profile/${authState.idToken.claims.sub}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/update-profile/${profile._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        alert("✅ Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("❌ Failed to update profile.");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
    }
  };

  const handleDelete = async () => {
    if (!agreeToDelete) return alert("⚠️ You must agree before deleting your account!");

    try {
      const response = await fetch(`http://localhost:5001/delete-profile/${profile._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("❌ Profile deleted permanently!");
        await oktaAuth.signOut();
      } else {
        alert("❌ Failed to delete profile.");
      }
    } catch (error) {
      console.error("❌ Error deleting profile:", error);
    }
  };

  if (!profile) return <p className="text-center text-gray-500">Loading Profile...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center">👤 My Profile</h1>

      {/* Editable Profile Fields */}
      <div className="mt-6 space-y-4">
      <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
      <p><strong>Email:</strong> {profile.email}</p>

        <label className="block">
          <strong>DOB:</strong>
          <input
            type="date"
            value={profile.dob}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </label>

        <label className="block">
          <strong>Phone:</strong>
          <input
            type="text"
            value={profile.contact}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </label>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            ✏️ Edit
          </button>
        ) : (
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg">
            💾 Save
          </button>
        )}

        <button onClick={() => setShowDeletePopup(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg">
          ❌ Delete Profile
        </button>
      </div>

      {/* DELETE CONFIRMATION POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600">⚠️ Confirm Deletion</h2>
            <p className="text-gray-600">This action is **permanent** and cannot be undone.</p>
            <label className="flex items-center mt-4">
              <input type="checkbox" onChange={() => setAgreeToDelete(!agreeToDelete)} />
              <span className="ml-2 text-gray-700">I understand and want to delete my profile.</span>
            </label>

            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setShowDeletePopup(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
              <button onClick={handleDelete} className={`px-4 py-2 rounded-lg ${agreeToDelete ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700 cursor-not-allowed"}`}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
