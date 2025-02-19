import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";

export default function Settings() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load current admin info from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (storedAdmin) {
      setAdminInfo(JSON.parse(storedAdmin));
    }
  }, []);

  const handleInputChange = (e) => {
    setAdminInfo({ ...adminInfo, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setApiError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: adminInfo.name,
            email: adminInfo.email,
            // If password is empty, we skip updating it
            password: adminInfo.password ? adminInfo.password : undefined,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }
      // Update localStorage with new admin info
      localStorage.setItem("adminInfo", JSON.stringify(result.admin));
      setSuccessMessage("Settings saved successfully!");
      // Optionally, clear the password field after success
      setAdminInfo({ ...adminInfo, password: "" });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">⚙️ Settings</h1>
      <p className="text-gray-500">Manage your admin account & security</p>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        {/* Profile Settings */}
        <h2 className="text-xl font-semibold">👤 Profile Settings</h2>
        {apiError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mt-2">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mt-2">
            {successMessage}
          </div>
        )}
        <input
          type="text"
          name="name"
          value={adminInfo.name}
          onChange={handleInputChange}
          placeholder="Full Name"
          className="w-full p-3 mt-2 border rounded"
        />
        <input
          type="email"
          name="email"
          value={adminInfo.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full p-3 mt-2 border rounded"
        />

        {/* Password Change */}
        <h2 className="text-xl font-semibold mt-6">🔑 Change Password</h2>
        <input
          type="password"
          name="password"
          value={adminInfo.password}
          onChange={handleInputChange}
          placeholder="New Password"
          className="w-full p-3 mt-2 border rounded"
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </AdminLayout>
  );
}
