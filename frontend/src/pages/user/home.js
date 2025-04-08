import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { apiFetch } from "@/utils/api"; 

const Home = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Get token and userId from localStorage to check authentication.
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      router.push("/user/login");
      return;
    }

    // Async function to fetch all user data.
    async function fetchData() {
      // Fetch User Profile
      try {
        const userProfile = await apiFetch(`/api/user-profiles/${userId}`);
        setUser(userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error.message);
      }

      // Fetch Goals
      try {
        const userGoals = await apiFetch(`/api/goals/user/${userId}`);
        setGoals(userGoals);
      } catch (error) {
        console.error("Error fetching goals:", error.message);
      }

      // Fetch Progress
      try {
        const userProgress = await apiFetch(`/api/progress/user/${userId}`);
        setProgress(userProgress);
      } catch (error) {
        console.error("Error fetching progress:", error.message);
      }

      // Fetch AI Recommendations
      try {
        const userRecommendations = await apiFetch(`/api/recommendations/user/${userId}`);
        setRecommendations(userRecommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error.message);
      }

      // Fetch Notifications
      try {
        const notifData = await apiFetch("/api/notifications");
        setNotifications(notifData.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    }

    fetchData();
  }, [router]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {user?.user_id?.first_name} 👋
      </h1>
      <p className="text-gray-500">Here&apos;s your progress and recommendations.</p>

      {/* Goal Progress */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Goal Progress</h2>
        <div className="mt-4 bg-gray-200 rounded-full h-4">
          <div
            className="bg-purple-600 h-4 rounded-full"
            style={{
              width: `${progress ? progress[0]?.progress_percentage || 0 : 0}%`
            }}
          ></div>
        </div>
        <p className="text-gray-600 mt-2">
          {progress ? progress[0]?.progress_percentage || 0 : 0}% completed
        </p>
      </div>

      {/* Recommendations */}
      {/* 
      <div className="mt-6 grid grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{rec.type}</h3>
            <p>{rec.content}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {/*
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <ul className="mt-2 text-gray-600">
          {notifications.map((note, index) => (
            <li key={index}>{note.message}</li>
          ))}
        </ul>
      </div>
      */}
    </Layout>
  );
};

export default Home;
