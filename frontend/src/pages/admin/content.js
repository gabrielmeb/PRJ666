import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";

// A helper function to perform fetch with authorization
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

/**
 * A component that shows text truncated to a given number of lines.
 * When "Show More" is clicked, the container's maxHeight is removed so the
 * full text is displayed, expanding the card.
 */
function TruncatedText({ text, lines = 4 }) {
  const [expanded, setExpanded] = useState(false);
  // Calculate approximate line height (1.5em assumed) multiplied by the number of lines
  const collapsedHeight = `calc(1.5em * ${lines})`;

  return (
    <div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? "none" : collapsedHeight }}
      >
        <p className="text-sm text-gray-700">{text}</p>
      </div>
      {text && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-blue-600 hover:underline text-xs"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

/**
 * Returns a local image path based on the category.
 * The category name is converted to a slug and a random number from 1 to 3 is added.
 */
function getRandomCategoryImage(category) {
  if (category) {
    const formattedCategory = category
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const randomIndex = Math.floor(Math.random() * 3) + 1;
    return `/category_images/${formattedCategory}-${randomIndex}.jpg`;
  }
  return "https://placehold.co/300x200?text=Content";
}

export default function ContentLibrary() {
  // Stats
  const [totalContent, setTotalContent] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  const [recentContent, setRecentContent] = useState([]);

  // Distinct categories (from backend)
  const [categories, setCategories] = useState([]);
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

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // Error message display
  const [errorMessage, setErrorMessage] = useState("");

  // ----------------------------------------------------
  // Debounce search input
  // ----------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
      setPage(1); // reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ----------------------------------------------------
  // 1) Fetch Stats: Total, Popular, Recent
  // ----------------------------------------------------
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
      setErrorMessage(error.message);
    }
  };

  // ----------------------------------------------------
  // 2) Fetch Categories
  // ----------------------------------------------------
  const fetchCategories = async () => {
    try {
      const data = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/categories`
      );
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Categories error:", error);
      setErrorMessage(error.message);
    }
  };

  // ----------------------------------------------------
  // 3) Fetch Content with Pagination, Search & Filter
  // ----------------------------------------------------
  const fetchContent = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      if (searchQuery.trim()) {
        const sr = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/search?q=${encodeURIComponent(
            searchQuery
          )}`
        );
        let items = sr.results || [];
        if (selectedCategory !== "All") {
          items = items.filter((i) => i.category === selectedCategory);
        }
        const start = (page - 1) * limit;
        const end = start + limit;
        setContentItems(items.slice(start, end));
        setTotalCount(items.length);
      } else if (selectedCategory !== "All") {
        const cr = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/category/${selectedCategory}?limit=${limit}&page=${page}`
        );
        setContentItems(cr.content || []);
        setTotalCount(page * (cr.count || 0));
      } else {
        const ar = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content?limit=${limit}&page=${page}`
        );
        setContentItems(ar.content || []);
        setTotalCount(page * (ar.count || 0));
      }
    } catch (error) {
      console.error("Content fetch error:", error);
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  // ----------------------------------------------------
  // 4) Create New Content
  // ----------------------------------------------------
  const handleAddContent = async () => {
    setErrorMessage("");
    const { title, description, category, url } = newContent;
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedCategory || !trimmedUrl) {
      alert("All fields are required.");
      return;
    }

    if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      alert("Title must be between 3 and 200 characters.");
      return;
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 1000) {
      alert("Description must be between 10 and 1000 characters.");
      return;
    }

    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    if (!urlPattern.test(trimmedUrl)) {
      alert("Invalid URL format. Must start with http:// or https://");
      return;
    }

    const validContent = {
      title: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory,
      url: trimmedUrl,
    };

    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content`, {
        method: "POST",
        body: JSON.stringify(validContent),
      });
      setNewContent({ title: "", description: "", category: "", url: "" });
      setPage(1);
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error("Add content error:", error);
      setErrorMessage(error.message);
      alert("Failed to add content. Please check the console for details.");
    }
  };

  // ----------------------------------------------------
  // 5) Edit / Update Content
  // ----------------------------------------------------
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
    setErrorMessage("");
    const { title, description, category, url } = editingData;
    if (!title.trim() || !description.trim() || !category.trim() || !url.trim()) {
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
      setErrorMessage(error.message);
      alert("Failed to update content. Check console.");
    }
  };

  // ----------------------------------------------------
  // 6) Delete Content
  // ----------------------------------------------------
  const handleDeleteContent = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setErrorMessage("");
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${id}`,
        { method: "DELETE" }
      );
      fetchContent();
      fetchStats();
    } catch (error) {
      console.error("Delete content error:", error);
      setErrorMessage(error.message);
      alert("Failed to delete content. Check console.");
    }
  };

  // ----------------------------------------------------
  // 7) Pagination Controls
  // ----------------------------------------------------
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  // ----------------------------------------------------
  // useEffect: Initial Fetches and re-fetch on dependency changes
  // ----------------------------------------------------
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [searchQuery, selectedCategory, page, limit]);

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  return (
    <AdminLayout>
      <div className="p-4 space-y-6">
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Stats & Summaries */}
        <div className="flex flex-row space-x-4">
          {/* Total Content */}
          <div className="bg-white p-4 rounded shadow flex-1">
            <h2 className="font-bold text-lg mb-2">Total Content Items</h2>
            <p className="text-3xl font-semibold">{totalContent}</p>
          </div>
          {/* Recently Added */}
          <div className="bg-white p-4 rounded shadow flex-1">
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
              onChange={(e) =>
                setNewContent({ ...newContent, url: e.target.value })
              }
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Content Items (Cards) */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-xl mb-4">Manage Content</h2>
          {loading ? (
            <p>Loading content...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {contentItems.map((item) => {
                const isEditing = editingId === item._id;
                if (isEditing) {
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
                      <h3 className="font-bold mb-1">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>

                      <TruncatedText text={item.description} lines={4} />
                      <p className="text-xs mt-1 mb-1 text-gray-500 font-semibold">
                        Category: {item.category}
                      </p>
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

        {/* Pagination Controls */}
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