import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";

export default function CommunityDetailsPage() {
  const router = useRouter();
  const { communityId } = router.query;

  const [community, setCommunity] = useState(null);
  const [error, setError] = useState("");
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  // MEMBERS state
  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0)
  const [membersError, setMembersError] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // can make dynamic if needed
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("joinedAt");
  const [sortDirection, setSortDirection] = useState("asc");

  // Admin Info
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // ----------------------------
  // Load Admin Info
  // ----------------------------
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) {
      router.push("/");
      return;
    }
    try {
      setCurrentAdmin(JSON.parse(storedAdmin));
    } catch {
      router.push("/");
    }
  }, [router]);

  // ----------------------------
  // Fetch Community Details
  // (we assume GET /api/communities/:communityId)
  // ----------------------------
  useEffect(() => {
    if (!communityId) return;

    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("Not authenticated as Admin.");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/communities/${communityId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load community");
        setCommunity(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCommunity(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  // ----------------------------
  // Fetch Members with Pagination + Sorting
  // GET /api/user-communities/community/:communityId?page=&limit=&sortField=&sortDirection=
  // ----------------------------
  useEffect(() => {
    if (!communityId) return;

    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("Not authenticated as Admin.");

        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sortField,
          sortDirection
        }).toString();

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-communities/community/${communityId}?${query}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load community members");
        }

        // data => { page, limit, totalCount, totalPages, sortField, sortDirection, members: [...] }
        setMembers(data.members || []);
        setTotalMembers(data.totalMembers || 0)
        
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setMembersError(err.message);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [communityId, page, limit, sortField, sortDirection, totalMembers]);

  // ----------------------------
  // HANDLE SORT
  // ----------------------------
  const handleSort = (field) => {
    // If clicking on the same field, toggle direction
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // Also reset to page 1 (common approach when changing sorting)
    setPage(1);
  };

  // ----------------------------
  // REMOVE user from community
  // (DELETE /api/user-communities/:communityId/:userId)
  // ----------------------------
  const handleRemoveUser = async (userId) => {
    if (!confirm("Are you sure you want to remove this user from the community?")) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not authenticated as Admin.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-communities/${communityId}/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove user from community");
      }

      // Filter out removed user
      setMembers((prev) => prev.filter((m) => m.user_id.toString() !== userId.toString()));
      setTotalMembers((prevTotal) => Math.max(0, prevTotal - 1));
      alert("User removed successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // RENDER
  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        {/* Community Info Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">Community Details</h1>

          {loadingCommunity ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
              Error: {error}
            </div>
          ) : community ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{community.name}</h2>
              <p className="text-gray-300 mb-4">{community.description}</p>
              {community.tags?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
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
              <h3 className="mt-2 text-sm font-medium text-gray-300">Community not found</h3>
            </div>
          )}
        </div>

        {/* Members Table Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Community Members <span className="text-purple-400">({totalMembers})</span>
            </h2>
          </div>

          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : membersError ? (
            <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
              {membersError}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="p-3 text-left text-gray-400 font-medium">
                        <button
                          onClick={() => handleSort("name")}
                          className="hover:text-purple-400 focus:outline-none flex items-center gap-1"
                        >
                          Name
                          {sortField === "name" && (
                            sortDirection === "asc" ? "↑" : "↓"
                          )}
                        </button>
                      </th>
                      <th className="p-3 text-left text-gray-400 font-medium">
                        <button
                          onClick={() => handleSort("email")}
                          className="hover:text-purple-400 focus:outline-none flex items-center gap-1"
                        >
                          Email
                          {sortField === "email" && (
                            sortDirection === "asc" ? "↑" : "↓"
                          )}
                        </button>
                      </th>
                      <th className="p-3 text-left text-gray-400 font-medium">
                        <button
                          onClick={() => handleSort("joinedAt")}
                          className="hover:text-purple-400 focus:outline-none flex items-center gap-1"
                        >
                          Joined At
                          {sortField === "joinedAt" && (
                            sortDirection === "asc" ? "↑" : "↓"
                          )}
                        </button>
                      </th>
                      <th className="p-3 text-left text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((membership) => {
                      const user = membership.userData;
                      return (
                        <tr key={membership._id} className="border-b border-gray-800 hover:bg-gray-800">
                          <td className="p-3 font-medium text-white">
                            <Link 
                              href={`/admin/users/${user._id}`}
                              className="hover:text-purple-400 hover:underline"
                            >
                              {user.first_name} {user.last_name}
                            </Link>
                          </td>
                          <td className="p-3 text-gray-300">{user.email}</td>
                          <td className="p-3 text-gray-400">
                            {new Date(membership.joinedAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            {currentAdmin && (currentAdmin.role === "SuperAdmin" || currentAdmin.role === "Admin") ? (
                              <button
                                onClick={() => handleRemoveUser(user._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalMembers)} of {totalMembers} members
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
                    onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                    disabled={page >= totalPages}
                    className={`px-3 py-1 border border-gray-700 rounded text-sm ${page >= totalPages ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}