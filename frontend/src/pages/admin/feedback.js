import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback`);
      setFeedback(data.feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError("Failed to load feedback. Please try again.");
    }
    setLoading(false);
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`);
      setSuccess("Feedback deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      fetchFeedback();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      setError("Failed to delete feedback");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        <h1 className="text-2xl font-bold text-white mb-2">User Feedback</h1>
        <p className="text-gray-400 mb-6">View and manage user feedback submissions</p>

        {/* Notifications */}
        {error && (
          <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 border border-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900 text-green-100 p-3 rounded-md mb-4 border border-green-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="p-3 text-left text-gray-400 font-medium">User</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Content</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Rating</th>
                    <th className="p-3 text-left text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.length > 0 ? (
                    feedback.map((item) => (
                      <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="p-3 text-white">
                          {item.user_id?.first_name} {item.user_id?.last_name}
                        </td>
                        <td className="p-3 text-gray-300">{item.content}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">{item.rating}/5</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => handleDeleteFeedback(item._id)} 
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-6 text-center">
                        <div className="text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-300">No feedback found</h3>
                          <p className="mt-1 text-sm">No user feedback has been submitted yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;