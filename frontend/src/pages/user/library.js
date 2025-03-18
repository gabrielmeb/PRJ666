import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";

export default function ContentPage() {
  const [token, setToken] = useState("");
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // For new content
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("userToken");
    if (t) setToken(t);
  }, []);

  // 1) fetch content
  useEffect(() => {
    if (!token) return;
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content?page=1&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setContentList(data.content || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchContent();
  }, [token]);

  // 2) create content (admin only)
  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const body = { title, description, category, url };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setContentList((prev) => [data.content, ...prev]);
        setTitle("");
        setDescription("");
        setCategory("");
        setUrl("");
      } else {
        console.error("Failed to create content. Admin only?");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Content Library</h1>
      {loading && <p>Loading content...</p>}

      <form onSubmit={handleCreateContent} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          className="border p-2 w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL"
          className="border p-2 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
          Add Content
        </button>
      </form>

      <ul className="space-y-2">
        {contentList.map((item) => (
          <li key={item._id} className="border p-2 rounded">
            <h2 className="font-semibold">{item.title}</h2>
            <p>{item.description}</p>
            <p className="text-sm italic">Category: {item.category}</p>
            {item.url && <a href={item.url}>Link</a>}
          </li>
        ))}
      </ul>
    </div>
    </Layout>
  );
}
