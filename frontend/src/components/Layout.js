import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  RiHome3Line,
  RiUserLine,
  RiLineChartLine,
  RiFeedbackLine,
  RiUserCommunityFill,
  RiImageAiLine,
  RiAdminLine,
} from "react-icons/ri";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main container */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Sidebar Toggle */}
          <button
            className="md:hidden bg-purple-600 text-white px-4 py-2 rounded-lg shadow"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            Menu
          </button>

          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "block" : "hidden"
            } md:block w-full md:w-64 bg-zinc-900 rounded-xl shadow-md p-5 transition`}
          >
            <nav className="flex flex-col gap-2">
              <SidebarLink href="/user/home" label="Home" icon={<RiHome3Line />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
              <SidebarLink href="/user/goals" label="Goals & Progress" icon={<RiLineChartLine />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
              <SidebarLink href="/user/my_communities" label="My Community" icon={<RiUserCommunityFill />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
              <SidebarLink href="/user/community" label="Explore Community" icon={<RiUserCommunityFill />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
              <SidebarLink href="/user/library" label="Content Library" icon={<RiImageAiLine />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
              <SidebarLink href="/user/feedback" label="Feedback" icon={<RiFeedbackLine />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
              <SidebarLink href="/user/admin" label="Admin" icon={<RiAdminLine />} isActive={isActive} setSidebarOpen={setSidebarOpen} />
            </nav>
          </aside>

          {/* Main Content */}
          <section className="flex-1 bg-zinc-950 rounded-xl shadow-md p-6 text-white">
            {children}
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// SidebarLink Component
function SidebarLink({ href, label, icon, isActive, setSidebarOpen }) {
  const active = isActive(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium ${
        active
          ? "bg-purple-600 text-white"
          : "text-gray-300 hover:bg-zinc-800 hover:text-white"
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
