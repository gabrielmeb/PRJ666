import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api";
import Image from "next/image";

// Helper to get an image URL based on the category.
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

function ContentCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);

  // If description > 100 characters and not expanded, show partial text.
  const displayDescription =
    item.description.length > 100 && !expanded
      ? item.description.slice(0, 100) + "..."
      : item.description;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition duration-200 hover:shadow-lg flex flex-col">
      {/* Image Section */}
      <div className="relative w-full h-48">
        <Image
          src={getRandomCategoryImage(item.category)}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          className="object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Clickable Title */}
        {item.url ? (
          <Link href={item.url}
            className="text-xl font-semibold text-blue-600 mb-3 line-clamp-2 hover:underline">
              {item.title}

          </Link>
        ) : (
          <h2 className="text-xl font-semibold text-blue-600 mb-3 line-clamp-2">
            {item.title}
          </h2>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700 flex-grow">
          {displayDescription}
        </p>

        {/* Toggle "Read More" if needed */}
        {item.description.length > 100 && (
          <button
            onClick={toggleExpanded}
            className="text-sm text-blue-500 hover:underline focus:outline-none self-start"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}

        {/* Category */}
        <p className="text-xs text-gray-500 mt-4">Category: {item.category}</p>

        {/* View Resource Link */}
        {item.url && (
          <div className="mt-4">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm px-5 py-2 rounded-md"
            >
              View Resource
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContentPage() {
  const [token, setToken] = useState("");
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [nextDisabled, setNextDisabled] = useState(false);

  // Get token on mount.
  useEffect(() => {
    const t = localStorage.getItem("userToken");
    if (t) setToken(t);
  }, []);

  // Fetch distinct categories.
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        const res = await apiFetch("/api/content/categories", { method: "GET" });
        setCategories(res.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch content based on filters and pagination.
  const fetchContent = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "";
      if (selectedCategory !== "All") {
        url = `/api/content/category/${encodeURIComponent(selectedCategory)}?page=${page}&limit=${limit}`;
        const data = await apiFetch(url, { method: "GET" });
        setContentList(data.content || []);
        setNextDisabled((data.content?.length || 0) < limit);
      } else if (searchTerm.trim() !== "") {
        url = `/api/content/search?q=${encodeURIComponent(searchTerm)}`;
        const data = await apiFetch(url, { method: "GET" });
        // Client-side pagination for search results.
        const results = data.results || [];
        const start = (page - 1) * limit;
        const paginated = results.slice(start, start + limit);
        setContentList(paginated);
        setNextDisabled(paginated.length < limit);
      } else {
        url = `/api/content?page=${page}&limit=${limit}`;
        const data = await apiFetch(url, { method: "GET" });
        setContentList(data.content || []);
        setNextDisabled((data.content?.length || 0) < limit);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to load content. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchContent();
  }, [token, searchTerm, selectedCategory, page]);

  // When filters change, reset page and refetch content.
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContent();
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (!nextDisabled) setPage((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Content Library</h1>

        {/* Search & Filter */}
        <form
          onSubmit={handleSearchSubmit}
          className="mb-6 flex flex-col md:flex-row items-center gap-4"
        >
          <input
            type="text"
            placeholder="Search content..."
            className="w-full md:w-1/2 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full md:w-1/4 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Search
          </button>
        </form>

        {/* Error Handling */}
        {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-6">{error}</div>}

        {/* Content Cards */}
        {loading ? (
          <p className="text-gray-600">Loading content...</p>
        ) : contentList.length === 0 ? (
          <p className="text-gray-500 italic">No content found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentList.map((item) => (
              <ContentCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {contentList.length > 0 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 focus:outline-none"
            >
              Prev
            </button>
            <span className="text-lg font-medium">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={nextDisabled}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 focus:outline-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
