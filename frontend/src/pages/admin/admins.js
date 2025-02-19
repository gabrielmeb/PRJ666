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

  // Allowed roles for admin accounts
  const allowedRoles = ["SuperAdmin", "Admin", "Moderator"];

  useEffect(() => {
    // Get current logged-in admin info from localStorage
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
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch admin accounts.");
        }
        setAdmins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Handle new admin form input changes
  const handleNewAdminChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  // Handle registration of a new admin (SuperAdmin only)
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
      if (!response.ok) {
        throw new Error(data.message || "Failed to register new admin.");
      }
      // Append new admin to the list
      setAdmins((prev) => [...prev, data.admin]);
      setSuccessMessage("Admin registered successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      // Reset form and close modal
      setNewAdmin({ name: "", email: "", password: "", role: "Admin" });
      setShowModal(false);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    } finally {
      setRegistering(false);
    }
  };

  // Handle updating an admin's role (SuperAdmin only)
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
      if (!response.ok) {
        throw new Error(data.message || "Failed to update admin role.");
      }
      // Update the role in the admins state
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

  // Handle removing an admin (SuperAdmin only)
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
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove admin.");
      }
      // Remove the admin from state
      setAdmins((prev) => prev.filter((admin) => admin._id !== adminId));
      setSuccessMessage("Admin removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  // Handle role change selection for each admin row
  const handleRoleChange = (adminId, value) => {
    setRoleUpdates((prev) => ({ ...prev, [adminId]: value }));
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
      <p className="text-gray-500">View and manage admin accounts.</p>

      {error && (
        <div className="mt-6 bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}
      {actionError && (
        <div className="mt-6 bg-red-100 text-red-700 p-3 rounded-md">
          {actionError}
        </div>
      )}
      {successMessage && (
        <div className="mt-6 bg-green-100 text-green-700 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Registration Button & Modal (only for SuperAdmin) */}
      {currentAdmin && currentAdmin.role === "SuperAdmin" && (
        <div className="mt-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Register New Admin
          </button>
        </div>
      )}

      {showModal && currentAdmin && currentAdmin.role === "SuperAdmin" && (
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="bg-white p-6 rounded-lg shadow-lg relative z-40 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Register New Admin</h2>
            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <input
                type="text"
                name="name"
                value={newAdmin.name}
                onChange={handleNewAdminChange}
                placeholder="Name"
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={newAdmin.email}
                onChange={handleNewAdminChange}
                placeholder="Email"
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="password"
                name="password"
                value={newAdmin.password}
                onChange={handleNewAdminChange}
                placeholder="Password"
                className="w-full p-3 border rounded"
                required
              />
              <select
                name="role"
                value={newAdmin.role}
                onChange={handleNewAdminChange}
                className="w-full p-3 border rounded"
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
                className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition"
              >
                {registering ? "Registering..." : "Register Admin"}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-6">Loading...</p>
      ) : (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-t">
                  <td className="p-2">{admin.name}</td>
                  <td className="p-2">{admin.email}</td>
                  <td className="p-2">
                    {currentAdmin && currentAdmin.role === "SuperAdmin" ? (
                      <select
                        value={roleUpdates[admin._id] || admin.role}
                        onChange={(e) =>
                          handleRoleChange(admin._id, e.target.value)
                        }
                        className="p-2 border rounded"
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
                  <td className="p-2">
                    {currentAdmin && currentAdmin.role === "SuperAdmin" ? (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateRole(
                              admin._id,
                              roleUpdates[admin._id] || admin.role
                            )
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                        >
                          Update Role
                        </button>
                        {currentAdmin._id !== admin._id && (
                          <button
                            onClick={() => handleRemoveAdmin(admin._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Remove
                          </button>
                        )}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
