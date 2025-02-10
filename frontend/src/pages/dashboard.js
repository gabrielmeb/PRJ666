import Layout from "@/components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Welcome, John Doe 👋</h1>
      <p className="text-gray-500">Here&apos;s your progress and recommendations.</p>

      {/* Progress Tracking */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Goal Progress</h2>
        <div className="mt-4 bg-gray-200 rounded-full h-4">
          <div className="bg-purple-600 h-4 rounded-full w-3/5"></div>
        </div>
        <p className="text-gray-600 mt-2">60% completed</p>
      </div>

      {/* AI Recommendations */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">📘 Recommended Book</h3>
          <p>Atomic Habits by James Clear</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">🎓 Course</h3>
          <p>Time Management Mastery</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">🌎 Community</h3>
          <p>Join Productivity Enthusiasts</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <ul className="mt-2 text-gray-600">
          <li>✅ You achieved your weekly goal!</li>
          <li>📢 New discussion in Productivity Group</li>
        </ul>
      </div>
    </Layout>
  );
}
