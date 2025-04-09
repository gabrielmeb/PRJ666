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
      <div className="bg-white rounded shadow p-4">
        <h1 className="text-2xl font-bold mb-4">Community Details</h1>

        {/* Community Info */}
        {loadingCommunity ? (
          <p>Loading community details...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : community ? (
          <div>
            <h2 className="text-xl font-semibold">{community.name}</h2>
            <p className="mt-2 text-gray-600">{community.description}</p>
            {community.tags?.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Tags:</span> {community.tags.join(", ")}
              </div>
            )}
          </div>
        ) : (
          <p>Community not found.</p>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded shadow p-4 mt-4">
        <h2 className="text-xl font-bold mb-4">Community Members &#40;{totalMembers}&#41;</h2>

        {loadingMembers ? (
          <p>Loading members...</p>
        ) : membersError ? (
          <p className="text-red-600">{membersError}</p>
        ) : (
          <>
            {/* Table */}
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="font-semibold focus:outline-none"
                    >
                      Name
                      {sortField === "name" && (
                        sortDirection === "asc" ? " ↑" : " ↓"
                      )}
                    </button>
                  </th>
                  <th className="p-2 text-left">
                    <button
                      onClick={() => handleSort("email")}
                      className="font-semibold focus:outline-none"
                    >
                      Email
                      {sortField === "email" && (
                        sortDirection === "asc" ? " ↑" : " ↓"
                      )}
                    </button>
                  </th>
                  <th className="p-2 text-left">
                    <button
                      onClick={() => handleSort("joinedAt")}
                      className="font-semibold focus:outline-none"
                    >
                      Joined At
                      {sortField === "joinedAt" && (
                        sortDirection === "asc" ? " ↑" : " ↓"
                      )}
                    </button>
                  </th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((membership) => {
                  // membership.userData from the aggregation pipeline
                  // or membership.user_id, etc. 
                  const user = membership.userData;
                  return (
                    <tr key={membership._id} className="border-b">
                      <td className="p-2 font-semibold underline">
                        <Link href={`/admin/users/${user._id}`}>
                          {user.first_name} {user.last_name}
                        </Link>
                        </td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        {new Date(membership.joinedAt).toLocaleString()}
                      </td>
                      <td className="p-2">
                        {currentAdmin && (currentAdmin.role === "SuperAdmin" || currentAdmin.role === "Admin") ? (
                          <button
                            onClick={() => handleRemoveUser(user._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4 flex gap-2">
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
                onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                disabled={page >= totalPages}
                className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}