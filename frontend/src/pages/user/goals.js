import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function GoalsPage() {
  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [goals, setGoals] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Global messages for user feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Goal form states
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalDescription, setEditGoalDescription] = useState("");
  const [editGoalStatus, setEditGoalStatus] = useState("Pending");

  // Progress creation form (for goals without progress yet)
  const [progressForm, setProgressForm] = useState({
    goal_id: "",
    progress_percentage: 0,
    milestones: "", // comma separated string; will convert to array on submit
    notes: "",
  });

  // Progress editing form state (for an existing progress)
  const [editingProgressId, setEditingProgressId] = useState(null); // goal id of progress being edited
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
      try {
        const profile = await apiFetch(`/api/user-profiles/${uid}`);
        const profileId = profile?._id || uid;
        setProfileId(profileId);

        const goalList = await apiFetch(`/api/goals/user/${profileId}`);
        setGoals(goalList);

        const progressList = await apiFetch(`/api/progress/user/${uid}`);
        // Build a map from goal id to progress entry
        const pMap = {};
        progressList.forEach((p) => {
          pMap[p.goal_id._id] = p;
        });
        setProgressMap(pMap);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setError("Failed to load goals and progress. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------------------- Goal Handlers --------------------- //

  // Create Goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newGoalDescription.trim()) return;
    try {
      const { goal } = await apiFetch(`/api/goals`, {
        method: "POST",
        body: JSON.stringify({ description: newGoalDescription }),
      });
      setGoals([goal, ...goals]);
      setNewGoalDescription("");
      setSuccess("Goal created successfully!");
    } catch (err) {
      console.error("Goal creation failed:", err.message);
      setError("Failed to create goal. Please try again.");
    }
  };

  // Edit Goal - save updates (description and status)
  const handleUpdateGoal = async (goalId) => {
    setError("");
    setSuccess("");
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
      setSuccess("Goal updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.message);
      setError("Failed to update goal. Please try again.");
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId) => {
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/api/goals/${goalId}`, { method: "DELETE" });
      setGoals(goals.filter((g) => g._id !== goalId));
      setSuccess("Goal deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err.message);
      setError("Failed to delete goal. Please try again.");
    }
  };

  // --------------------- Progress Handlers --------------------- //

  // Create new progress entry for a goal
  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { goal_id, progress_percentage, milestones, notes } = progressForm;
    if (!goal_id) return;
    // Convert comma-separated milestones to array
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
      // Reset form state for that goal
      setProgressForm({ goal_id: "", progress_percentage: 0, milestones: "", notes: "" });
      setSuccess("Progress submitted successfully!");
    } catch (err) {
      console.error("Progress submission failed:", err.message);
      setError("Failed to submit progress. Please try again.");
    }
  };

  // Begin editing an existing progress entry for a goal
  const handleEditProgress = (goal) => {
    const existingProgress = progressMap[goal._id];
    if (!existingProgress) return;
    setEditingProgressId(goal._id);
    // Convert milestones array to comma-separated string
    const milestonesStr = existingProgress.milestones
      ? existingProgress.milestones.join(", ")
      : "";
    setEditingProgressForm({
      progress_percentage: existingProgress.progress_percentage,
      milestones: milestonesStr,
      notes: existingProgress.notes || "",
    });
  };

  // Cancel editing progress
  const handleCancelEditProgress = () => {
    setEditingProgressId(null);
    setEditingProgressForm({ progress_percentage: 0, milestones: "", notes: "" });
  };

  // Update existing progress entry
  const handleUpdateProgress = async (goal) => {
    setError("");
    setSuccess("");
    const existingProgress = progressMap[goal._id];
    if (!existingProgress) return;
    const milestonesArray = editingProgressForm.milestones
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    try {
      const updatedProgress = await apiFetch(`/api/progress/${existingProgress._id}`, {
        method: "PUT",
        body: JSON.stringify({
          progress_percentage: editingProgressForm.progress_percentage,
          milestones: milestonesArray,
          notes: editingProgressForm.notes,
        }),
      });
      setProgressMap({ ...progressMap, [goal._id]: updatedProgress.progress });
      setEditingProgressId(null);
      setEditingProgressForm({ progress_percentage: 0, milestones: "", notes: "" });
      setSuccess("Progress updated successfully!");
    } catch (err) {
      console.error("Progress update failed:", err.message);
      setError("Failed to update progress. Please try again.");
    }
  };

  // Delete an existing progress entry
  const handleDeleteProgress = async (goal) => {
    setError("");
    setSuccess("");
    const existingProgress = progressMap[goal._id];
    if (!existingProgress) return;
    try {
      await apiFetch(`/api/progress/${existingProgress._id}`, {
        method: "DELETE",
      });
      // Remove progress from our map
      const newMap = { ...progressMap };
      delete newMap[goal._id];
      setProgressMap(newMap);
      setSuccess("Progress deleted successfully!");
    } catch (err) {
      console.error("Progress deletion failed:", err.message);
      setError("Failed to delete progress. Please try again.");
    }
  };

  // --------------------- Rendering Helpers --------------------- //

  const renderGoalCard = (goal) => {
    const prog = progressMap[goal._id];
    return (
      <li key={goal._id} className="p-4 border rounded-lg shadow bg-white space-y-4">
        {/* Goal editing area */}
        {editGoalId === goal._id ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editGoalDescription}
              onChange={(e) => setEditGoalDescription(e.target.value)}
              placeholder="Edit goal description"
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

        {/* Progress Section */}
        {prog ? (
          <div className="mt-4">
            {editingProgressId === goal._id ? (
              // Edit Progress Form
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
                    style={{ width: `${prog.progress_percentage}%` }}
                  />
                </div>
                <div className="text-sm">
                  {prog.progress_percentage}% completed
                </div>
                {prog.milestones && prog.milestones.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <strong>Milestones:</strong> {prog.milestones.join(", ")}
                  </div>
                )}
                {prog.notes && (
                  <div className="text-xs text-gray-500">{prog.notes}</div>
                )}
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
          // Create Progress form (if no progress exists for this goal)
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

        {/* Feedback messages */}
        {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="p-2 bg-green-100 text-green-700 rounded">{success}</div>}

        {/* Create new goal */}
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
          <p className="text-center text-gray-500">Loading goals...</p>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-600">No goals yet. Start by adding one!</p>
        ) : (
          <ul className="space-y-4">{goals.map(renderGoalCard)}</ul>
        )}
      </div>
    </Layout>
  );
}
