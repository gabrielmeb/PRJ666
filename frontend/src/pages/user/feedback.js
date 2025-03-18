import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";

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

  // get your feedback
  useEffect(() => {
    if (!token || !userId) return;
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data);
        } else if (res.status === 404) {
          setFeedbacks([]);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchFeedback();
  }, [token, userId]);

  // submit new feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const body = { content, rating: Number(rating) };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        // data.feedback is new feedback
        setFeedbacks((prev) => [data.feedback, ...prev]);
        setContent("");
        setRating(5);
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (fb) => {
    setEditId(fb._id);
    setEditContent(fb.content);
    setEditRating(fb.rating);
  };

  // update
  const handleUpdateFeedback = async (feedbackId) => {
    try {
      const body = { content: editContent, rating: Number(editRating) };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${feedbackId}`,
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
        setFeedbacks((prev) =>
          prev.map((fb) => (fb._id === feedbackId ? data.feedback : fb))
        );
        setEditId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // delete
  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${feedbackId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((fb) => fb._id !== feedbackId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      {loading && <p>Loading feedback...</p>}

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
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="border p-2 w-full"
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
