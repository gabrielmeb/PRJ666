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

  // ----------------------
  // SEARCH BAR STATE
  // ----------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // ----------------------
  // CREATE COMMUNITY STATE
  // ----------------------
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDescription, setNewCommunityDescription] = useState("");
  const [newCommunityTags, setNewCommunityTags] = useState("");

  // ----------------------
  // EFFECT: Load Admin Info
  // ----------------------
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) {
      // If no admin info, optionally redirect to home or admin login:
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

  // ----------------------
  // EFFECT: Fetch Communities (unless searching)
  // ----------------------
  useEffect(() => {
    if (isSearching) return; // skip normal fetch if user is in search mode
    fetchCommunities(page, limit);
  }, [page, limit, isSearching]);

  // ----------------------
  // FETCH COMMUNITIES
  // ----------------------
  const fetchCommunities = async (pageNumber, pageLimit) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      // GET /api/communities?page={pageNumber}&limit={pageLimit}
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

      // data => { page, limit, count, communities: [...], ... }
      setCommunities(data.communities || []);
      if (data.page) setPage(data.page);
      if (data.totalPages) setTotalPages(data.totalPages);
      if (data.totalCount) setTotalCommunities(data.totalCount)
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
      // If search is empty, revert to normal listing
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

      // If you have a search endpoint: GET /api/communities/search?q=...
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

  // ----------------------
  // CLEAR SEARCH
  // ----------------------
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setPage(1);
  };

  // ----------------------
  // DELETE COMMUNITY
  // ----------------------
  const handleDeleteCommunity = async (communityId) => {
    setActionError("");
    if (!confirm("Are you sure you want to remove this community?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Not authenticated. Please log in as an Admin.");
      }

      // DELETE /api/communities/:communityId
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

  // ----------------------
  // CREATE COMMUNITY
  // ----------------------
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
          .filter((tag) => tag), // split by comma
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

      // Insert the newly created community into our list
      setCommunities((prev) => [data.community, ...prev]);
      setTotalCommunities((prevTotal) => Math.max(0, prevTotal + 1));
      setSuccessMessage("Community created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      setNewCommunityName("");
      setNewCommunityDescription("");
      setNewCommunityTags("");
      setShowCreateForm(false);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Communities</h1>
      <p className="text-gray-500 mb-4">
        View, create, and remove communities. Only Admins or SuperAdmins can perform destructive actions.
      </p>

      {/* Error or success messages */}
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

      {/* SEARCH + CREATE ACTIONS */}
      <div className="flex items-center gap-4 mb-4">
        {/* SEARCH FORM */}
        <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Search communities..."
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

        {/* CREATE COMMUNITY TOGGLE BUTTON */}
        {(currentAdmin &&
          (currentAdmin.role === "SuperAdmin" ||
            currentAdmin.role === "Admin")) && (
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
          >
            {showCreateForm ? "Cancel" : "Create Community"}
          </button>
        )}
      </div>

      {/* CREATE COMMUNITY FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateCommunity}
          className="border border-gray-300 rounded p-4 mb-4"
        >
          <h3 className="text-lg font-bold mb-2">Create a New Community</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={newCommunityName}
              onChange={(e) => setNewCommunityName(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Description:</label>
            <textarea
              className="w-full border p-2 rounded"
              value={newCommunityDescription}
              onChange={(e) => setNewCommunityDescription(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Tags (comma separated):</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="e.g. fitness,mental health"
              value={newCommunityTags}
              onChange={(e) => setNewCommunityTags(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </form>
      )}

      {/* COMMUNITIES TABLE */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {isSearching ? "Search Results" : `All Communities (${totalCommunities})`}
        </h2>

        {/* LOADING STATES */}
        {loading && !isSearching && <p>Loading communities...</p>}
        {searchLoading && isSearching && <p>Searching communities...</p>}

        {/* NO RESULTS */}
        {!loading && !searchLoading && communities.length === 0 && (
          <p>No communities found.</p>
        )}

        {!loading && !searchLoading && communities.length > 0 && (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Tags</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communities.map((community) => (
                <tr key={community._id} className="border-b">
                  <td className="p-2 font-semibold underline">
                    <Link href={`/admin/communities/${community._id}`}>
                    {community.name}
                    </Link>
                  </td>
                  <td className="p-2">{community.description}</td>
                  <td className="p-2">
                    {Array.isArray(community.tags) && community.tags.join(", ")}
                  </td>
                  <td className="p-2">
                    {currentAdmin &&
                      (currentAdmin.role === "SuperAdmin" ||
                        currentAdmin.role === "Admin") && (
                        <button
                          onClick={() => handleDeleteCommunity(community._id)}
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

        {/* PAGINATION (only if not searching) */}
        {!isSearching && !loading && communities.length > 0 && (
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
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
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
