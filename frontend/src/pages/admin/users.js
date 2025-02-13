import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const usersData = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Mark Smith", email: "mark@example.com" },
];

export default function ManageUsers() {
  const [users, setUsers] = useState(usersData);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
      <p className="text-gray-500">View and manage registered users.</p>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
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
