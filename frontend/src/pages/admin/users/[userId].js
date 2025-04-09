import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function UserDetailsPage() {
  const router = useRouter();
  const { userId } = router.query; // dynamic route param

  // Basic user info state
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState("");

  // Communities user has joined
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [communitiesError, setCommunitiesError] = useState("");

  // Optionally store the admin info (for role checks)
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Load admin info from localStorage
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminInfo");
      if (storedAdmin) {
        setCurrentAdmin(JSON.parse(storedAdmin));
      } else {
        // if not found, optionally redirect
        // router.push("/")
      }
    } catch (err) {
      console.error("Failed to parse adminInfo:", err);
    }
  }, []);

  // ---------------------
  // Fetch the user's data
  // from GET /api/admin/users/:id  (adjust if your route differs)
  // ---------------------
  useEffect(() => {
    if (!userId) return; // wait until param is ready

    const fetchUser = async () => {
      setLoadingUser(true);
      setUserError("");

      try {
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("Not authenticated. Please log in as Admin.");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user data.");
        }

        // data might be { _id, first_name, last_name, email, date_of_birth, ... }
        setUser(data);
      } catch (err) {
        setUserError(err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ---------------------
  // Fetch the communities the user has joined
  // from GET /api/user-communities/user/:userId
  // which returns something like:
  //   [ { _id, community_id: { name, description, ... }, joinedAt }, ... ]
  // or { communities: [ ... ]} — depending on your design
  // ---------------------
  useEffect(() => {
    if (!userId) return;

    const fetchUserCommunities = async () => {
      setLoadingCommunities(true);
      setCommunitiesError("");

      try {
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("Not authenticated. Please log in as Admin.");

        // adjust route if needed
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user-communities/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user communities.");
        }

        // Suppose data is an array of memberships
        // each membership might have community_id populated
        setCommunities(data || []);
      } catch (err) {
        setCommunitiesError(err.message);
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchUserCommunities();
  }, [userId]);

  // RENDER
  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        {/* User Info Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">User Details</h1>

          {loadingUser ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : userError ? (
            <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
              {userError}
            </div>
          ) : user ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {user.first_name} {user.last_name}
              </h2>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="text-gray-400 font-medium">Email:</span> {user.email}
                </p>
                {/* Show date_of_birth or other fields if you have them (and are allowed to show) */}
                {user.date_of_birth && (
                  <p className="text-gray-300">
                    <span className="text-gray-400 font-medium">Date of birth:</span>{" "}
                    {new Date(user.date_of_birth).toLocaleDateString()}
                  </p>
                )}
                {/* If user has a role, preferences, etc. */}
                {user.preferences && user.preferences.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium">Preferences:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.map((pref) => (
                        <span 
                          key={pref} 
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <h3 className="mt-2 text-sm font-medium text-gray-300">User not found</h3>
            </div>
          )}
        </div>

        {/* Communities Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Communities Joined <span className="text-purple-400">({communities.length})</span>
          </h2>

          {loadingCommunities ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : communitiesError ? (
            <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
              {communitiesError}
            </div>
          ) : communities.length === 0 ? (
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
              <h3 className="mt-2 text-sm font-medium text-gray-300">
                This user hasn't joined any community
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-3 text-left text-gray-400 font-medium">Community Name</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Joined At</th>
                    {/* Add more columns if you store them (e.g. roleInCommunity) */}
                  </tr>
                </thead>
                <tbody>
                  {communities.map((membership) => {
                    const comm = membership.community_id || {};
                    return (
                      <tr key={membership._id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="p-3 font-medium text-white">
                          <Link 
                            href={`/admin/communities/${comm._id}`}
                            className="hover:text-purple-400 hover:underline"
                          >
                            {comm.name || "Unknown"}
                          </Link>
                        </td>
                        <td className="p-3 text-gray-400">
                          {membership.joinedAt
                            ? new Date(membership.joinedAt).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}