import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function GoalsPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // For creating/updating
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalDescription, setEditGoalDescription] = useState("");

  // 1) Grab token + userId on mount
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // 2) Fetch user goals when token and userId are available
  useEffect(() => {
    if (!token || !userId) return;
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/goals/user/${userId}`, { method: "GET" });
        setGoals(data);
      } catch (err) {
        if (err.message.includes("404")) {
          // No goals found for the user
          setGoals([]);
        } else {
          console.error(err);
        }
      }
      setLoading(false);
    };
    fetchGoals();
  }, [token, userId]);

  // Create a new goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalDescription) return;
    try {
      const response = await apiFetch(`/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newGoalDescription }),
      });
      // Assuming response has a "goal" property
      const { goal } = response;
      setGoals((prev) => [goal, ...prev]); // add new goal to top
      setNewGoalDescription("");
    } catch (err) {
      console.error("Failed to create goal", err);
    }
  };

  // Begin editing a goal
  const startEdit = (goal) => {
    setEditGoalId(goal._id);
    setEditGoalDescription(goal.description);
  };

  // Save changes to an existing goal
  const handleUpdateGoal = async (goalId) => {
    try {
      const response = await apiFetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Pending",
          progress: [],
          description: editGoalDescription,
        }),
      });
      const { goal: updatedGoal } = response;
      setGoals((prev) =>
        prev.map((g) => (g._id === goalId ? updatedGoal : g))
      );
      setEditGoalId(null);
      setEditGoalDescription("");
    } catch (err) {
      console.error("Failed to update goal", err);
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    try {
      await apiFetch(`/api/goals/${goalId}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g._id !== goalId));
    } catch (err) {
      console.error("Failed to delete goal", err);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Goals</h1>
        {loading && <p>Loading...</p>}

        {/* Create new goal form */}
        <form onSubmit={handleCreateGoal} className="flex mb-4 space-x-2">
          <input
            type="text"
            value={newGoalDescription}
            onChange={(e) => setNewGoalDescription(e.target.value)}
            placeholder="New goal description..."
            className="border p-2 flex-grow"
          />
          <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
            Create
          </button>
        </form>

        {/* Goals list */}
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li
              key={goal._id}
              className="border p-2 rounded flex items-center justify-between"
            >
              {editGoalId === goal._id ? (
                <>
                  <input
                    type="text"
                    value={editGoalDescription}
                    onChange={(e) => setEditGoalDescription(e.target.value)}
                    className="border p-2 flex-grow"
                  />
                  <button
                    onClick={() => handleUpdateGoal(goal._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded ml-2"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span>{goal.description}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEdit(goal)}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Del
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
