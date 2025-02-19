import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { RiHome3Line, RiUserLine,RiLineChartLine, RiUserCommunityFill, RiImageAiLine, RiAdminLine } from "react-icons/ri";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  // Function to check if the link is active
  const isActive = (path) => router.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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
                href="/user/home"
                className={`flex items-center space-x-2 py-2 px-4 rounded transition ${
                  isActive("/home")
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RiHome3Line size={20} />
                <span>Home</span>
              </Link>
              <Link
                href="/user/profile"
                className={`flex items-center space-x-2 py-2 px-4 rounded transition ${
                  isActive("/profile")
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RiUserLine size={20} />
                <span>Profile</span>
              </Link>
              <Link
                href="/user/goals"
                className={`flex items-center space-x-2 py-2 px-4 rounded transition ${
                  isActive("/goals")
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RiLineChartLine size={20} />
                <span>Goals</span>
              </Link>
              <Link
                href="/user/community"
                className={`flex items-center space-x-2 py-2 px-4 rounded transition ${
                  isActive("/community")
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RiUserCommunityFill size={20} />
                <span>Community</span>
              </Link>
              <Link
                href="/user/library"
                className={`flex items-center space-x-2 py-2 px-4 rounded transition ${
                  isActive("/library")
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RiImageAiLine size={20} />
                <span>Content Library</span>
              </Link>
              <Link
                href="/user/admin"
                className={`flex items-center space-x-2 py-2 px-4 rounded transition ${
                  isActive("/admin/login")
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-purple-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RiAdminLine size={20} />
                <span>Admin</span>
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
