// pages/communities/index.jsx
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";
import Link from "next/link";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/user-communities/user"); // No userId needed
      setCommunities(data);
    } catch (error) {
      console.error("Error fetching user communities:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <Layout>
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Communities</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          {communities.map((community) => (
            <div
              key={community._id}
              className="p-4 border rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{community.community_id.name}</p>
                <p className="text-sm text-gray-600">{community.community_id.description}</p>
              </div>
              <div>
                {/* Link to the community detail page */}
                <Link href={`/user/my_communities/${community._id}`}>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded-md">
                    View
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex mt-4 space-x-2">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="bg-gray-300 px-3 py-1 rounded-md disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="bg-gray-300 px-3 py-1 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Page {page} of {totalPages}
      </p>
    </div>
    </Layout>
  );
}
