import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const ContentLibrary = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    category: "",
    url: "",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/content`);
      setContent(data.content);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
    setLoading(false);
  };

  const handleAddContent = async () => {
    if (!newContent.title || !newContent.description || !newContent.url) return;
    try {
      await axios.post("/api/content", newContent);
      setNewContent({ title: "", description: "", category: "", url: "" });
      fetchContent();
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };

  const handleDeleteContent = async (id) => {
    try {
      await axios.delete(`/api/content/${id}`);
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Content Library Management</h1>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 w-1/4"
            value={newContent.title}
            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-1/4"
            value={newContent.description}
            onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            className="border p-2 w-1/4"
            value={newContent.category}
            onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="URL"
            className="border p-2 w-1/4"
            value={newContent.url}
            onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
          />
          <button onClick={handleAddContent} className="bg-blue-500 text-white px-4 py-2">Add</button>
        </div>

        {loading ? (
          <p>Loading content...</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Title</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item._id}>
                  <td className="border p-2">{item.title}</td>
                  <td className="border p-2">{item.category}</td>
                  <td className="border p-2">
                    <button onClick={() => handleDeleteContent(item._id)} className="bg-red-500 text-white px-3 py-1">Delete</button>
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

export default ContentLibrary;
