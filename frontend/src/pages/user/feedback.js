// feedback.js
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";

export default function FeedbackPage() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  // For updating feedback
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // Fetch user’s existing feedback
  useEffect(() => {
    if (!token || !userId) return;
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/feedback/user/${userId}`, {
          method: "GET",
        });
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.message.includes("No feedback found")) {
          setFeedbacks([]);
        } else {
          console.error("Error fetching feedback:", err);
        }
      }
      setLoading(false);
    };
    fetchFeedback();
  }, [token, userId]);

  // Submit new feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const body = { content, rating: Number(rating) };
      const data = await apiFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setFeedbacks((prev) => [data.feedback, ...prev]);
      setContent("");
      setRating(5);
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  // Start editing
  const startEdit = (fb) => {
    setEditId(fb._id);
    setEditContent(fb.content);
    setEditRating(fb.rating);
  };

  // Save edited feedback
  const handleUpdateFeedback = async (feedbackId) => {
    try {
      const body = { content: editContent, rating: Number(editRating) };
      const data = await apiFetch(`/api/feedback/${feedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === feedbackId ? data.feedback : fb))
      );
      setEditId(null);
    } catch (err) {
      console.error("Failed to update feedback", err);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await apiFetch(`/api/feedback/${feedbackId}`, { method: "DELETE" });
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== feedbackId));
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Feedback</h1>

        {/* Form to submit new feedback */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Leave New Feedback</h2>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Feedback</label>
              <textarea
                className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:border-blue-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience..."
                required
                minLength={10}
                maxLength={1000}
              />
            </div>

            <div>
            <label className="block font-semibold mb-1">Rating (1–5)</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full max-w-sm"
            />
            <p className="text-start text-sm mt-1">
              Selected rating: <span className="font-bold">{rating}</span>
            </p>
          </div>


            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Display user’s existing feedback */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Your Feedback</h2>
          {loading && <p>Loading your feedback...</p>}

          {!loading && feedbacks.length === 0 && (
            <p className="text-gray-500">No feedback yet.</p>
          )}

          <ul className="space-y-4">
            {feedbacks.map((fb) => (
              <li key={fb._id} className="border border-gray-200 p-4 rounded">
                {editId === fb._id ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Edit Content
                      </label>
                      <textarea
                        className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:border-blue-500"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        minLength={10}
                        maxLength={1000}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Rating (1–5)
                      </label>
                      <select
                        className="border border-gray-300 rounded p-2 w-20 focus:outline-none focus:border-blue-500"
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleUpdateFeedback(fb._id)}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="ml-2 bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-2 md:mb-0">
                      <p className="text-base text-gray-700">{fb.content}</p>
                      <p className="text-sm text-gray-500">Rating: {fb.rating}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(fb)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(fb._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
      </div>
    </Layout>
  );
}
