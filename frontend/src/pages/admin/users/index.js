import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";

export default function ManageUsers() {
  // ----------------------
  // STATE
  // ----------------------
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // For storing the currently logged-in admin info and role
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // ----------------------
  // SEARCH BAR STATE
  // ----------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false); // Flag to track search mode

  // ----------------------
  // EFFECT: Load Admin Info from localStorage
  // ----------------------
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminInfo");
      if (storedAdmin) {
        setCurrentAdmin(JSON.parse(storedAdmin));
      }
    } catch (err) {
      console.error("Failed to parse adminInfo from localStorage:", err);
    }
  }, []);

  // ----------------------
  // EFFECT: Fetch Users (only when NOT in search mode)
  // ----------------------
  useEffect(() => {
    if (isSearching) return; // skip normal fetch if user is in search mode
    fetchUsers(page, limit);
  }, [page, limit, isSearching, totalUsers]);

  // ----------------------
  // FETCH ALL USERS
  // ----------------------
  const fetchUsers = async (pageNumber, pageLimit) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?page=${pageNumber}&limit=${pageLimit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users.");
      }

      // data should have { users, page, totalPages, ... }
      setUsers(data.users || []);
      if (data.page) setPage(data.page);
      if (data.totalPages) setTotalPages(data.totalPages);
      if (data.totalCount) setTotalUsers(data.totalCount)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // HANDLE SEARCH SUBMIT
  // ----------------------
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      // If search box is empty, revert to normal listing
      setIsSearching(false);
      setPage(1); // optionally reset to page 1
      return;
    }

    setIsSearching(true);
    setSearchLoading(true);
    setError("");
    setActionError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      // Search route: GET /api/users/search?q=searchTerm
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to search users.");
      }

      // data should have { count, users }
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // ----------------------
  // CLEAR SEARCH
  // ----------------------
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setPage(1); // Possibly reset pagination
  };

  // ----------------------
  // DELETE USER
  // ----------------------
  const handleDeleteUser = async (userId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      // DELETE /api/users/:id
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
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
        throw new Error(data.message || "Failed to remove user.");
      }

      // Remove from UI
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setTotalUsers((prevTotal) => Math.max(0, prevTotal - 1)); 
      setSuccessMessage("User removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Users</h1>
      <p className="text-gray-500 mb-6">
        View all registered users. You can search and remove users if you have the proper role.
      </p>

      {/* Error / Success Alerts */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {actionError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {actionError}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      {/* SEARCH FORM */}
      <form className="flex items-center gap-2 mb-4" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="border p-2 rounded w-64"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
        {isSearching && (
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        )}
      </form>

      {/* MAIN TABLE */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {isSearching ? "Search Results" : `All Users (${totalUsers})`}
        </h2>

        {/* Loading Spinner */}
        {loading && !isSearching && <p>Loading users...</p>}
        {searchLoading && isSearching && <p>Searching users...</p>}

        {/* USERS TABLE */}
        {!loading && !searchLoading && users.length === 0 && (
          <p>No users found.</p>
        )}

        {!loading && !searchLoading && users.length > 0 && (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-2 font-semibold underline">
                  <Link href={`/admin/users/${user._id}`}>
                    {user.first_name} {user.last_name}
                  </Link>
                  </td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    {currentAdmin &&
                      (currentAdmin.role === "SuperAdmin" ||
                        currentAdmin.role === "Admin") && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Remove
                        </button>
                      )}
                    {(!currentAdmin ||
                      (currentAdmin.role !== "SuperAdmin" &&
                        currentAdmin.role !== "Admin")) && (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION (only if not in search mode) */}
        {!isSearching && !loading && users.length > 0 && (
          <div className="mt-4 flex justify-around gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="self-center">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) =>
                prev < totalPages ? prev + 1 : prev
              )}
              disabled={page >= totalPages}
              className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
