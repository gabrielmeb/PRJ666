import Layout from "@/components/Layout";

export default function Goals() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold">Your Goals</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h2 className="text-xl font-semibold">Set a New Goal</h2>
        <input type="text" placeholder="Goal Description" className="w-full p-3 mt-2 border rounded" />
        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">Add Goal</button>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Current Goals</h2>
        <ul className="mt-2 text-gray-600">
          <li>🏋️ Exercise 5x a week (Progress: 50%)</li>
          <li>📖 Read 10 pages daily (Progress: 30%)</li>
        </ul>
      </div>
    </Layout>
  );
}
