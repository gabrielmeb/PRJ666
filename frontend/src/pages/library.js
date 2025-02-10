import { useState } from "react";
import Layout from "@/components/Layout";

const contentData = [
  { id: 1, title: "Atomic Habits", category: "Book", url: "#", bookmarked: false },
  { id: 2, title: "Time Management Mastery", category: "Course", url: "#", bookmarked: true },
  { id: 3, title: "The Power of Mindfulness", category: "Podcast", url: "#", bookmarked: false },
];

export default function ContentLibrary() {
  const [content, setContent] = useState(contentData);

  const toggleBookmark = (id) => {
    setContent(
      content.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">📚 Content Library</h1>
      <p className="text-gray-500">AI-curated resources to help your growth.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {content.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
            <a href={item.url} className="text-purple-600 underline mt-2 block">
              View Content
            </a>
            <button
              onClick={() => toggleBookmark(item.id)}
              className={`mt-2 px-4 py-2 rounded ${
                item.bookmarked ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {item.bookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
