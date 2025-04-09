import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";
import Link from "next/link";

export default function CommunityIndexPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Get token and userId from localStorage
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // Fetch communities from API (with or without search)
  useEffect(() => {
    if (!token) return;
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        let data;
        let url = "";
        if (searchQuery.trim()) {
          // Use the search endpoint with pagination
          url = `/api/communities/search?q=${encodeURIComponent(
            searchQuery
          )}&page=${currentPage}&limit=${limit}`;
          data = await apiFetch(url, { method: "GET" });
          setCommunities(data.communities || []);
          setTotalPages(data.totalPages);
        } else {
          // Use general communities endpoint with pagination
          url = `/api/communities?page=${currentPage}&limit=${limit}`;
          const res = await apiFetch(url, { method: "GET" });
          setCommunities(res.communities || []);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [token, searchQuery, currentPage]);

  // Fetch communities the user has joined
  useEffect(() => {
    if (!token) return;
    const fetchJoined = async () => {
      try {
        const data = await apiFetch("/api/user-communities/user", {
          method: "GET",
        });
        const joinedIds = data.map((mem) => mem.community_id._id);
        setJoinedCommunities(joinedIds);
      } catch (err) {
        console.error("Error fetching joined communities:", err);
      }
    };
    fetchJoined();
  }, [token]);

  const joinCommunity = async (communityId) => {
    try {
      await apiFetch("/api/user-communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community_id: communityId }),
      });
      setJoinedCommunities((prev) => [...prev, communityId]);
    } catch (err) {
      console.error("Failed to join community", err);
    }
  };

  const leaveCommunity = async (communityId) => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this community?"
    );
    if (!confirmed) return;
    try {
      await apiFetch(`/api/user-communities/${communityId}`, {
        method: "DELETE",
      });
      setJoinedCommunities((prev) =>
        prev.filter((id) => id !== communityId)
      );
    } catch (err) {
      console.error("Failed to leave community", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <Layout>
      <div className="p-4 max-w-3xl mx-auto text-white">
        <h1 className="text-2xl font-bold mb-4">Communities</h1>
        <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow border p-2 rounded bg-zinc-700 text-white"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">
            Search
          </button>
        </form>

        {loading && <p>Loading communities...</p>}
        {!loading && communities.length === 0 && <p>No communities found.</p>}

        <ul className="space-y-3">
          {communities.map((comm) => {
            const joined = joinedCommunities.includes(comm._id);
            return (
              <li
                key={comm._id}
                className="border p-3 rounded bg-zinc-800 flex justify-between items-center"
              >
                <div>
                  <Link
                    href={`/user/community/${comm._id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {comm.name}
                  </Link>
                  <p className="text-sm text-gray-400">{comm.description}</p>
                </div>
                <div>
                  {joined ? (
                    <button
                      onClick={() => leaveCommunity(comm._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => joinCommunity(comm._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Join
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Pagination controls */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}
