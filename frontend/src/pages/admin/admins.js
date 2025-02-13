import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const adminsData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Moderator" },
];

export default function ManageAdmins() {
  const [admins, setAdmins] = useState(adminsData);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
      <p className="text-gray-500">View and manage admin accounts.</p>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t">
                <td className="p-2">{admin.name}</td>
                <td className="p-2">{admin.email}</td>
                <td className="p-2">{admin.role}</td>
                <td className="p-2">
                  <button className="bg-red-500 text-white px-3 py-1 rounded">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
