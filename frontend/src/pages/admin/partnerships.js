import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState([
    { id: 1, company: "TechCorp", contact: "john@techcorp.com", status: "Active" },
    { id: 2, company: "EduLearn", contact: "sara@edulearn.com", status: "Pending" },
    { id: 3, company: "HealthPlus", contact: "mike@healthplus.com", status: "Active" },
    { id: 4, company: "FinanceX", contact: "lisa@financex.com", status: "Pending" },
  ]);

  const totalPartnerships = partnerships.length;

  return (
    <AdminLayout>
      <div>
      <h1 className="text-3xl font-bold text-gray-800">Partnerships</h1>
      <p className="text-gray-500">Manage business collaborations and partnership requests.</p>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Affiliate Programs</h2>
        <p className="text-gray-600">Track user signups from partnered companies.</p>
      
      {/* Overview Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-lg font-semibold">Total Partnerships</h2>
            <p className="text-3xl font-bold text-blue-600">{totalPartnerships}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-lg font-semibold">Active Partnerships</h2>
            <p className="text-3xl font-bold text-green-600">
              {partnerships.filter((p) => p.status === "Active").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-lg font-semibold">Pending Requests</h2>
            <p className="text-3xl font-bold text-yellow-600">
              {partnerships.filter((p) => p.status === "Pending").length}
            </p>
          </div>
        </div>
      </div>

        {/* Partnership Table */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📋 Partnership List</h2>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Company</th>
                  <th className="p-2 text-left">Contact</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.map((partner) => (
                  <tr key={partner.id} className="border-b">
                    <td className="p-2">{partner.company}</td>
                    <td className="p-2">{partner.contact}</td>
                    <td className="p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          partner.status === "Active" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {partner.status === "Pending" && (
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
                            onClick={() =>
                              setPartnerships(
                                partnerships.map((p) =>
                                  p.id === partner.id ? { ...p, status: "Active" } : p
                                )
                              )
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm"
                            onClick={() =>
                              setPartnerships(partnerships.filter((p) => p.id !== partner.id))
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
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
