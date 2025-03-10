import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export default function AdminDashboard() {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  // ---------------------------
  // STATE: Overview Metrics
  // ---------------------------
  const [totalUsers, setTotalUsers] = useState(0);
  const [activePartnerships, setActivePartnerships] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalCommunities, setTotalCommunities] = useState(0);
  const [topCommunities, setTopCommunities] = useState([])

  // Additional metrics
  const [newSignupsThisWeek, setNewSignupsThisWeek] = useState(0);
  const [newSignupsThisMonth, setNewSignupsThisMonth] = useState(0);
  const [commCreatedThisWeek, setCommCreatedThisWeek] = useState(0);
  const [commCreatedThisMonth, setCommCreatedThisMonth] = useState(0);
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
    // Get current logged-in admin info from localStorage
    const storedAdmin = localStorage.getItem("adminInfo");
    if (storedAdmin) {
      setCurrentAdmin(JSON.parse(storedAdmin));
    }

    const fetchDashboardData = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const [
          usersRes,
          communitiesRes,
          weeklySignupsRes,
          monthlySignupsRes,
          weeklyCommCreatedRes,
          monthlyCommCreatedRes,
          feedbackStatsRes,
          topCommunitiesRes,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/total`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/total`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/joined-last-week`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/joined-last-month`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/created-last-week`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/created-last-month`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/top`, { 
            headers: { Authorization: `Bearer ${token}` }, 
          }),
        ]);

        const usersData = await usersRes.json();
        const communitiesData = await communitiesRes.json();
        const weeklySignupsData = await weeklySignupsRes.json();
        const monthlySignupsData = await monthlySignupsRes.json();
        const weeklyCommData = await weeklyCommCreatedRes.json();
        const monthlyCommData = await monthlyCommCreatedRes.json();
        const feedbackStatsData = await feedbackStatsRes.json();
        const topCommunitiesData = await topCommunitiesRes.json();
      
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
        setTotalUsers(usersData.totalUsers || 0);
        setActivePartnerships(dataOverview.activePartnerships);
        setMonthlyRevenue(dataOverview.monthlyRevenue);
        setTotalCommunities(communitiesData.totalCommunities || 0);
        setNewSignupsThisWeek(weeklySignupsData.usersJoinedLastWeek || 0);
        setNewSignupsThisMonth(monthlySignupsData.usersJoinedLastMonth || 0);
        setCommCreatedThisWeek(weeklyCommData.communitiesCreatedLastWeek || 0);
        setCommCreatedThisMonth(monthlyCommData.communitiesCreatedLastMonth || 0);
        setUserFeedbackTickets(feedbackStatsData.totalFeedback || 0);
        setTopCommunities(topCommunitiesData.topCommunities || [])

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
        <Link href="/admin/users" passHref>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">👥 Total Users</h2>
            <p className="text-3xl font-bold text-purple-600">{totalUsers}</p>
          </div>
        </Link>

        <Link href="/admin/communities" passHref>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">🏘️ Total Communities</h2>
            <p className="text-3xl font-bold text-teal-600">{totalCommunities}</p>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💼 Active Partnerships</h2>
          <p className="text-3xl font-bold text-blue-600">{activePartnerships}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💰 Monthly Revenue</h2>
          <p className="text-3xl font-bold text-green-600">${monthlyRevenue}</p>
        </div>
      </div>

      {/* Additional Metrics Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">New Signups Last Week</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {newSignupsThisWeek}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">New Signups last Month</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {newSignupsThisMonth}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">New Community Created This Week</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {commCreatedThisWeek}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">New Community Created This Month</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {commCreatedThisMonth}
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
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🏆 Top 5 Communities
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 border border-gray-300 text-left">Name</th>
                <th className="py-3 px-4 border border-gray-300 text-left">Members</th>
                <th className="py-3 px-4 border border-gray-300 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {topCommunities.map((comm) => (
                <tr key={comm._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border font-semibold border-gray-300 hover:underline">
                    <Link href={`/admin/communities/${comm._id}`}>
                      {comm.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {comm.memberCount}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {comm.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
}
