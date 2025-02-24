import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback`);
      setFeedback(data.feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
    setLoading(false);
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await axios.delete(`/api/feedback/${id}`);
      fetchFeedback();
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Feedback</h1>

        {loading ? (
          <p>Loading feedback...</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">User</th>
                <th className="border p-2">Content</th>
                <th className="border p-2">Rating</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item._id}>
                  <td className="border p-2">{item.user_id?.first_name} {item.user_id?.last_name}</td>
                  <td className="border p-2">{item.content}</td>
                  <td className="border p-2">{item.rating}/5</td>
                  <td className="border p-2">
                    <button onClick={() => handleDeleteFeedback(item._id)} className="bg-red-500 text-white px-3 py-1">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;
