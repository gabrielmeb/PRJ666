import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function AdminDashboard() {
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [activePartnerships, setActivePartnerships] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [totalCommunities, setTotalCommunities] = useState(0);
  const [topCommunities, setTopCommunities] = useState([]);
  const [newSignupsThisWeek, setNewSignupsThisWeek] = useState(0);
  const [newSignupsThisMonth, setNewSignupsThisMonth] = useState(0);
  const [commCreatedThisWeek, setCommCreatedThisWeek] = useState(0);
  const [commCreatedThisMonth, setCommCreatedThisMonth] = useState(0);
  const [userFeedbackTickets, setUserFeedbackTickets] = useState(0);

  const [userGrowthData, setUserGrowthData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [revenueTrendsData, setRevenueTrendsData] = useState(null);
  const [userDistributionData, setUserDistributionData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/total`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/total`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/joined-last-week`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/joined-last-month`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/created-last-week`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/created-last-month`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communities/top`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const usersData = await usersRes.json();
        const communitiesData = await communitiesRes.json();
        const weeklySignupsData = await weeklySignupsRes.json();
        const monthlySignupsData = await monthlySignupsRes.json();
        const weeklyCommData = await weeklyCommCreatedRes.json();
        const monthlyCommData = await monthlyCommCreatedRes.json();
        const feedbackStatsData = await feedbackStatsRes.json();
        const topCommunitiesData = await topCommunitiesRes.json();

        const demoData = {
          activePartnerships: 18,
          monthlyRevenue: 12450,
        };

        setTotalUsers(usersData.totalUsers || 0);
        setActivePartnerships(demoData.activePartnerships);
        setMonthlyRevenue(demoData.monthlyRevenue);
        setTotalCommunities(communitiesData.totalCommunities || 0);
        setNewSignupsThisWeek(weeklySignupsData.usersJoinedLastWeek || 0);
        setNewSignupsThisMonth(monthlySignupsData.usersJoinedLastMonth || 0);
        setCommCreatedThisWeek(weeklyCommData.communitiesCreatedLastWeek || 0);
        setCommCreatedThisMonth(monthlyCommData.communitiesCreatedLastMonth || 0);
        setUserFeedbackTickets(feedbackStatsData.totalFeedback || 0);
        setTopCommunities(topCommunitiesData.topCommunities || []);

        setUserGrowthData({
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "New Users",
              data: [30, 45, 80, 120, 200, 260],
              backgroundColor: "#4FD1C5",
            },
          ],
        });

        setEngagementData({
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Active Users",
              data: [500, 700, 850, 1200, 1800, 2200],
              borderColor: "#F56565",
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
              borderColor: "#4299E1",
              fill: false,
            },
          ],
        });

        setUserDistributionData({
          labels: ["Fitness", "Finance", "Productivity", "Mental Health"],
          datasets: [
            {
              label: "User Preferences",
              data: [300, 200, 150, 350],
              backgroundColor: [
                "#F56565", "#4299E1", "#ECC94B", "#9F7AEA",
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-white">Loading Dashboard...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400">Manage users, partnerships, and analytics</p>

        {/* Overview Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users">
            <div className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold">👥 Total Users</h2>
              <p className="text-3xl font-bold text-purple-400">{totalUsers}</p>
            </div>
          </Link>
          <Link href="/admin/communities">
            <div className="bg-gray-900 hover:bg-gray-800 transition p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold">🏘️ Communities</h2>
              <p className="text-3xl font-bold text-teal-400">{totalCommunities}</p>
            </div>
          </Link>
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold">💼 Partnerships</h2>
            <p className="text-3xl font-bold text-blue-400">{activePartnerships}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold">💰 Revenue</h2>
            <p className="text-3xl font-bold text-green-400">${monthlyRevenue}</p>
          </div>
        </div>

        {/* More Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {[
            ["📥 New Signups (Week)", newSignupsThisWeek],
            ["📅 New Signups (Month)", newSignupsThisMonth],
            ["🆕 Communities This Week", commCreatedThisWeek],
            ["🆕 Communities This Month", commCreatedThisMonth],
          ].map(([label, value], i) => (
            <div key={i} className="bg-gray-900 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold">{label}</h2>
              <p className="text-3xl font-bold text-indigo-400">{value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">📈 User Growth</h2>
            {userGrowthData && <Bar data={userGrowthData} />}
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">🚀 Engagement</h2>
            {engagementData && <Line data={engagementData} />}
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">💸 Revenue Trends</h2>
            {revenueTrendsData && <Line data={revenueTrendsData} />}
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">📊 User Distribution</h2>
            {userDistributionData && <Pie data={userDistributionData} />}
          </div>
        </div>

        {/* Top Communities Table */}
        <div className="mt-6 bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🏆 Top 5 Communities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-300 bg-gray-800">
                  <th className="p-3 border border-gray-700">Name</th>
                  <th className="p-3 border border-gray-700">Members</th>
                  <th className="p-3 border border-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {topCommunities.map((comm) => (
                  <tr key={comm._id} className="hover:bg-gray-800">
                    <td className="p-3 border border-gray-700 text-purple-300 hover:underline">
                      <Link href={`/admin/communities/${comm._id}`}>{comm.name}</Link>
                    </td>
                    <td className="p-3 border border-gray-700">{comm.memberCount}</td>
                    <td className="p-3 border border-gray-700">{comm.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}