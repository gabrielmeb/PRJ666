import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";

export default function CommunityPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // 1) fetch all communities
  useEffect(() => {
    if (!token) return;
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/communities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCommunities(data.communities); // see controller: { page, limit, communities, ... }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCommunities();
  }, [token]);

  // 2) fetch user-joined communities
  useEffect(() => {
    if (!token) return;
    const fetchJoined = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-communities/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // each membership has community_id
          setJoinedCommunities(data.map((mem) => mem.community_id._id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchJoined();
  }, [token]);

  // join a community
  const joinCommunity = async (communityId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-communities`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ community_id: communityId }),
      });
      if (res.ok) {
        setJoinedCommunities((prev) => [...prev, communityId]);
      } else {
        console.error("Failed to join community");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // leave a community
  const leaveCommunity = async (communityId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-communities/${communityId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
      }
    } catch (err) {
      console.error(err);
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
