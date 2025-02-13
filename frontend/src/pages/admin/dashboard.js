import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function AdminDashboard() {
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);

  useEffect(() => {
    // Mock Data (Replace with API Call)
    setUserGrowthData({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "New Users",
          data: [30, 45, 80, 120, 200, 260],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    });

    setEngagementData({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Active Users",
          data: [500, 700, 850, 1200, 1800, 2200],
          borderColor: "rgba(255, 99, 132, 1)",
          fill: false,
        },
      ],
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-500">Manage users, partnerships, and revenue analytics.</p>

      {/* Overview Cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">👥 Total Users</h2>
          <p className="text-3xl font-bold text-purple-600">2,340</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💼 Active Partnerships</h2>
          <p className="text-3xl font-bold text-blue-600">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💰 Monthly Revenue</h2>
          <p className="text-3xl font-bold text-green-600">$12,450</p>
        </div>
      </div>

      {/* Placeholder for analytics */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">📊 User Growth Trends</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">📈 User Growth</h2>
          {userGrowthData && <Bar data={userGrowthData} />}
        </div>
      </div>
    </AdminLayout>
  );
}
