import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";

// A small helper to fetch with admin auth
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const finalOptions = { ...options, headers };
  const response = await fetch(url, finalOptions);
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Fetch error (${response.status}): ${msg}`);
  }
  return response.json();
}

// Helper to pick a random image URL for a given category
function getRandomCategoryImage(category) {
  if (category) {
      // Convert category name to lowercase, replace spaces & special chars with hyphens
    const formattedCategory = category
      .toLowerCase()
      .replace(/&/g, "and") // Convert '&' to 'and'
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with '-'
      .replace(/-+/g, "-") // Remove multiple dashes
      .replace(/^-|-$/g, ""); // Trim leading/trailing dashes
  
    // Generate a random number (adjust the max range based on available images per category)
    const randomIndex = Math.floor(Math.random() * 3) + 1; // Assuming 3 images per category
  
    return `/category_images/${formattedCategory}-${randomIndex}.jpg`;
  }
  // fallback if category is unknown
  return "https://placehold.co/300x200?text=Content";
}

export default function ContentLibrary() {
  // Stats
  const [totalContent, setTotalContent] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  const [recentContent, setRecentContent] = useState([]);

  // Distinct categories from the backend
  const [categories, setCategories] = useState([]);
  // For filtering
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Content items
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create & Update forms
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    category: "",
    url: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    title: "",
    description: "",
    category: "",
    url: "",
  });

  // Search & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6); // number of items (cards) per page
  const [totalCount, setTotalCount] = useState(0);

  // --------------------------------------------------------------
  // 1) Fetch Stats: total content, top categories, recent content
  // --------------------------------------------------------------
  const fetchStats = async () => {
    try {
      const totalRes = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/total`
      );
      setTotalContent(totalRes.totalContent || 0);

      const popRes = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/popular-categories`
      );
      setTopCategories(popRes.topCategories || []);

      const recentRes = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/recent`
      );
      setRecentContent(recentRes.recentContent || []);
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  // --------------------------------------------------------------
  // 2) Fetch Distinct Categories
  // --------------------------------------------------------------
  const fetchCategories = async () => {
    try {
      // We assume you've created an endpoint: GET /api/admin/content/categories
      const data = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/categories`
      );
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Categories error:", error);
    }
  };

  // --------------------------------------------------------------
  // 3) Fetch Content w/ pagination, search, category
  // --------------------------------------------------------------
  const fetchContent = async () => {
    setLoading(true);
    try {
      // if there's a search query => /search
      if (searchQuery.trim()) {
        const sr = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/search?q=${encodeURIComponent(
            searchQuery
          )}`
        );
        let items = sr.results || [];
        // filter by category if not "All"
        if (selectedCategory !== "All") {
          items = items.filter((i) => i.category === selectedCategory);
        }
        // client-side pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        setContentItems(items.slice(start, end));
        setTotalCount(items.length);
      }
      // if no search but category != All => /category/:cat
      else if (selectedCategory !== "All") {
        const cr = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/category/${selectedCategory}?limit=${limit}&page=${page}`
        );
        setContentItems(cr.content || []);
        setTotalCount(page * (cr.count || 0));
      }
      // otherwise => all content
      else {
        const ar = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content?limit=${limit}&page=${page}`
        );
        setContentItems(ar.content || []);
        setTotalCount(page * (ar.count || 0));
      }
    } catch (error) {
      console.error("Content fetch error:", error);
    }
    setLoading(false);
  };

  // --------------------------------------------------------------
  // 4) Create Content
  // --------------------------------------------------------------
  const handleAddContent = async () => {
    if (
      !newContent.title ||
      !newContent.description ||
      !newContent.category ||
      !newContent.url
    ) {
      alert("Please fill all fields.");
      return;
    }
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content`, {
        method: "POST",
        body: JSON.stringify(newContent),
      });
      // clear form
      setNewContent({ title: "", description: "", category: "", url: "" });
      setPage(1);
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error("Add content error:", error);
      alert("Failed to add content. Check console.");
    }
  };

  // --------------------------------------------------------------
  // 5) Editing/Updating Content
  // --------------------------------------------------------------
  const startEditing = (item) => {
    setEditingId(item._id);
    setEditingData({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      url: item.url || "",
    });
  };

  const handleUpdateContent = async () => {
    if (
      !editingData.title ||
      !editingData.description ||
      !editingData.category ||
      !editingData.url
    ) {
      alert("All fields are required for update.");
      return;
    }
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${editingId}`,
        {
          method: "PUT",
          body: JSON.stringify(editingData),
        }
      );
      setEditingId(null);
      setEditingData({ title: "", description: "", category: "", url: "" });
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error("Update content error:", error);
      alert("Failed to update content. Check console.");
    }
  };

  // --------------------------------------------------------------
  // 6) Delete Content
  // --------------------------------------------------------------
  const handleDeleteContent = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${id}`,
        { method: "DELETE" }
      );
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error("Delete content error:", error);
      alert("Failed to delete content. Check console.");
    }
  };

  // --------------------------------------------------------------
  // 7) Pagination Controls
  // --------------------------------------------------------------
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  // --------------------------------------------------------------
  // useEffect
  // --------------------------------------------------------------
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, selectedCategory, searchQuery]);

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
  return (
    <AdminLayout>
      <div className="p-4 space-y-8">
        {/* Stats & Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Content */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">Total Content Items</h2>
            <p className="text-3xl font-semibold">{totalContent}</p>
          </div>

          {/* Top Categories */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">Popular Categories</h2>
            <div className="flex flex-col space-y-2">
              {topCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="border border-gray-200 p-2 rounded flex items-center gap-2"
                >
                  <Image
                    src={getRandomCategoryImage(cat._id)}
                    alt={cat._id}
                    width={64}
                    height={64} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{cat._id}</h3>
                    <p className="text-sm">Count: {cat.count}</p>
                  </div>
                </div>
              ))}
              {topCategories.length === 0 && <p>No categories yet.</p>}
            </div>
          </div>

          {/* Recently Added */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">Recently Added</h2>
            {recentContent.length ? (
              recentContent.map((rc) => (
                <div key={rc._id} className="text-sm">
                  • {rc.title}
                </div>
              ))
            ) : (
              <p className="text-sm">No recent content found.</p>
            )}
          </div>
        </div>

        {/* Add Content Form */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="font-semibold text-xl">Add New Content</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Title"
              className="border p-2 flex-1"
              value={newContent.title}
              onChange={(e) =>
                setNewContent({ ...newContent, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Description"
              className="border p-2 flex-1"
              value={newContent.description}
              onChange={(e) =>
                setNewContent({ ...newContent, description: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <select
              className="border p-2 flex-1"
              value={newContent.category}
              onChange={(e) =>
                setNewContent({ ...newContent, category: e.target.value })
              }
            >
              <option value="">-- Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="URL (link or reference)"
              className="border p-2 flex-1"
              value={newContent.url}
              onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
            />
          </div>
          <button
            onClick={handleAddContent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Content
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <h2 className="font-semibold text-xl">Search & Filter</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Search by title/description..."
              className="border p-2 flex-1"
              value={searchQuery}
              onChange={(e) => {
                setPage(1);
                setSearchQuery(e.target.value);
              }}
            />
            <select
              className="border p-2"
              value={selectedCategory}
              onChange={(e) => {
                setPage(1);
                setSelectedCategory(e.target.value);
              }}
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Items (Displayed as Cards) */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-xl mb-4">Manage Content</h2>
          {loading ? (
            <p>Loading content...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {contentItems.map((item) => {
                const isEditing = editingId === item._id;
                if (isEditing) {
                  // Editing form
                  return (
                    <div key={item._id} className="border rounded p-3 flex flex-col">
                      <input
                        type="text"
                        className="border p-1 mb-2"
                        value={editingData.title}
                        onChange={(e) =>
                          setEditingData({ ...editingData, title: e.target.value })
                        }
                        placeholder="Title"
                      />
                      <textarea
                        className="border p-1 mb-2"
                        value={editingData.description}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                      />
                      <select
                        className="border p-1 mb-2"
                        value={editingData.category}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            category: e.target.value,
                          })
                        }
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="border p-1 mb-2"
                        value={editingData.url}
                        onChange={(e) =>
                          setEditingData({ ...editingData, url: e.target.value })
                        }
                        placeholder="URL"
                      />
                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={handleUpdateContent}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingData({
                              title: "",
                              description: "",
                              category: "",
                              url: "",
                            });
                          }}
                          className="bg-gray-400 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  // Normal card display
                  const imgUrl = getRandomCategoryImage(item.category);
                  return (
                    <div
                      key={item._id}
                      className="border rounded p-3 flex flex-col"
                    >
                      <Image
                        src={imgUrl}
                        alt={item.category}
                        width={300}
                        height={160}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm mb-2 text-gray-700">
                        {item.description}
                      </p>
                      <p className="text-xs mb-1 text-gray-500 font-semibold">
                        Category: {item.category}
                      </p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Visit Link
                        </a>
                      )}
                      <div className="mt-auto flex gap-2 pt-2">
                        <button
                          onClick={() => startEditing(item)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContent(item._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
              {contentItems.length === 0 && !loading && (
                <div className="col-span-full text-center text-gray-600">
                  No content found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white p-4 rounded shadow flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-2 sm:mb-0">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className={`mr-2 px-3 py-1 rounded ${
                page === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Prev
            </button>
            <button
              onClick={nextPage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Next
            </button>
          </div>
          <div className="text-sm mb-2 sm:mb-0">
            Page: {page} | Showing {contentItems.length} of {totalCount} (approx)
          </div>
          <div>
            <select
              className="border p-1"
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
            >
              <option value={6}>6 / page</option>
              <option value={9}>9 / page</option>
              <option value={12}>12 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
