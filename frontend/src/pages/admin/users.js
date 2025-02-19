import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Fetch current admin info from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (storedAdmin) {
      setCurrentAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoadingUsers(false);
          return;
        }
        // NOTE: Update your backend GET route to allow Moderators too if needed.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
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
          throw new Error(data.message || "Failed to fetch users.");
        }
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch communities from backend
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoadingCommunities(false);
          return;
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities`,
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
          throw new Error(data.message || "Failed to fetch communities.");
        }
        setCommunities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

  // Handle deletion of a user (only for SuperAdmin and Admin)
  const handleDeleteUser = async (userId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Backend DELETE route now restricts deletion to SuperAdmin and Admin.
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove user.");
      }
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setSuccessMessage("User removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  // Handle deletion of a community (only for SuperAdmin and Admin)
  const handleDeleteCommunity = async (communityId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this community?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/${communityId}`,
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
        throw new Error(data.message || "Failed to remove community.");
      }
      setCommunities((prev) =>
        prev.filter((community) => community._id !== communityId)
      );
      setSuccessMessage("Community removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Manage Users & Communities</h1>
      <p className="text-gray-500">View all users and communities. (Delete actions available for SuperAdmin and Admin only)</p>

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

      {/* Users Table */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-2">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    {(currentAdmin &&
                      (currentAdmin.role === "SuperAdmin" ||
                        currentAdmin.role === "Admin")) && (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                    {(!currentAdmin ||
                      (currentAdmin.role !== "SuperAdmin" &&
                        currentAdmin.role !== "Admin")) && "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Communities Table */}
      {/* <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Communities</h2>
        {loadingCommunities ? (
          <p>Loading communities...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Community Name</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communities.map((community) => (
                <tr key={community._id} className="border-t">
                  <td className="p-2">{community.name || "N/A"}</td>
                  <td className="p-2">{community.description || "N/A"}</td>
                  <td className="p-2">
                    {(currentAdmin &&
                      (currentAdmin.role === "SuperAdmin" ||
                        currentAdmin.role === "Admin")) && (
                      <button
                        onClick={() => handleDeleteCommunity(community._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                    {(!currentAdmin ||
                      (currentAdmin.role !== "SuperAdmin" &&
                        currentAdmin.role !== "Admin")) && "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div> */}
    </AdminLayout>
  );
}
