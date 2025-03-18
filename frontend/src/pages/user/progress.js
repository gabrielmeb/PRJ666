import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";

export default function ProgressPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newGoalId, setNewGoalId] = useState(""); // the user must pick a goal ID
  const [newProgressPercentage, setNewProgressPercentage] = useState(0);
  const [newMilestones, setNewMilestones] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // For editing progress
  const [editProgressId, setEditProgressId] = useState(null);
  const [editProgressPercentage, setEditProgressPercentage] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // fetch user progress
  useEffect(() => {
    if (!token || !userId) return;
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/progress/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setProgressList(data);
        } else if (res.status === 404) {
          setProgressList([]);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProgress();
  }, [token, userId]);

  // create new progress
  const handleCreateProgress = async (e) => {
    e.preventDefault();
    try {
      const body = {
        goal_id: newGoalId,
        progress_percentage: Number(newProgressPercentage),
        milestones: newMilestones
          ? newMilestones.split(",").map((m) => ({ title: m.trim() }))
          : [],
        notes: newNotes,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const { progress } = await res.json();
        setProgressList((prev) => [progress, ...prev]);
        setNewGoalId("");
        setNewProgressPercentage(0);
        setNewMilestones("");
        setNewNotes("");
      } else {
        console.error("Failed to create progress");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (prog) => {
    setEditProgressId(prog._id);
    setEditProgressPercentage(prog.progress_percentage);
    setEditNotes(prog.notes || "");
  };

  // update progress
  const handleUpdateProgress = async (progressId) => {
    try {
      const body = {
        progress_percentage: editProgressPercentage,
        notes: editNotes,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/progress/${progressId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProgressList((prev) =>
          prev.map((p) => (p._id === progressId ? data.progress : p))
        );
        setEditProgressId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // delete progress
  const handleDeleteProgress = async (progressId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/progress/${progressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setProgressList((prev) => prev.filter((p) => p._id !== progressId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Progress</h1>
      {loading && <p>Loading...</p>}

      {/* Create new progress */}
      <form onSubmit={handleCreateProgress} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Goal ID"
          value={newGoalId}
          onChange={(e) => setNewGoalId(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Progress Percentage"
          value={newProgressPercentage}
          onChange={(e) => setNewProgressPercentage(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Milestones (comma-separated)"
          value={newMilestones}
          onChange={(e) => setNewMilestones(e.target.value)}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Notes"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
          Add Progress
        </button>
      </form>

      <ul className="space-y-2">
        {progressList.map((prog) => (
          <li key={prog._id} className="border p-2 rounded">
            {editProgressId === prog._id ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={editProgressPercentage}
                  onChange={(e) => setEditProgressPercentage(e.target.value)}
                  className="border p-2 w-full"
                />
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="border p-2 w-full"
                />
                <button
                  onClick={() => handleUpdateProgress(prog._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p>GoalID: {prog.goal_id}</p>
                  <p>Progress: {prog.progress_percentage}%</p>
                  <p>Notes: {prog.notes || "none"}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => startEdit(prog)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProgress(prog._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
    </Layout>
  );
}
