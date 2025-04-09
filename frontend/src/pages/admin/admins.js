// src/pages/ManageAdmins.jsx

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [registering, setRegistering] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [roleUpdates, setRoleUpdates] = useState({});
  const [showModal, setShowModal] = useState(false);

  const allowedRoles = ["SuperAdmin", "Admin", "Moderator"];

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (storedAdmin) {
      setCurrentAdmin(JSON.parse(storedAdmin));
    }

    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setAdmins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleNewAdminChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setActionError("");
    setRegistering(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAdmin),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAdmins((prev) => [...prev, data.admin]);
      setSuccessMessage("Admin registered successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setNewAdmin({ name: "", email: "", password: "", role: "Admin" });
      setShowModal(false);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdateRole = async (adminId, newRole) => {
    setActionError("");
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins/${adminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === adminId ? { ...admin, role: data.admin.role } : admin
        )
      );
      setSuccessMessage("Admin role updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this admin?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins/${adminId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAdmins((prev) => prev.filter((admin) => admin._id !== adminId));
      setSuccessMessage("Admin removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  const handleRoleChange = (adminId, value) => {
    setRoleUpdates((prev) => ({ ...prev, [adminId]: value }));
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black text-white py-6 px-6">
        <h1 className="text-3xl font-bold mb-2">Manage Admins</h1>
        <p className="text-gray-400 mb-6">View and manage admin accounts.</p>

        {error && (
          <div className="bg-red-800 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}
        {actionError && (
          <div className="bg-red-800 text-red-100 p-3 rounded mb-4">
            {actionError}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-800 text-green-100 p-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {currentAdmin?.role === "SuperAdmin" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded text-white mb-6"
          >
            Register New Admin
          </button>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black bg-opacity-70"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg z-50 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Register New Admin</h2>
              <form onSubmit={handleRegisterAdmin} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleNewAdminChange}
                  placeholder="Name"
                  className="w-full bg-gray-800 text-white p-3 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleNewAdminChange}
                  placeholder="Email"
                  className="w-full bg-gray-800 text-white p-3 rounded"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleNewAdminChange}
                  placeholder="Password"
                  className="w-full bg-gray-800 text-white p-3 rounded"
                  required
                />
                <select
                  name="role"
                  value={newAdmin.role}
                  onChange={handleNewAdminChange}
                  className="w-full bg-gray-800 text-white p-3 rounded"
                >
                  {allowedRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={registering}
                  className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-3 rounded"
                >
                  {registering ? "Registering..." : "Register Admin"}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className="border-t border-gray-800">
                    <td className="py-2 px-3">{admin.name}</td>
                    <td className="py-2 px-3">{admin.email}</td>
                    <td className="py-2 px-3">
                      {currentAdmin?.role === "SuperAdmin" ? (
                        <select
                          value={roleUpdates[admin._id] || admin.role}
                          onChange={(e) =>
                            handleRoleChange(admin._id, e.target.value)
                          }
                          className="bg-gray-800 text-white p-2 rounded"
                        >
                          {allowedRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        admin.role
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {currentAdmin?.role === "SuperAdmin" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateRole(
                                admin._id,
                                roleUpdates[admin._id] || admin.role
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 py-1 rounded mr-2"
                          >
                            Update
                          </button>
                          {currentAdmin._id !== admin._id && (
                            <button
                              onClick={() => handleRemoveAdmin(admin._id)}
                              className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded"
                            >
                              Remove
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}