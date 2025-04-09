// src/pages/user/goals.js
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function GoalsPage() {
  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [goals, setGoals] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Generic feedback (no raw messages)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Goal form states
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalDescription, setEditGoalDescription] = useState("");
  const [editGoalStatus, setEditGoalStatus] = useState("Pending");

  // Progress form states
  const [progressForm, setProgressForm] = useState({
    goal_id: "",
    progress_percentage: 0,
    milestones: "",
    notes: "",
  });
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [editingProgressForm, setEditingProgressForm] = useState({
    progress_percentage: 0,
    milestones: "",
    notes: "",
  });

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) return;
    setUserId(uid);

    const fetchData = async () => {
      setLoading(true);
      setError("");
      let pid = uid;

      // 1. Fetch profile
      try {
        const profile = await apiFetch(`/api/user-profiles/${uid}`);
        pid = profile?._id || uid;
        setProfileId(pid);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
        return;
      }

      // 2. Fetch goals
      let goalList = [];
      try {
        goalList = await apiFetch(`/api/goals/user/${pid}`);
      } catch (err) {
        if (err.message.toLowerCase().includes("no goals")) {
          goalList = [];
        } else {
          console.error("Goals fetch failed:", err);
          setError("Something went wrong. Please try again.");
          setLoading(false);
          return;
        }
      }
      setGoals(goalList);

      // 3. Fetch progress (treat 404 as “no progress”)
      let progressList = [];
      try {
        progressList = await apiFetch(`/api/progress/user/${pid}`);
      } catch (err) {
        if (err.message.toLowerCase().includes("no progress")) {
          // no progress found: fine, leave progressList empty
        } else {
          console.error("Progress fetch failed:", err);
          setError("Something went wrong. Please try again later.");
        }
      }

      // Build progress map
      const pMap = {};
      progressList.forEach((p) => {
        if (p.goal_id && p.goal_id._id) {
          pMap[p.goal_id._id] = p;
        }
      });
      setProgressMap(pMap);

      setLoading(false);
    };

    fetchData();
  }, []);

  // GENERIC error handler
  const handleError = (err, fallbackMessage) => {
    console.error(fallbackMessage, err);
    setError(fallbackMessage);
  };

  // --------------------- Goal Handlers --------------------- //

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!newGoalDescription.trim()) {
      setError("Please enter a goal description.");
      return;
    }
    try {
      const { goal } = await apiFetch(`/api/goals`, {
        method: "POST",
        body: JSON.stringify({ description: newGoalDescription }),
      });
      setGoals([goal, ...goals]);
      setNewGoalDescription("");
      setSuccess("Goal created!");
    } catch (err) {
      handleError(err, "Failed to create goal. Please try again.");
    }
  };

  const handleUpdateGoal = async (goalId) => {
    setError(""); setSuccess("");
    try {
      const { goal: updated } = await apiFetch(`/api/goals/${goalId}`, {
        method: "PUT",
        body: JSON.stringify({
          description: editGoalDescription,
          status: editGoalStatus,
        }),
      });
      setGoals(goals.map((g) => (g._id === goalId ? updated : g)));
      setEditGoalId(null);
      setEditGoalDescription("");
      setEditGoalStatus("Pending");
      setSuccess("Goal updated!");
    } catch (err) {
      handleError(err, "Failed to update goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    setError(""); setSuccess("");
    try {
      await apiFetch(`/api/goals/${goalId}`, { method: "DELETE" });
      setGoals(goals.filter((g) => g._id !== goalId));
      setSuccess("Goal deleted!");
    } catch (err) {
      handleError(err, "Failed to delete goal. Please try again.");
    }
  };

  // --------------------- Progress Handlers --------------------- //

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const { goal_id, progress_percentage, milestones, notes } = progressForm;
    if (!goal_id) {
      setError("Could not identify goal. Please refresh and try again.");
      return;
    }
    const milestonesArray = milestones
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    try {
      const { progress } = await apiFetch(`/api/progress`, {
        method: "POST",
        body: JSON.stringify({
          goal_id,
          progress_percentage,
          milestones: milestonesArray,
          notes,
        }),
      });
      setProgressMap({ ...progressMap, [goal_id]: progress });
      setProgressForm({ goal_id: "", progress_percentage: 0, milestones: "", notes: "" });
      setSuccess("Progress recorded!");
    } catch (err) {
      handleError(err, "Failed to submit progress. Please try again.");
    }
  };

  const handleEditProgress = (goal) => {
    const p = progressMap[goal._id];
    if (!p) return;
    setEditingProgressId(goal._id);
    setEditingProgressForm({
      progress_percentage: p.progress_percentage,
      milestones: p.milestones.join(", "),
      notes: p.notes || "",
    });
  };

  const handleCancelEditProgress = () => {
    setEditingProgressId(null);
    setEditingProgressForm({ progress_percentage: 0, milestones: "", notes: "" });
  };

  const handleUpdateProgress = async (goal) => {
    setError(""); setSuccess("");
    const p = progressMap[goal._id];
    if (!p) {
      setError("Could not find progress. Please refresh and try again.");
      return;
    }
    const milestonesArray = editingProgressForm.milestones
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    try {
      const { progress: updated } = await apiFetch(`/api/progress/${p._id}`, {
        method: "PUT",
        body: JSON.stringify({
          progress_percentage: editingProgressForm.progress_percentage,
          milestones: milestonesArray,
          notes: editingProgressForm.notes,
        }),
      });
      setProgressMap({ ...progressMap, [goal._id]: updated });
      setEditingProgressId(null);
      setEditingProgressForm({ progress_percentage: 0, milestones: "", notes: "" });
      setSuccess("Progress updated!");
    } catch (err) {
      handleError(err, "Failed to update progress. Please try again.");
    }
  };

  const handleDeleteProgress = async (goal) => {
    setError(""); setSuccess("");
    const p = progressMap[goal._id];
    if (!p) return;
    try {
      await apiFetch(`/api/progress/${p._id}`, { method: "DELETE" });
      const m = { ...progressMap };
      delete m[goal._id];
      setProgressMap(m);
      setSuccess("Progress deleted!");
    } catch (err) {
      handleError(err, "Failed to delete progress. Please try again.");
    }
  };

  // --------------------- Render --------------------- //

  const renderGoalCard = (goal) => {
    const p = progressMap[goal._id];
    return (
      <li key={goal._id} className="p-4 border rounded-lg shadow bg-white space-y-4">
        {/* Goal edit / view */}
        {editGoalId === goal._id ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editGoalDescription}
              onChange={(e) => setEditGoalDescription(e.target.value)}
              placeholder="Edit description"
              className="border p-2 w-full rounded"
            />
            <select
              value={editGoalStatus}
              onChange={(e) => setEditGoalStatus(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateGoal(goal._id)}
                className="bg-green-500 px-3 py-1 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditGoalId(null);
                  setEditGoalDescription("");
                }}
                className="bg-gray-500 px-3 py-1 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">{goal.description}</h2>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {goal.status}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditGoalId(goal._id);
                  setEditGoalDescription(goal.description);
                  setEditGoalStatus(goal.status);
                }}
                className="bg-gray-400 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteGoal(goal._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Progress section */}
        {p ? (
          <div className="mt-4">
            {editingProgressId === goal._id ? (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Progress %"
                  min="0"
                  max="100"
                  value={editingProgressForm.progress_percentage}
                  onChange={(e) =>
                    setEditingProgressForm((prev) => ({
                      ...prev,
                      progress_percentage: Number(e.target.value),
                    }))
                  }
                  className="border p-2 w-full rounded"
                />
                <input
                  type="text"
                  placeholder="Milestones (comma separated)"
                  value={editingProgressForm.milestones}
                  onChange={(e) =>
                    setEditingProgressForm((prev) => ({
                      ...prev,
                      milestones: e.target.value,
                    }))
                  }
                  className="border p-2 w-full rounded"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={editingProgressForm.notes}
                  onChange={(e) =>
                    setEditingProgressForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="border p-2 w-full rounded"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateProgress(goal)}
                    className="bg-green-500 px-3 py-1 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditProgress}
                    className="bg-gray-500 px-3 py-1 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${p.progress_percentage}%` }}
                  />
                </div>
                <div className="text-sm">{p.progress_percentage}% completed</div>
                {p.milestones.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <strong>Milestones:</strong> {p.milestones.map(m => m.title).join(", ")}
                  </div>
                )}
                {p.notes && <div className="text-xs text-gray-500">{p.notes}</div>}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProgress(goal)}
                    className="bg-yellow-500 px-2 py-1 text-white rounded"
                  >
                    Edit Progress
                  </button>
                  <button
                    onClick={() => handleDeleteProgress(goal)}
                    className="bg-red-500 px-2 py-1 text-white rounded"
                  >
                    Delete Progress
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleProgressSubmit} className="mt-4 space-y-2">
            <input
              type="number"
              placeholder="Progress %"
              min="0"
              max="100"
              value={progressForm.goal_id === goal._id ? progressForm.progress_percentage : ""}
              onChange={(e) =>
                setProgressForm((prev) => ({
                  ...prev,
                  goal_id: goal._id,
                  progress_percentage: Number(e.target.value),
                }))
              }
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="Milestones (comma separated)"
              value={progressForm.goal_id === goal._id ? progressForm.milestones : ""}
              onChange={(e) =>
                setProgressForm((prev) => ({
                  ...prev,
                  goal_id: goal._id,
                  milestones: e.target.value,
                }))
              }
              className="border p-2 w-full rounded"
            />
            <textarea
              placeholder="Notes (optional)"
              value={progressForm.goal_id === goal._id ? progressForm.notes : ""}
              onChange={(e) =>
                setProgressForm((prev) => ({
                  ...prev,
                  goal_id: goal._id,
                  notes: e.target.value,
                }))
              }
              className="border p-2 w-full rounded"
            />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
              Submit Progress
            </button>
          </form>
        )}
      </li>
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Goals & Progress</h1>

        {/* Show only generic messages */}
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded">
            Something went wrong. Please try again.
          </div>
        )}
        {success && (
          <div className="p-2 bg-green-100 text-green-700 rounded">{success}</div>
        )}

        {/* New goal form */}
        <form onSubmit={handleCreateGoal} className="flex gap-2">
          <input
            type="text"
            placeholder="Your goal..."
            value={newGoalDescription}
            onChange={(e) => setNewGoalDescription(e.target.value)}
            className="flex-grow border p-2 rounded"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </form>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-600">No goals yet.</p>
        ) : (
          <ul className="space-y-4">{goals.map(renderGoalCard)}</ul>
        )}
      </div>
    </Layout>
  );
}