import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function CommunityDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [community, setCommunity] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  // Member pagination states
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberPage, setMemberPage] = useState(1);
  const memberLimit = 10;
  const [totalMemberPages, setTotalMemberPages] = useState(1);

  // Get token and userId from localStorage
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // Fetch community details by id
  useEffect(() => {
    if (!id) return;
    const fetchCommunity = async () => {
      setLoadingCommunity(true);
      try {
        const data = await apiFetch(`/api/communities/${id}`, { method: "GET" });
        setCommunity(data);
      } catch (err) {
        console.error("Error fetching community details:", err);
      } finally {
        setLoadingCommunity(false);
      }
    };
    fetchCommunity();
  }, [id]);

  // Fetch membership status from membership endpoint
  useEffect(() => {
    if (!token || !id) return;
    const fetchMembershipStatus = async () => {
      try {
        const data = await apiFetch("/api/user-communities/user", {
          method: "GET",
        });
        const isMember = data.some(
          (mem) =>
            mem.community_id._id.toString() === id ||
            mem.community_id.toString() === id
        );
        setJoined(isMember);
      } catch (err) {
        console.error("Error fetching membership status:", err);
      }
    };
    fetchMembershipStatus();
  }, [token, id]);

  // Fetch community members with pagination
  useEffect(() => {
    if (!id) return;
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const data = await apiFetch(
          `/api/user-communities/community/${id}?page=${memberPage}&limit=${memberLimit}`,
          { method: "GET" }
        );
        setMembers(data.members || []);
        setTotalMemberPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching community members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [id, memberPage]);

  const joinCommunity = async () => {
    if (joined) return;
    try {
      await apiFetch("/api/user-communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community_id: id }),
      });
      setJoined(true);
    } catch (err) {
      console.error("Failed to join community", err);
    }
  };

  const leaveCommunity = async () => {
    const confirmed = window.confirm(
        "Are you sure you want to leave this community?"
      );
      if (!confirmed) return;
    try {
      await apiFetch(`/api/user-communities/${id}`, { method: "DELETE" });
      setJoined(false);
    } catch (err) {
      console.error("Failed to leave community", err);
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-3xl mx-auto text-white">
        {loadingCommunity ? (
          <p>Loading community details...</p>
        ) : community ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{community.name}</h1>
              <p className="mt-2">{community.description}</p>
              {community.tags && community.tags.length > 0 && (
                <div className="mt-2">
                  <strong>Tags:</strong>{" "}
                  {community.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="mr-2 bg-zinc-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4">
                {joined ? (
                  <button
                    onClick={leaveCommunity}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Leave Community
                  </button>
                ) : (
                  <button
                    onClick={joinCommunity}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Join Community
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Members</h2>
              {loadingMembers ? (
                <p>Loading members...</p>
              ) : members.length === 0 ? (
                <p>No members found.</p>
              ) : (
                <ul className="space-y-2">
                  {members.map((member) => (
                    <li
                      key={member._id}
                      className="border p-2 rounded bg-zinc-800 flex items-center"
                    >
                      <div>
                        <p className="font-medium">
                          {member.userData.first_name} {member.userData.last_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {member.userData.email}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-center items-center mt-4 space-x-4">
                <button
                  onClick={() =>
                    setMemberPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={memberPage === 1}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {memberPage} of {totalMemberPages}
                </span>
                <button
                  onClick={() =>
                    setMemberPage((prev) =>
                      Math.min(prev + 1, totalMemberPages)
                    )
                  }
                  disabled={memberPage === totalMemberPages}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Community not found.</p>
        )}
      </div>
    </Layout>
  );
}
