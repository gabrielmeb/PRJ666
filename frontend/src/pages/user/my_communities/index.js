import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";
import Link from "next/link";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10; // items per page

  // Compute total pages client-side from the list length.
  const totalPages = useMemo(() => {
    return Math.ceil(communities.length / limit);
  }, [communities]);

  // Compute the communities to show on the current page.
  const paginatedCommunities = useMemo(() => {
    const start = (page - 1) * limit;
    return communities.slice(start, start + limit);
  }, [communities, page]);

  const fetchCommunities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/user-communities/user");
      // data is expected to be an array of user-community membership objects
      setCommunities(data);
    } catch (err) {
      console.error("Error fetching user communities:", err);
      setError("Failed to load your communities. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Communities</h1>

        {loading ? (
          <p className="text-gray-600">Loading your communities...</p>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
            {error}
          </div>
        ) : communities.length === 0 ? (
          <div className="p-4 bg-gray-100 text-gray-700 rounded-md">
            <p className="mb-2">You have not joined any communities yet.</p>
            <p>
              Explore available communities{" "}
              <Link href="/user/community">
                <span className="text-blue-600 underline cursor-pointer">
                  here
                </span>
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedCommunities.map((membership) => {
              // membership contains community_id object with community details.
              const community = membership.community_id;
              return (
                <div
                  key={membership._id}
                  className="p-4 border rounded-md shadow hover:shadow-lg transition-shadow flex justify-between items-center"
                >
                  <div>
                    <Link href={`/user/my_communities/${community._id}`}>
                      <span className="text-xl font-semibold text-blue-700 hover:underline cursor-pointer">
                        {community.name}
                      </span>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {community.description}
                    </p>
                  </div>
                  <div>
                    <Link href={`/user/my_communities/${community._id}`}>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Only show pagination controls if more than one page is needed */}
        {communities.length > limit && (
          <div className="flex mt-6 space-x-4 justify-center items-center">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
