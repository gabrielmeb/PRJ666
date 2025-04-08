import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function ProgressPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(false);

  // New progress form state
  const [newGoalId, setNewGoalId] = useState("");
  const [newProgressPercentage, setNewProgressPercentage] = useState(0);
  const [newMilestones, setNewMilestones] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Editing progress state
  const [editProgressId, setEditProgressId] = useState(null);
  const [editProgressPercentage, setEditProgressPercentage] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  // Retrieve token and userId from localStorage on mount.
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // Fetch user progress once token and userId are available.
  useEffect(() => {
    if (!token || !userId) return;
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/progress/user/${userId}`, {
          method: "GET",
        });
        setProgressList(data);
      } catch (err) {
        if (err.message.includes("404")) {
          setProgressList([]);
        } else {
          console.error("Error fetching progress:", err);
        }
      }
      setLoading(false);
    };
    fetchProgress();
  }, [token, userId]);

  // Create new progress
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
      const res = await apiFetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // Assumes the response returns { progress } as the newly created progress.
      const { progress } = res;
      setProgressList((prev) => [progress, ...prev]);
      setNewGoalId("");
      setNewProgressPercentage(0);
      setNewMilestones("");
      setNewNotes("");
    } catch (err) {
      console.error("Failed to create progress:", err);
    }
  };

  // Start editing a progress item.
  const startEdit = (prog) => {
    setEditProgressId(prog._id);
    setEditProgressPercentage(prog.progress_percentage);
    setEditNotes(prog.notes || "");
  };

  // Update progress for a given progress item.
  const handleUpdateProgress = async (progressId) => {
    try {
      const body = {
        progress_percentage: editProgressPercentage,
        notes: editNotes,
      };
      const data = await apiFetch(`/api/progress/${progressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setProgressList((prev) =>
        prev.map((p) => (p._id === progressId ? data.progress : p))
      );
      setEditProgressId(null);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  // Delete a progress item.
  const handleDeleteProgress = async (progressId) => {
    try {
      await apiFetch(`/api/progress/${progressId}`, { method: "DELETE" });
      setProgressList((prev) => prev.filter((p) => p._id !== progressId));
    } catch (err) {
      console.error("Failed to delete progress:", err);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Progress</h1>
        {loading && <p>Loading...</p>}

        {/* Form to create new progress */}
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

        {/* Display progress list */}
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
