import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

export default function ManageCommunities() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [totalCommunities, setTotalCommunities] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Admin info (for role checks)
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Create community state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [newCommunityTags, setNewCommunityTags] = useState("");

  // Load admin info
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) {
      router.push("/");
      return;
    }
    try {
      setCurrentAdmin(JSON.parse(storedAdmin));
    } catch (error) {
      console.error("Failed to parse adminInfo:", error);
      localStorage.removeItem("adminInfo");
      localStorage.removeItem("adminToken");
      router.push("/");
    }
  }, [router]);

  // Fetch communities
  useEffect(() => {
    if (isSearching) return;
    fetchCommunities(page, limit);
  }, [page, limit, isSearching]);

  const fetchCommunities = async (pageNumber, pageLimit) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/communities?page=${pageNumber}&limit=${pageLimit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch communities.");
      }

      setCommunities(data.communities || []);
      if (data.page) setPage(data.page);
      if (data.totalPages) setTotalPages(data.totalPages);
      if (data.totalCount) setTotalCommunities(data.totalCount);
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to search communities.");
      }

      setCommunities(data.communities || []);
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

  const handleDeleteCommunity = async (communityId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this community?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

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
      setTotalCommunities((prevTotal) => Math.max(0, prevTotal - 1));
      setSuccessMessage("Community removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(""), 3000);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setActionError("");
    setSuccessMessage("");

    if (!newCommunityName.trim() || !newCommunityDescription.trim()) {
      setActionError("Please fill in Name and Description.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      const payload = {
        name: newCommunityName,
        description: newCommunityDescription,
        tags: newCommunityTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create community.");
      }

      setCommunities((prev) => [data.community, ...prev]);
      setTotalCommunities((prevTotal) => Math.max(0, prevTotal + 1));
      setSuccessMessage("Community created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      setNewCommunityName("");
      setNewCommunityDescription("");
      setNewCommunityTags("");
      setShowCreateForm(false);
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Communities</h1>
        <p className="text-gray-400 mb-6">
          View, create, and remove communities. Only Admins or SuperAdmins can perform destructive actions.
        </p>

        {/* Error or success messages */}
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

        {/* SEARCH + CREATE ACTIONS */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          {/* SEARCH FORM */}
          <form className="flex flex-1 w-full" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="bg-gray-800 border border-gray-700 text-white p-2 rounded-l-md flex-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
            {isSearching && (
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-r-md"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            )}
          </form>

          {/* CREATE COMMUNITY TOGGLE BUTTON */}
          {(currentAdmin &&
            (currentAdmin.role === "SuperAdmin" ||
              currentAdmin.role === "Admin")) && (
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full md:w-auto"
            >
              {showCreateForm ? "Cancel" : "Create Community"}
            </button>
          )}
        </div>

        {/* CREATE COMMUNITY FORM */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateCommunity}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Create a New Community</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Name:</label>
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Description:</label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                rows={3}
                value={newCommunityDescription}
                onChange={(e) => setNewCommunityDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tags (comma separated):</label>
              <input
                type="text"
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g. fitness,mental health"
                value={newCommunityTags}
                onChange={(e) => setNewCommunityTags(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </form>
        )}

        {/* COMMUNITIES TABLE */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">
            {isSearching ? "Search Results" : `All Communities (${totalCommunities})`}
          </h2>

          {/* LOADING STATES */}
          {loading && !isSearching && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
          {searchLoading && isSearching && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* NO RESULTS */}
          {!loading && !searchLoading && communities.length === 0 && (
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
              <h3 className="mt-2 text-sm font-medium text-gray-300">No communities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Try a different search term" : "Create a new community to get started"}
              </p>
            </div>
          )}

          {!loading && !searchLoading && communities.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-3 text-left text-gray-400 font-medium">Name</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Description</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Tags</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((community) => (
                    <tr key={community._id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-3 font-medium text-white">
                        <Link href={`/admin/communities/${community._id}`} className="hover:text-purple-400 hover:underline">
                          {community.name}
                        </Link>
                      </td>
                      <td className="p-3 text-gray-300">{community.description}</td>
                      <td className="p-3 text-gray-400">
                        {Array.isArray(community.tags) && community.tags.join(", ")}
                      </td>
                      <td className="p-3">
                        {currentAdmin &&
                          (currentAdmin.role === "SuperAdmin" ||
                            currentAdmin.role === "Admin") && (
                            <button
                              onClick={() => handleDeleteCommunity(community._id)}
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

          {/* PAGINATION (only if not searching) */}
          {!isSearching && !loading && communities.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCommunities)} of {totalCommunities} communities
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
                  onClick={() =>
                    setPage((prev) => (prev < totalPages ? prev + 1 : prev))
                  }
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