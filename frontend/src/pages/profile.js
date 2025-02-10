import Layout from "@/components/Layout";

export default function Profile() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold">Your Profile</h1>

      {/* Profile Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h2 className="text-xl font-semibold">Personal Details</h2>
        <input type="text" placeholder="Full Name" className="w-full p-3 mt-2 border rounded" />
        <input type="email" placeholder="Email" className="w-full p-3 mt-2 border rounded" />
        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">Save Changes</button>
      </div>

      {/* Security */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-4">
        <h2 className="text-xl font-semibold">Security</h2>
        <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Enable 2FA</button>
      </div>
    </Layout>
  );
}
