import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

const Home = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      router.push("/user/login");
      return;
    }

    // Fetch User Profile
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error("Error fetching user profile:", err));

    // Fetch Goals
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/goals/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(err => console.error("Error fetching goals:", err));

    // Fetch Progress
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgress(data))
      .catch(err => console.error("Error fetching progress:", err));

    // Fetch AI Recommendations
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error("Error fetching recommendations:", err));

    // Fetch Notifications
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNotifications(data.notifications))
      .catch(err => console.error("Error fetching notifications:", err));
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.user_id?.first_name} 👋</h1>
      <p className="text-gray-500">Here&apos;s your progress and recommendations.</p>

      {/* Goal Progress */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Goal Progress</h2>
        <div className="mt-4 bg-gray-200 rounded-full h-4">
          <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${progress ? progress[0]?.progress_percentage || 0 : 0}%` }}></div>
        </div>
        <p className="text-gray-600 mt-2">{progress ? progress[0]?.progress_percentage || 0 : 0}% completed</p>
      </div>

      {/* Recommendations */}
      {/* <div className="mt-6 grid grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{rec.type}</h3>
            <p>{rec.content}</p>
          </div>
        ))}
      </div>

      {/* Notifications }
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <ul className="mt-2 text-gray-600">
          {notifications.map((note, index) => (
            <li key={index}>{note.message}</li>
          ))}
        </ul>
      </div> */}
    </Layout>
  );
};

export default Home;
