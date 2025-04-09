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
      <div className="min-h-screen bg-black p-6">
        <h1 className="text-3xl font-bold text-white">Partnerships</h1>
        <p className="text-gray-400 mb-6">Manage business collaborations and partnership requests.</p>

        {/* Affiliate Programs Section */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-white">Affiliate Programs</h2>
          <p className="text-gray-400 mb-6">Track user signups from partnered companies.</p>
        
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-300">Total Partnerships</h2>
              <p className="text-3xl font-bold text-purple-400">{totalPartnerships}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-300">Active Partnerships</h2>
              <p className="text-3xl font-bold text-green-400">
                {partnerships.filter((p) => p.status === "Active").length}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-300">Pending Requests</h2>
              <p className="text-3xl font-bold text-yellow-400">
                {partnerships.filter((p) => p.status === "Pending").length}
              </p>
            </div>
          </div>
        </div>

        {/* Partnership Table */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">📋 Partnership List</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-3 text-left text-gray-400 font-medium">Company</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Contact</th>
                  <th className="p-3 text-left text-gray-400 font-medium">Status</th>
                  <th className="p-3 text-center text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partnerships.map((partner) => (
                  <tr key={partner.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-3 text-white">{partner.company}</td>
                    <td className="p-3 text-gray-300">{partner.contact}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          partner.status === "Active" 
                            ? "bg-green-600" 
                            : "bg-yellow-600"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {partner.status === "Pending" && (
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
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
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
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