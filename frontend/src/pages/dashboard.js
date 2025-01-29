import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-4">Dashboard</h1>

        {/* Profile Section */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-gray-600">Name:</p>
          <p className="text-gray-600">Email:</p>
        </div>

        {/* Recommendations Section */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold">Personalized Recommendations</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>Join a mindfulness group</li>
            <li>Finish your readings</li>
            <li>Try a meditation app</li>
          </ul>
        </div>

        {/* Progress Tracking Section */}
        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold">Your Progress</h2>
          <p className="text-gray-600">Fitness: 70%</p>
          <p className="text-gray-600">Mental Well-being: 85%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
