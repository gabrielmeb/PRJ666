import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function AdminDashboard() {
  // ---------------------------
  // STATE: Overview Metrics
  // ---------------------------
  const [totalUsers, setTotalUsers] = useState(0);
  const [activePartnerships, setActivePartnerships] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalCommunities, setTotalCommunities] = useState(0);

  // Additional example metrics
  const [newSignupsThisWeek, setNewSignupsThisWeek] = useState(0);
  const [userFeedbackTickets, setUserFeedbackTickets] = useState(0);

  // ---------------------------
  // STATE: Graph Data
  // ---------------------------
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [revenueTrendsData, setRevenueTrendsData] = useState(null);
  const [userDistributionData, setUserDistributionData] = useState(null);

  // ---------------------------
  // STATE: Loading & Error
  // ---------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // If your endpoints need an admin token:
  // Make sure you have it from localStorage or context
  // const token = (typeof window !== 'undefined') ? localStorage.getItem("adminToken") : null;

  // ---------------------------
  // EFFECT: Fetch Dashboard Data
  // ---------------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        /**
         * 1) Fetch Real API Data (Where Possible)
         *    Suppose you have an endpoint: /api/admin/stats/overview
         *    that returns JSON like:
         *    {
         *       "totalUsers": 2340,
         *       "activePartnerships": 18,
         *       "monthlyRevenue": 12450,
         *       "totalCommunities": 42,
         *       "newSignupsThisWeek": 143,
         *       "userFeedbackTickets": 5
         *    }
         */
        // Example Real Call:
        // const resOverview = await fetch(
        //   `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/overview`,
        //   {
        //     headers: { Authorization: `Bearer ${token}` },
        //   }
        // );
        // if (!resOverview.ok) {
        //   throw new Error("Failed to fetch overview stats");
        // }
        // const dataOverview = await resOverview.json();

        // For demonstration, let's pretend we made the call and parse dummy data:
        const dataOverview = {
          totalUsers: 2340,
          activePartnerships: 18,
          monthlyRevenue: 12450,
          totalCommunities: 42,
          newSignupsThisWeek: 143,
          userFeedbackTickets: 5,
        };

        // Set metrics
        setTotalUsers(dataOverview.totalUsers);
        setActivePartnerships(dataOverview.activePartnerships);
        setMonthlyRevenue(dataOverview.monthlyRevenue);
        setTotalCommunities(dataOverview.totalCommunities);
        setNewSignupsThisWeek(dataOverview.newSignupsThisWeek);
        setUserFeedbackTickets(dataOverview.userFeedbackTickets);

        /**
         * 2) For Graphs, either fetch from separate endpoints or use dummy data
         *    e.g., /api/admin/stats/user-growth => { labels: [...], data: [...] }
         */
        // Real call example:
        // const [resUserGrowth, resEngagement, resRevenueTrends, resUserDist] = await Promise.all([
        //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/user-growth`, { headers: { Authorization: `Bearer ${token}` } }),
        //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/engagement`, { headers: { Authorization: `Bearer ${token}` } }),
        //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/revenue-trends`, { headers: { Authorization: `Bearer ${token}` } }),
        //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/user-distribution`, { headers: { Authorization: `Bearer ${token}` } }),
        // ]);
        // parse them similarly

        // We'll mock them here:
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

        setRevenueTrendsData({
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue (USD)",
              data: [4000, 6500, 8000, 9000, 12000, 15000],
              borderColor: "rgba(54, 162, 235, 1)",
              fill: false,
            },
          ],
        });

        // Fixing the Pie Chart size by specifying a custom width/height,
        // or using "maintainAspectRatio: false" and wrapping in a container
        setUserDistributionData({
          labels: ["Fitness", "Finance", "Productivity", "Mental Health"],
          datasets: [
            {
              label: "User Preferences",
              data: [300, 200, 150, 350],
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(153, 102, 255, 0.7)",
              ],
            },
          ],
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ---------------------------
  // RENDER: Loading & Error
  // ---------------------------
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-xl font-bold">Loading Dashboard...</h1>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-xl font-bold text-red-600">Error</h1>
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  // ---------------------------
  // RENDER: Dashboard Layout
  // ---------------------------
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-500">Manage users, partnerships, and revenue analytics.</p>

      {/* Overview Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">👥 Total Users</h2>
          <p className="text-3xl font-bold text-purple-600">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💼 Active Partnerships</h2>
          <p className="text-3xl font-bold text-blue-600">{activePartnerships}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">🏘️ Total Communities</h2>
          <p className="text-3xl font-bold text-teal-600">{totalCommunities}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💰 Monthly Revenue</h2>
          <p className="text-3xl font-bold text-green-600">${monthlyRevenue}</p>
        </div>
      </div>

      {/* Additional Metrics Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">New Signups This Week</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {newSignupsThisWeek}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">User Feedback Tickets</h2>
          <p className="text-3xl font-bold text-amber-600">
            {userFeedbackTickets} pending
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">📈 User Growth</h2>
          {userGrowthData && <Bar data={userGrowthData} />}
        </div>

        {/* Engagement Trends (Line Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">🚀 Engagement Trends</h2>
          {engagementData && <Line data={engagementData} />}
        </div>

        {/* Revenue Trends (Line Chart) */}
        <div className=" bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">💰 Revenue Trends</h2>
          {revenueTrendsData && <Line data={revenueTrendsData} />}
        </div>

        {/* User Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">📊 User Distribution by Category</h2>
          <Pie className="max-h-72"
            data={{
              labels: ["Fitness", "Finance", "Productivity", "Mental Health"],
              datasets: [
                {
                  label: "User Preferences",
                  data: [300, 200, 150, 350],
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                  ],
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Potential Table of Top 5 Communities */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🏆 Top 5 Communities</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Members</th>
              <th className="p-2 text-left">Created On</th>
            </tr>
          </thead>
          <tbody>
            {/* Sample data rows - or real API call */}
            <tr className="border-b">
              <td className="p-2">Fitness Enthusiasts</td>
              <td className="p-2">1,200</td>
              <td className="p-2">2024-01-15</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Finance Gurus</td>
              <td className="p-2">980</td>
              <td className="p-2">2023-12-10</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Productivity Hackers</td>
              <td className="p-2">670</td>
              <td className="p-2">2023-09-05</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Mental Wellness</td>
              <td className="p-2">540</td>
              <td className="p-2">2023-08-20</td>
            </tr>
            <tr>
              <td className="p-2">Startup Innovators</td>
              <td className="p-2">430</td>
              <td className="p-2">2024-02-01</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
