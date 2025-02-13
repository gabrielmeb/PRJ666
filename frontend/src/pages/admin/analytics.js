import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function Analytics() {
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
      <h1 className="text-3xl font-bold text-gray-800">📊 Analytics</h1>
      <p className="text-gray-500">User engagement and growth trends</p>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">📈 User Growth</h2>
          {userGrowthData && <Bar data={userGrowthData} />}
        </div>

        {/* Engagement Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">📉 Engagement Trends</h2>
          {engagementData && <Line data={engagementData} />}
        </div>
      </div>
    </AdminLayout>
  );
}
