import Layout from "@/components/Layout";

export default function AdminDashboard() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-500">Manage users, partnerships, and revenue analytics.</p>

      {/* Overview Cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">👥 Total Users</h2>
          <p className="text-3xl font-bold text-purple-600">2,340</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💼 Partnerships</h2>
          <p className="text-3xl font-bold text-blue-600">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💰 Monthly Revenue</h2>
          <p className="text-3xl font-bold text-green-600">$12,450</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">📊 Revenue Analytics</h2>
        <img src="/chart-placeholder.png" alt="Revenue Chart" className="mt-4 w-full" />
      </div>

      {/* Business Partnerships */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">💼 Manage Partnerships</h2>
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Affiliate Sign-ups</th>
              <th className="p-2 text-left">Revenue Share</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">Fitness Pro</td>
              <td className="p-2">200</td>
              <td className="p-2">$4,000</td>
              <td className="p-2">
                <button className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2">Mindfulness Hub</td>
              <td className="p-2">150</td>
              <td className="p-2">$3,200</td>
              <td className="p-2">
                <button className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* New User Signups */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">🆕 Recent Sign-ups</h2>
        <ul className="mt-2 text-gray-600">
          <li>👤 Alice Johnson - alice@example.com</li>
          <li>👤 Mark Smith - mark@example.com</li>
          <li>👤 Sarah Lee - sarah@example.com</li>
        </ul>
      </div>
    </Layout>
  );
}
