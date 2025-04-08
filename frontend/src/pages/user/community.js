import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function CommunityPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  // On mount, get token and userId from localStorage.
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // 1) Fetch all communities once token is available.
  useEffect(() => {
    if (!token) return;
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const data = await apiFetch("/api/communities", { method: "GET" });
        // Assuming your controller returns: { page, limit, communities, ... }
        setCommunities(data.communities);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCommunities();
  }, [token]);

  // 2) Fetch communities the user has joined.
  useEffect(() => {
    if (!token) return;
    const fetchJoined = async () => {
      try {
        const data = await apiFetch("/api/user-communities/user", { method: "GET" });
        // Each membership is assumed to contain a community_id object.
        setJoinedCommunities(data.map((mem) => mem.community_id._id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchJoined();
  }, [token]);

  // Join a community.
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

  // Leave a community.
  const leaveCommunity = async (communityId) => {
    try {
      await apiFetch(`/api/user-communities/${communityId}`, { method: "DELETE" });
      setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
    } catch (err) {
      console.error("Failed to leave community", err);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Communities</h1>
        {loading && <p>Loading communities...</p>}

        <ul className="space-y-2">
          {communities.map((comm) => {
            const joined = joinedCommunities.includes(comm._id);
            return (
              <li key={comm._id} className="border p-2 rounded flex justify-between">
                <div>
                  <h2 className="font-semibold">{comm.name}</h2>
                  <p>{comm.description}</p>
                </div>
                {joined ? (
                  <button
                    onClick={() => leaveCommunity(comm._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => joinCommunity(comm._id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Join
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
}
