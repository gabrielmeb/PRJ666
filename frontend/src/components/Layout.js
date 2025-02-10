import { useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      {/* Main container (Sidebar + Page Content) */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Use flex to place sidebar and content side by side in desktop */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Toggle button: only visible on mobile */}
          <button
            className="md:hidden bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            Menu
          </button>

          {/* Sidebar (non-fixed, no logo) */}
          <aside
            className={`${
              sidebarOpen ? "block" : "hidden"
            } md:block w-full md:w-64 bg-white shadow-md p-4`}
          >
            <nav className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="py-2 px-4 text-gray-700 hover:bg-purple-100 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="py-2 px-4 text-gray-700 hover:bg-purple-100 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/goals"
                className="py-2 px-4 text-gray-700 hover:bg-purple-100 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Goals
              </Link>
              <Link
                href="/community"
                className="py-2 px-4 text-gray-700 hover:bg-purple-100 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Community
              </Link>
              <Link
                href="/library"
                className="py-2 px-4 text-gray-700 hover:bg-purple-100 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Content Library
              </Link>
              <Link
                href="/admin"
                className="py-2 px-4 text-gray-700 hover:bg-purple-100 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Admin
              </Link>
            </nav>
          </aside>

          {/* Main Content Section */}
          <section className="flex-1 bg-white rounded shadow p-4">
            {children}
          </section>
        </div>
      </div>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
