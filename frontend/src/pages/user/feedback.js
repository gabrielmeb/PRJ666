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

  // For updating
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    const t = localStorage.getItem("userToken");
    const u = localStorage.getItem("userId");
    if (t && u) {
      setToken(t);
      setUserId(u);
    }
  }, []);

  // Get your feedback
  useEffect(() => {
    if (!token || !userId) return;
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/feedback/user/${userId}`, {
          method: "GET",
        });
        // If data is an array, set it directly; otherwise, default to an empty array.
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        // Handle error: if the error message indicates no feedback found,
        // set feedbacks to an empty array.
        if (
          err.message.includes("404") ||
          err.message.includes("No feedback found for this user")
        ) {
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
      // Assumes data.feedback is the newly created feedback item.
      setFeedbacks((prev) => [data.feedback, ...prev]);
      setContent("");
      setRating(5);
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  const startEdit = (fb) => {
    setEditId(fb._id);
    setEditContent(fb.content);
    setEditRating(fb.rating);
  };

  // Update feedback
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
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Feedback</h1>
        {loading && <p>Loading feedback...</p>}

        {/* Show a friendly message if there's no feedback */}
        {!loading && feedbacks.length === 0 && (
          <p className="text-sm text-gray-600">
            No feedback available. Please submit your feedback.
          </p>
        )}

        {/* Submit new feedback */}
        <form onSubmit={handleSubmitFeedback} className="mb-4 space-y-2">
          <textarea
            placeholder="Enter your feedback"
            className="border p-2 w-full"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="number"
            min={1}
            max={10}
            className="border p-2 w-full"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
            Submit Feedback
          </button>
        </form>

        <ul className="space-y-2">
          {feedbacks.map((fb) => (
            <li key={fb._id} className="border p-2 rounded">
              {editId === fb._id ? (
                <div className="space-y-2">
                  <textarea
                    className="border p-2 w-full"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="border p-2 w-full"
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                  />
                  <button
                    onClick={() => handleUpdateFeedback(fb._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p>{fb.content}</p>
                    <p className="text-sm">Rating: {fb.rating}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEdit(fb)}
                      className="bg-gray-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(fb._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Del
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
