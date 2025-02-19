import { useState } from "react";
import Layout from "@/components/Layout";

const communityGroups = [
  { id: 1, name: "🚀 Productivity Enthusiasts", members: 120, joined: false },
  { id: 2, name: "💪 Fitness & Wellness", members: 95, joined: true },
  { id: 3, name: "🧘 Mindfulness & Meditation", members: 78, joined: false },
];

export default function Community() {
  const [groups, setGroups] = useState(communityGroups);

  const toggleJoin = (id) => {
    setGroups(
      groups.map((group) =>
        group.id === id ? { ...group, joined: !group.joined } : group
      )
    );
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">🌍 Community</h1>
      <p className="text-gray-500">Connect with like-minded people and grow together.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p className="text-sm text-gray-600">{group.members} members</p>
            <button
              onClick={() => toggleJoin(group.id)}
              className={`mt-2 px-4 py-2 rounded ${
                group.joined ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {group.joined ? "Joined" : "Join Group"}
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
