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

  // Fetch admin info from localStorage on component mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) {
      // If no admin found in storage, redirect or show message
      // For example, redirect to home or admin login
      router.push("/");
      return;
    }
    try {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdminUser(parsedAdmin);
    } catch (error) {
      console.error("Failed to parse adminInfo:", error);
      // Optionally clear storage and redirect
      localStorage.removeItem("adminInfo");
      localStorage.removeItem("adminToken");
      router.push("/");
    }
  }, [router]);

  // Logout handler
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 fixed h-full">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">
          BeBetter Admins
        </h2>

        <nav className="space-y-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <User className="w-5 h-5 mr-2" /> Manage Users
          </Link>
          <Link
            href="/admin/communities"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <Users className="w-5 h-5 mr-2" /> Manage Communities
          </Link>
          <Link
            href="/admin/content"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <ListVideo className="w-5 h-5 mr-2" /> Manage Content
          </Link>
          <Link
            href="/admin/admins"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <Briefcase className="w-5 h-5 mr-2" /> Manage Admins
          </Link>
          <Link
            href="/admin/partnerships"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <Handshake className="w-5 h-5 mr-2" /> Partnerships
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded"
          >
            <Settings className="w-5 h-5 mr-2" /> Settings
          </Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center p-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">
        {/* Top Navbar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          {/* Left side: Title */}
          <h1 className="text-xl font-semibold text-gray-800">Admin Controls</h1>

          {/* Right side: Admin Info */}
          {adminUser ? (
            <div className="text-right">
              <p className="text-gray-600 font-bold md:text-lg ">
                Welcome, {adminUser.name || "Admin"}
              </p>
              <p className="text-sm text-purple-600 font-semibold">
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
