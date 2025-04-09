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
        <p className="text-center text-lg text-gray-400">Loading your dashboard...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 bg-black text-white">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white">Welcome, {getFirstName()} 👋</h1>
          <p className="text-lg text-gray-400 mt-2">Here’s your personalized overview</p>
        </header>

        {/* Goals Section */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Your Goals</h2>
          {goals.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {goals.slice(0, 3).map((goal) => (
                <li key={goal._id} className="text-lg">{goal.description}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              You haven&apos;t set any goals yet.{" "}
              <Link href="/user/goals" className="text-blue-600 hover:underline font-semibold">Set Goals</Link>
            </p>
          )}
        </section>

        {/* Progress Section */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Progress Overview</h2>
          {progress.length > 0 ? (
            <>
              <div className="w-full bg-gray-600 rounded-full h-6">
                <div
                  className="bg-green-500 h-6 rounded-full transition-all duration-300"
                  style={{ width: `${averageProgress()}%` }}
                />
              </div>
              <p className="text-sm text-gray-300 mt-3">{averageProgress()}% average progress</p>
            </>
          ) : (
            <p className="text-gray-500">
              No progress data available.{" "}
              <Link href="/user/goals" className="text-blue-600 hover:underline font-semibold">Start Tracking Progress</Link>
            </p>
          )}
        </section>

        {/* Recommendations Section */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">AI Recommendations</h2>
          {recommendations.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {recommendations.slice(0, 3).map((rec) => (
                <li key={rec._id} className="text-lg">{rec.content}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No recommendations available yet. Keep using the platform to receive personalized suggestions.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
