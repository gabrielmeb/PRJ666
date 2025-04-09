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

  const totalPages = useMemo(() => {
    return Math.ceil(communities.length / limit);
  }, [communities]);

  const paginatedCommunities = useMemo(() => {
    const start = (page - 1) * limit;
    return communities.slice(start, start + limit);
  }, [communities, page]);

  const fetchCommunities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/user-communities/user");
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
        <h1 className="text-3xl font-bold text-white mb-6">My Communities</h1>

        {loading ? (
          <p className="text-gray-400">Loading your communities...</p>
        ) : error ? (
          <div className="p-4 bg-red-600 text-white rounded-md mb-4">
            {error}
          </div>
        ) : communities.length === 0 ? (
          <div className="p-4 bg-zinc-800 text-gray-300 rounded-md">
            <p className="mb-2">You have not joined any communities yet.</p>
            <p>
              Explore available communities{" "}
              <Link href="/user/community">
                <span className="text-blue-400 underline cursor-pointer">
                  here
                </span>
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedCommunities.map((membership) => {
              const community = membership.community_id;
              return (
                <div
                  key={membership._id}
                  className="p-4 border border-zinc-700 rounded-md shadow hover:shadow-lg transition-shadow bg-zinc-800 text-white flex justify-between items-center"
                >
                  <div>
                    <Link href={`/user/my_communities/${community._id}`}>
                      <span className="text-xl font-semibold text-blue-500 hover:underline cursor-pointer">
                        {community.name}
                      </span>
                    </Link>
                    <p className="text-sm text-gray-400">
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

        {communities.length > limit && (
          <div className="flex mt-6 space-x-4 justify-center items-center">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="bg-zinc-700 hover:bg-zinc-600 text-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="bg-zinc-700 hover:bg-zinc-600 text-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
