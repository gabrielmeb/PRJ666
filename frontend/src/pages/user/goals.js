// src/pages/user/goals.js
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function GoalsPage() {
  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [goals, setGoals] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState(null);

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

      // 3. Fetch progress (treat 404 as "no progress")
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
    setError(""); 
    setSuccess("");
    
    // Validate goal description length
    if (!newGoalDescription.trim()) {
      setError("Please enter a goal description.");
      return;
    }
    
    if (newGoalDescription.trim().length < 5) {
      setError("Goal description must be at least 5 characters long.");
      return;
    }
    
    try {
      const { goal } = await apiFetch(`/api/goals`, {
        method: "POST",
        body: JSON.stringify({ description: newGoalDescription }),
      });
      setGoals([goal, ...goals]);
      setNewGoalDescription("");
      setSuccess("Goal created successfully!");
    } catch (err) {
      // Handle specific API errors
      if (err.message && err.message.includes("length")) {
        setError("Goal description must be at least 5 characters long.");
      } else {
        handleError(err, "Failed to create goal. Please try again.");
      }
    }
  };

  const handleUpdateGoal = async (goalId) => {
    setError(""); 
    setSuccess("");
    
    // Validate goal description length
    if (!editGoalDescription.trim()) {
      setError("Goal description cannot be empty.");
      return;
    }
    
    if (editGoalDescription.trim().length < 5) {
      setError("Goal description must be at least 5 characters long.");
      return;
    }
    
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
      // Handle specific API errors
      if (err.message && err.message.includes("length")) {
        setError("Goal description must be at least 5 characters long.");
      } else {
        handleError(err, "Failed to update goal. Please try again.");
      }
    }
  };

  const handleDeleteGoal = async (goalId) => {
    setError(""); setSuccess("");
    try {
      await apiFetch(`/api/goals/${goalId}`, { method: "DELETE" });
      setGoals(goals.filter((g) => g._id !== goalId));
      setSuccess("Goal deleted successfully!");
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
      setSuccess("Progress recorded successfully!");
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
      setSuccess("Progress updated successfully!");
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
      setSuccess("Progress deleted successfully!");
    } catch (err) {
      handleError(err, "Failed to delete progress. Please try again.");
    }
  };

  // --------------------- Render --------------------- //
  
  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-800 text-green-100";
      case "In Progress": return "bg-blue-800 text-blue-100";
      default: return "bg-gray-800 text-gray-100";
    }
  };

  const renderGoalCard = (goal) => {
    const p = progressMap[goal._id];
    const isExpanded = expandedGoal === goal._id;
    const statusColor = getStatusColor(goal.status);
    
    return (
      <li key={goal._id} className="overflow-hidden bg-zinc-800 rounded-lg border border-gray-700 transition-all hover:shadow-md">
        {/* Goal header */}
        <div 
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setExpandedGoal(isExpanded ? null : goal._id)}
        >
          <div className="flex items-center space-x-4">
            {isExpanded ? 
              <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : 
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            }
            <div>
              <h2 className="text-lg font-medium text-white">{goal.description}</h2>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                  {goal.status}
                </span>
                {p && (
                  <span className="ml-2 text-sm text-gray-400">
                    {p.progress_percentage}% complete
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditGoalId(goal._id);
                setEditGoalDescription(goal.description);
                setEditGoalStatus(goal.status);
                setExpandedGoal(goal._id);
              }}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to delete this goal?")) {
                  handleDeleteGoal(goal._id);
                }
              }}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Expandable content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-700">
            {/* Goal edit form */}
            {editGoalId === goal._id ? (
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Goal Description
                  </label>
                  <input
                    type="text"
                    value={editGoalDescription}
                    onChange={(e) => setEditGoalDescription(e.target.value)}
                    placeholder="Edit description"
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">Minimum 5 characters required</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editGoalStatus}
                    onChange={(e) => setEditGoalStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => handleUpdateGoal(goal._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditGoalId(null);
                      setEditGoalDescription("");
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4">
                {/* Progress section */}
                {p ? (
                  <div className="space-y-4">
                    {editingProgressId === goal._id ? (
                      <div className="space-y-3">
                        <h3 className="font-medium text-white">Update Progress</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Progress Percentage
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingProgressForm.progress_percentage}
                            onChange={(e) =>
                              setEditingProgressForm((prev) => ({
                                ...prev,
                                progress_percentage: Number(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Milestones
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Research, Planning, Implementation"
                            value={editingProgressForm.milestones}
                            onChange={(e) =>
                              setEditingProgressForm((prev) => ({
                                ...prev,
                                milestones: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-400">Separate milestones with commas</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Notes
                          </label>
                          <textarea
                            placeholder="Any additional context or information"
                            value={editingProgressForm.notes}
                            onChange={(e) =>
                              setEditingProgressForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleUpdateProgress(goal)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                          >
                            Save Progress
                          </button>
                          <button
                            onClick={handleCancelEditProgress}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-300 mb-2">Progress</h3>
                          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${p.progress_percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm font-medium text-blue-400">{p.progress_percentage}% completed</span>
                            {p.progress_percentage === 100 && (
                              <span className="text-sm font-medium text-green-400">Complete!</span>
                            )}
                          </div>
                        </div>

                        {p.milestones.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Milestones</h4>
                            <ul className="mt-1 space-y-1">
                              {p.milestones.map((m, i) => (
                                <li key={i} className="text-sm text-gray-400 flex items-center">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                                  {m.title || m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {p.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300">Notes</h4>
                            <p className="mt-1 text-sm text-gray-400 whitespace-pre-line">{p.notes}</p>
                          </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleEditProgress(goal)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                          >
                            Update Progress
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this progress?")) {
                                handleDeleteProgress(goal);
                              }
                            }}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
                          >
                            Delete Progress
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleProgressSubmit} className="space-y-3">
                    <h3 className="font-medium text-white">Track Your Progress</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Progress Percentage
                      </label>
                      <input
                        type="number"
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
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Milestones
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Research, Planning, Implementation"
                        value={progressForm.goal_id === goal._id ? progressForm.milestones : ""}
                        onChange={(e) =>
                          setProgressForm((prev) => ({
                            ...prev,
                            goal_id: goal._id,
                            milestones: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-400">Separate milestones with commas</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        placeholder="Any additional context or information"
                        value={progressForm.goal_id === goal._id ? progressForm.notes : ""}
                        onChange={(e) =>
                          setProgressForm((prev) => ({
                            ...prev,
                            goal_id: goal._id,
                            notes: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                      >
                        Record Progress
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Your Goals & Progress</h1>
          <p className="text-lg text-gray-400">Track, monitor, and achieve your personal goals</p>
        </div>

        {/* Notification area */}
        {error && (
          <div className="p-4 bg-red-800 text-red-200 border border-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-800 text-green-200 border border-green-600 rounded-lg">
            {success}
          </div>
        )}

        {/* New goal form */}
        <section className="bg-zinc-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Create a New Goal</h2>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="What do you want to achieve?"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">Minimum 5 characters required</p>
            </div>
            <div>
              <button 
                type="submit" 
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow"
              >
                <PlusIcon size={18} />
                Add Goal
              </button>
            </div>
          </form>
        </section>

        {/* Goals list */}
        {loading ? (
          <div className="flex items-center gap-2 text-gray-300 text-xl font-medium">
            <Loader2 className="animate-spin" />
            Loading your goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800 rounded-xl border border-gray-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            <h3 className="mt-4 text-xl font-bold text-white">No goals yet</h3>
            <p className="mt-1 text-gray-400">Create your first goal to start tracking your progress.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {goals.map(renderGoalCard)}
          </ul>
        )}
      </div>
    </Layout>
  );
}