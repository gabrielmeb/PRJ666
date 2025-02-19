import Layout from "@/components/Layout";

export default function Community() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold">Community</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h2 className="text-xl font-semibold">Join a Group</h2>
        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">Find a Group</button>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Latest Discussions</h2>
        <ul className="mt-2 text-gray-600">
          <li>💬 &quot;Best Time Management Tips?&quot;</li>
          <li>📢 &quot;Accountability Partner Needed!&quot;</li>
        </ul>
      </div>
    </Layout>
  );
}
