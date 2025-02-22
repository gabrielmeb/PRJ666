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
      <div className="bg-white rounded shadow p-4">
        <h1 className="text-2xl font-bold mb-4">User Details</h1>

        {/* User Info */}
        {loadingUser ? (
          <p>Loading user data...</p>
        ) : userError ? (
          <p className="text-red-600">{userError}</p>
        ) : user ? (
          <div>
            <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
            <p className="text-gray-700 mt-2">Email: {user.email}</p>
            {/* Show date_of_birth or other fields if you have them (and are allowed to show) */}
            {user.date_of_birth && (
              <p className="text-gray-700">
                Date of birth: {new Date(user.date_of_birth).toLocaleDateString()}
              </p>
            )}
            {/* If user has a role, preferences, etc. */}
            {user.preferences && user.preferences.length > 0 && (
              <p className="mt-2">
                <span className="font-semibold">Preferences:</span>{" "}
                {user.preferences.join(", ")}
              </p>
            )}
            {/* Add any additional fields you want to show */}
          </div>
        ) : (
          <p className="text-gray-500">User not found.</p>
        )}
      </div>

      {/* Communities Section */}
      <div className="bg-white rounded shadow p-4 mt-4">
        <h2 className="text-xl font-bold mb-4">Communities Joined</h2>
        {loadingCommunities ? (
          <p>Loading user communities...</p>
        ) : communitiesError ? (
          <p className="text-red-600">{communitiesError}</p>
        ) : communities.length === 0 ? (
          <p>This user hasn&apos;t joined any community.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Community Name</th>
                <th className="p-2 text-left">Joined At</th>
                {/* Add more columns if you store them (e.g. roleInCommunity) */}
              </tr>
            </thead>
            <tbody>
              {communities.map((membership) => {
                // Suppose membership.community_id is an object with ._id, .name, etc.
                const comm = membership.community_id || {};
                return (
                  <tr key={membership._id} className="border-b">
                    <td className="p-2 font-semibold underline">
                    <Link href={`/admin/communities/${comm._id}`}>
                    {comm.name || "Unknown"}
                    </Link>
                  </td>
                    <td className="p-2">
                      {membership.joinedAt
                        ? new Date(membership.joinedAt).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
