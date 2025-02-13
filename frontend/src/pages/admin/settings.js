import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function Settings() {
  const [adminInfo, setAdminInfo] = useState({
    name: "John Doe",
    email: "admin@example.com",
    password: "",
  });

  const handleInputChange = (e) => {
    setAdminInfo({ ...adminInfo, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Settings saved successfully!"); // Replace with API Call
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">⚙️ Settings</h1>
      <p className="text-gray-500">Manage your admin account & security</p>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        {/* Profile Settings */}
        <h2 className="text-xl font-semibold">👤 Profile Settings</h2>
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
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Save Changes
        </button>
      </div>

      {/* Security Settings */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">🔒 Security Settings</h2>
        <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Enable Two-Factor Authentication (2FA)
        </button>
      </div>
    </AdminLayout>
  );
}
