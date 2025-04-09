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
            password: adminInfo.password ? adminInfo.password : undefined,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }
      localStorage.setItem("adminInfo", JSON.stringify(result.admin));
      setSuccessMessage("Settings saved successfully!");
      setAdminInfo({ ...adminInfo, password: "" });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        <h1 className="text-3xl font-bold text-white mb-2">⚙️ Settings</h1>
        <p className="text-gray-400 mb-6">Manage your admin account & security</p>
        
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          {/* Profile Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">👤 Profile Settings</h2>
            
            {/* Notifications */}
            {apiError && (
              <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
                {apiError}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-900 text-green-100 p-3 rounded-md mb-4 border border-green-700">
                {successMessage}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={adminInfo.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={adminInfo.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">🔑 Change Password</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                name="password"
                value={adminInfo.password}
                onChange={handleInputChange}
                placeholder="New Password"
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to keep current password
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}