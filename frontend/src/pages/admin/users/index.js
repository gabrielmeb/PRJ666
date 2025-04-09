import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";

export default function ManageUsers() {
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

  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  useEffect(() => {
    if (isSearching) return;
    fetchUsers(page, limit);
  }, [page, limit, isSearching, totalUsers]);

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

      setUsers(data.users || []);
      if (data.page) setPage(data.page);
      if (data.totalPages) setTotalPages(data.totalPages);
      if (data.totalCount) setTotalUsers(data.totalCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearching(false);
      setPage(1);
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

      setUsers(data.users || []);
      setTotalUsers(data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setPage(1);
  };

  const handleDeleteUser = async (userId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

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

      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setTotalUsers((prevTotal) => Math.max(0, prevTotal - 1)); 
      setSuccessMessage("User removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Users</h1>
        <p className="text-gray-400 mb-6">
          View all registered users. You can search and remove users if you have the proper role.
        </p>

        {/* Error / Success Alerts */}
        {error && (
          <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
            {error}
          </div>
        )}
        {actionError && (
          <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
            {actionError}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-900 text-green-100 p-3 rounded-md mb-4 border border-green-700">
            {successMessage}
          </div>
        )}

        {/* SEARCH FORM */}
        <form className="flex flex-col sm:flex-row items-center gap-2 mb-6" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="bg-gray-800 border border-gray-700 text-white p-2 rounded flex-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
            {isSearching && (
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* MAIN TABLE */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">
            {isSearching ? `Search Results (${totalUsers})` : `All Users (${totalUsers})`}
          </h2>

          {/* Loading Spinner */}
          {(loading || searchLoading) && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !searchLoading && users.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-300">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Try a different search term" : "No users registered yet"}
              </p>
            </div>
          )}

          {/* USERS TABLE */}
          {!loading && !searchLoading && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-3 text-left text-gray-400 font-medium">Name</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Email</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-3 font-medium text-white">
                        <Link 
                          href={`/admin/users/${user._id}`}
                          className="hover:text-purple-400 hover:underline"
                        >
                          {user.first_name} {user.last_name}
                        </Link>
                      </td>
                      <td className="p-3 text-gray-300">{user.email}</td>
                      <td className="p-3">
                        {currentAdmin &&
                          (currentAdmin.role === "SuperAdmin" ||
                            currentAdmin.role === "Admin") && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Remove
                            </button>
                          )}
                        {(!currentAdmin ||
                          (currentAdmin.role !== "SuperAdmin" &&
                            currentAdmin.role !== "Admin")) && (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {!isSearching && !loading && users.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className={`px-3 py-1 border border-gray-700 rounded text-sm ${page <= 1 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) =>
                    prev < totalPages ? prev + 1 : prev
                  )}
                  disabled={page >= totalPages}
                  className={`px-3 py-1 border border-gray-700 rounded text-sm ${page >= totalPages ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}