import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";
import { apiFetch } from "@/utils/api";

const Home = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      router.push("/user/login");
      return;
    }

    const fetchData = async () => {
      try {
        const profile = await apiFetch(`/api/user-profiles/${userId}`);
        setUserProfile(profile);

        const profileId = profile?._id || userId; // fallback

        const [goals, progress, recommendations] = await Promise.all([
          apiFetch(`/api/goals/user/${profileId}`),
          apiFetch(`/api/progress/user/${userId}`),
          apiFetch(`/api/recommendations/user/${userId}`)
        ]);
        setUserProfile(profile);
        setGoals(goals);
        setProgress(progress);
        setRecommendations(recommendations);
      } catch (error) {
        console.error("Error loading data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getFirstName = () => userProfile?.user_id?.first_name || "User";

  const averageProgress = () => {
    if (!progress.length) return 0;
    const total = progress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0);
    return Math.round(total / progress.length);
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center text-lg text-gray-500">Loading your dashboard...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {getFirstName()} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your personalized overview</p>
        </header>

        {/* Goals Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Your Goals</h2>
          {goals.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {goals.slice(0, 3).map((goal) => (
                <li key={goal._id}>{goal.description}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              You haven&apos;t set any goals yet.{" "}
              <Link href="/user/goals" className="text-blue-600 hover:underline font-medium">Set Goals</Link>
            </p>
          )}
        </section>

        {/* Progress Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Progress Overview</h2>
          {progress.length > 0 ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${averageProgress()}%` }}
                />
              </div>
              <p className="text-sm text-gray-700 mt-2">{averageProgress()}% average progress</p>
            </>
          ) : (
            <p className="text-gray-600">
              No progress data available.{" "}
              <Link href="/user/goals" className="text-blue-600 hover:underline font-medium">Start Tracking Progress</Link>
            </p>
          )}
        </section>

        {/* Recommendations Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">AI Recommendations</h2>
          {recommendations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {recommendations.slice(0, 3).map((rec) => (
                <li key={rec._id}>{rec.content}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              No recommendations available yet. Keep using the platform to receive personalized suggestions.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;