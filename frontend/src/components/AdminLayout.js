import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, LayoutDashboard, Users, Briefcase, Handshake, ChartNoAxesCombined, Settings } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 fixed h-full">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">BeBetter Admin</h2>
        
        <nav className="space-y-4">
          <Link href="/admin/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded">
            <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded">
            <Users className="w-5 h-5 mr-2" /> Manage Users
          </Link>
          <Link href="/admin/admins" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded">
            <Briefcase className="w-5 h-5 mr-2" /> Manage Admins
          </Link>
          <Link href="/admin/partnerships" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded">
            <Handshake className="w-5 h-5 mr-2" /> Partnerships
          </Link>
          <Link href="/admin/analytics" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded">
            <ChartNoAxesCombined className="w-5 h-5 mr-2" /> Analytics
          </Link>
          <Link href="/admin/settings" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 rounded">
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
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600">Manage BeBetter efficiently</p>
        </div>

        {/* Page Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
