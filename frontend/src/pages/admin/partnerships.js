import AdminLayout from "@/components/AdminLayout";

export default function Partnerships() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Partnerships</h1>
      <p className="text-gray-500">Manage business partnerships and track revenue.</p>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Affiliate Programs</h2>
        <p className="text-gray-600">Track user signups from partnered companies.</p>
      </div>
    </AdminLayout>
  );
}
