import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";
import Image from "next/image";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  // Form state variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [preferences, setPreferences] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [newProfileImage, setNewProfileImage] = useState(null); // File object

  // Message states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  // On mount, get token and userId from localStorage
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // Fetch current user info using GET /api/users/:id
  useEffect(() => {
    if (!token || !userId) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/users/${userId}`, { method: "GET" });
        // Populate form state. Format date to YYYY-MM-DD if available.
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setDateOfBirth(data.date_of_birth ? data.date_of_birth.split("T")[0] : "");
        if (data.preferences && Array.isArray(data.preferences)) {
          setPreferences(data.preferences.join(", "));
        } else {
          setPreferences("");
        }
        setProfileImage(data.profile_image || "");
      } catch (err) {
        console.error("Error fetching user info:", err);
        setErrorMsg("Failed to load your profile.");
      }
      setLoading(false);
    };
    fetchUser();
  }, [token, userId]);

  // Handle file selection for profile image.
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Set the new profile image file for FormData upload
      setNewProfileImage(e.target.files[0]);
      // Update the immediate preview by creating a temporary URL for the selected file
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Update user info (personal info only)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // Use FormData to support file uploads.
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("date_of_birth", dateOfBirth);
      // Convert comma-separated preferences into an array string
      const prefsArray = preferences.split(",").map((p) => p.trim()).filter(Boolean);
      formData.append("preferences", JSON.stringify(prefsArray));
      if (newProfileImage) {
        // Append the file with the key "profile_image" (must match in your upload middleware)
        formData.append("profile_image", newProfileImage);
      }

      // Send request to update profile: this route uses upload.single("profile_image")
      const res = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: formData,
      });
      setSuccessMsg("Profile updated successfully.");
      // Update profile image from response (if updated)
      if (res.user && res.user.profile_image) {
        setProfileImage(res.user.profile_image);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg("Failed to update your profile. Please try again.");
    }
    setLoading(false);
  };

  // Delete profile with a confirmation dialog.
  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );
    if (!confirmed) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      // Clear local storage and redirect the user (e.g., home or login).
      localStorage.removeItem("userToken");
      localStorage.removeItem("userId");
      router.push("/");
    } catch (err) {
      console.error("Error deleting profile:", err);
      setErrorMsg("Failed to delete your profile. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">My Profile</h1>

        {loading && <p className="text-gray-600">Loading...</p>}
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{successMsg}</div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 relative">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile Image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferences</label>
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Comma-separated values"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
              disabled={loading}
            >
              Update Profile
            </button>
            <button
              type="button"
              onClick={handleDeleteProfile}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded"
              disabled={loading}
            >
              Delete Profile
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
