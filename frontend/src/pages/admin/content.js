import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";

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

function TruncatedText({ text, lines = 4 }) {
  const [expanded, setExpanded] = useState(false);
  const collapsedHeight = `calc(1.5em * ${lines})`;

  return (
    <div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? "none" : collapsedHeight }}
      >
        <p className="text-sm text-gray-300">{text}</p>
      </div>
      {text && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-purple-400 hover:text-purple-300 text-xs font-medium"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

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
  // State management
  const [stats, setStats] = useState({
    total: 0,
    topCategories: [],
    recentContent: []
  });
  const [categories, setCategories] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    url: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notifications, setNotifications] = useState({
    error: "",
    success: ""
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data functions
  const fetchStats = async () => {
    try {
      const [totalRes, popRes, recentRes] = await Promise.all([
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/total`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/popular-categories`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/recent`)
      ]);
      
      setStats({
        total: totalRes.totalContent || 0,
        topCategories: popRes.topCategories || [],
        recentContent: recentRes.recentContent || []
      });
    } catch (error) {
      handleError("Failed to load statistics", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/categories`
      );
      setCategories(data.categories || []);
    } catch (error) {
      handleError("Failed to load categories", error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let items = [];
      let count = 0;

      if (searchQuery.trim()) {
        const sr = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/search?q=${encodeURIComponent(searchQuery)}`
        );
        items = sr.results || [];
        count = items.length;
        if (selectedCategory !== "All") {
          items = items.filter(i => i.category === selectedCategory);
          count = items.length;
        }
      } else if (selectedCategory !== "All") {
        const cr = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/category/${selectedCategory}?limit=${pagination.limit}&page=${pagination.page}`
        );
        items = cr.content || [];
        count = cr.count || 0;
      } else {
        const ar = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content?limit=${pagination.limit}&page=${pagination.page}`
        );
        items = ar.content || [];
        count = ar.count || 0;
      }

      const start = (pagination.page - 1) * pagination.limit;
      const end = start + pagination.limit;
      setContentItems(items.slice(start, end));
      setPagination(prev => ({ ...prev, total: count }));
    } catch (error) {
      handleError("Failed to load content", error);
    }
    setLoading(false);
  };

  // Content CRUD operations
  const handleAddContent = async () => {
    const { title, description, category, url } = formData;
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();
    const trimmedUrl = url.trim();

    // Validation
    if (!trimmedTitle || !trimmedDescription || !trimmedCategory || !trimmedUrl) {
      return handleError("All fields are required");
    }

    if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      return handleError("Title must be between 3 and 200 characters");
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 1000) {
      return handleError("Description must be between 10 and 1000 characters");
    }

    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    if (!urlPattern.test(trimmedUrl)) {
      return handleError("Invalid URL format. Must start with http:// or https://");
    }

    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/content`, {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          category: trimmedCategory,
          url: trimmedUrl
        }),
      });
      
      setFormData({ title: "", description: "", category: "", url: "" });
      setPagination(prev => ({ ...prev, page: 1 }));
      handleSuccess("Content added successfully");
      fetchContent();
      fetchStats();
    } catch (error) {
      handleError("Failed to add content", error);
    }
  };

  const handleUpdateContent = async () => {
    const { title, description, category, url } = formData;
    
    if (!title.trim() || !description.trim() || !category.trim() || !url.trim()) {
      return handleError("All fields are required for update");
    }

    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${editingId}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );
      
      setEditingId(null);
      setFormData({ title: "", description: "", category: "", url: "" });
      handleSuccess("Content updated successfully");
      fetchContent();
      fetchStats();
    } catch (error) {
      handleError("Failed to update content", error);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${id}`,
        { method: "DELETE" }
      );
      
      handleSuccess("Content deleted successfully");
      fetchContent();
      fetchStats();
    } catch (error) {
      handleError("Failed to delete content", error);
    }
  };

  // Helper functions
  const handleError = (message, error = null) => {
    console.error(message, error);
    setNotifications({
      error: error ? `${message}: ${error.message}` : message,
      success: ""
    });
    setTimeout(() => setNotifications(prev => ({ ...prev, error: "" })), 5000);
  };

  const handleSuccess = (message) => {
    setNotifications({
      error: "",
      success: message
    });
    setTimeout(() => setNotifications(prev => ({ ...prev, success: "" })), 5000);
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      url: item.url || ""
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextPage = () => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  // Content fetch on dependencies change
  useEffect(() => {
    fetchContent();
  }, [searchQuery, selectedCategory, pagination.page, pagination.limit]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Content Library</h1>
          <p className="text-gray-400">Manage all your content in one place</p>
        </div>

        {/* Notifications */}
        {notifications.error && (
          <div className="mb-6 bg-red-900 text-red-100 p-4 rounded border border-red-700">
            <p>{notifications.error}</p>
          </div>
        )}
        {notifications.success && (
          <div className="mb-6 bg-green-900 text-green-100 p-4 rounded border border-green-700">
            <p>{notifications.success}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Content */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-900 text-blue-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Content</p>
                <p className="text-2xl font-semibold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Recent Content */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-900 text-green-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Recently Added</p>
                <div className="mt-1 space-y-1">
                  {stats.recentContent.length > 0 ? (
                    stats.recentContent.slice(0, 2).map(rc => (
                      <p key={rc._id} className="text-sm text-gray-300 truncate">
                        {rc.title}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent content</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-900 text-purple-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Top Categories</p>
                <div className="mt-1 space-y-1">
                  {stats.topCategories.length > 0 ? (
                    stats.topCategories.slice(0, 2).map(cat => (
                      <p key={cat._id} className="text-sm text-gray-300">
                        {cat._id} ({cat.count})
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Management Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden mb-8">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-lg font-semibold text-white">Content Management</h2>
            <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search content..."
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white w-full focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white w-full sm:w-auto focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Form */}
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-md font-medium text-gray-300 mb-3">
              {editingId ? "Edit Content" : "Add New Content"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Content title"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Content description"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleFormChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: "", description: "", category: "", url: "" });
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingId ? handleUpdateContent : handleAddContent}
                className="px-4 py-2 bg-purple-600 rounded-md text-sm font-medium text-white hover:bg-purple-700"
              >
                {editingId ? "Update Content" : "Add Content"}
              </button>
            </div>
          </div>

          {/* Content List */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : contentItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentItems.map(item => (
                  <div key={item._id} className="border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500 transition-colors">
                    <div className="h-40 bg-gray-800 relative overflow-hidden">
                      <Image
                        src={getRandomCategoryImage(item.category)}
                        alt={item.title}
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0"
                      />
                    </div>
                    <div className="p-4 bg-gray-900">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-white">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-purple-400 hover:underline"
                          >
                            {item.title}
                          </a>
                        </h3>
                        <span className="inline-block bg-gray-800 text-purple-400 text-xs px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <TruncatedText text={item.description} lines={3} />
                      <div className="mt-4 flex justify-between items-center">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
                        >
                          View Content
                        </a>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(item)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item._id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-600"
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
                <h3 className="mt-2 text-sm font-medium text-gray-300">No content found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? "Try a different search term" : "Get started by adding some content"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {contentItems.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium text-white">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-white">{pagination.total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 border border-gray-700 rounded-md text-sm font-medium ${
                    pagination.page === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-300">
                  Page {pagination.page}
                </span>
                <button
                  onClick={nextPage}
                  disabled={contentItems.length < pagination.limit}
                  className={`px-3 py-1 border border-gray-700 rounded-md text-sm font-medium ${
                    contentItems.length < pagination.limit
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}