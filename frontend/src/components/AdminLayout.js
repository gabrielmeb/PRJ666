import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  User,
  Users,
  ListVideo,
  Briefcase,
  Handshake,
  Settings,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) {
      router.push("/");
      return;
    }
    try {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdminUser(parsedAdmin);
    } catch (error) {
      console.error("Failed to parse adminInfo:", error);
      localStorage.removeItem("adminInfo");
      localStorage.removeItem("adminToken");
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 fixed h-full">
        <h2 className="text-2xl font-bold text-purple-400 mb-6">
          BeBetter Admins
        </h2>

        <nav className="space-y-2">
          <Link
            href="/admin/dashboard"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/dashboard" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/users" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <User className="w-5 h-5 mr-2" /> Manage Users
          </Link>
          <Link
            href="/admin/communities"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/communities" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <Users className="w-5 h-5 mr-2" /> Manage Communities
          </Link>
          <Link
            href="/admin/content"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/content" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <ListVideo className="w-5 h-5 mr-2" /> Manage Content
          </Link>
          <Link
            href="/admin/admins"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/admins" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <Briefcase className="w-5 h-5 mr-2" /> Manage Admins
          </Link>
          <Link
            href="/admin/partnerships"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/partnerships" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <Handshake className="w-5 h-5 mr-2" /> Partnerships
          </Link>
          <Link
            href="/admin/settings"
            className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition ${
              router.pathname === "/admin/settings" ? "bg-gray-800 text-white" : ""
            }`}
          >
            <Settings className="w-5 h-5 mr-2" /> Settings
          </Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center p-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">
        {/* Top Navbar */}
        <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-800">
          {/* Left side: Title */}
          <h1 className="text-xl font-semibold text-white">Admin Controls</h1>

          {/* Right side: Admin Info */}
          {adminUser ? (
            <div className="text-right">
              <p className="text-gray-300 font-bold md:text-lg">
                Welcome, {adminUser.name || "Admin"}
              </p>
              <p className="text-sm text-purple-400 font-semibold">
                {adminUser.role}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Loading admin info...</p>
          )}
        </div>

        {/* Page Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}