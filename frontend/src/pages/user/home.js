import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";
import { apiFetch } from "@/utils/api";

const Home = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progressList, setProgressList] = useState([]); // All progress from multiple goals
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to compute average progress across all goals
  const averageProgress = () => {
    if (!progressList.length) return 0;
    const total = progressList.reduce(
      (sum, p) => sum + (p.progress_percentage || 0),
      0
    );
    return Math.round(total / progressList.length);
  };

  // Fetch user + data
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      router.push("/user/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) Get the userProfile by userId
        const profile = await apiFetch(`/api/user-profiles/${userId}`).catch(err => {
          if (err.message.includes("404")) {
            console.error("No user profile found for this user ID.");
            return null;
          }
          throw err;
        });
        if (!profile) {
          // If no profile found, we can still proceed but show empty data.
          setUserProfile(null);
          setGoals([]);
          setProgressList([]);
          setRecommendations([]);
          return;
        }

        setUserProfile(profile);
        const profileId = profile._id; // This is important for goals & progress.

        // 2) Fetch goals (using profileId)
        let fetchedGoals = [];
        try {
          fetchedGoals = await apiFetch(`/api/goals/user/${profileId}`);
        } catch (err) {
          if (err.message.includes("404")) {
            // Means no goals yet
            fetchedGoals = [];
          } else {
            throw err;
          }
        }
        setGoals(fetchedGoals);

        // 3) Fetch all progress for each goal (using goal_id)
        let allProgress = [];
        try {
          if (fetchedGoals.length) {
            // Fetch progress for each goal in parallel
            const progressPromises = fetchedGoals.map(goal =>
              apiFetch(`/api/progress/goal/${goal._id}`).catch(err => {
                if (err.message.includes("404")) {
                  // No progress for this particular goal
                  return [];
                }
                throw err;
              })
            );
            const progressResults = await Promise.all(progressPromises);
            allProgress = progressResults.flat(); // Flatten to single array
          }
        } catch (err) {
          console.error("Failed to load progress:", err.message);
        }
        setProgressList(allProgress);

        // 4) Fetch recommendations using userId (not profileId)
        let fetchedRecs = [];
        try {
          fetchedRecs = await apiFetch(`/api/recommendations/user/${userId}`);
        } catch (err) {
          if (err.message.includes("404")) {
            fetchedRecs = [];
          } else {
            console.error("Failed to load recommendations:", err.message);
          }
        }
        setRecommendations(fetchedRecs);
      } catch (error) {
        console.error("Error loading data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getFirstName = () => userProfile?.user_id?.first_name || "User";

  if (loading) {
    return (
      <Layout>
        <p className="text-center text-lg text-gray-400">
          Loading your dashboard...
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 bg-black text-white p-4">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold">
            Welcome, {getFirstName()}{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Here’s your personalized overview
          </p>
        </header>

        {/* Goals Section */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Goals</h2>
          {goals.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {goals.slice(0, 3).map(goal => (
                <li key={goal._id} className="text-lg">
                  {goal.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              You haven&apos;t set any goals yet.{" "}
              <Link
                href="/user/goals"
                className="text-blue-600 hover:underline font-semibold"
              >
                Set Goals
              </Link>
            </p>
          )}
        </section>

        {/* Progress Section */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Progress Overview</h2>
          {progressList.length > 0 ? (
            <>
              <div className="w-full bg-gray-600 rounded-full h-6">
                <div
                  className="bg-green-500 h-6 rounded-full transition-all duration-300"
                  style={{ width: `${averageProgress()}%` }}
                />
              </div>
              <p className="text-sm text-gray-300 mt-3">
                {averageProgress()}% average progress
              </p>
            </>
          ) : (
            <p className="text-gray-500">
              No progress data available.{" "}
              <Link
                href="/user/goals"
                className="text-blue-600 hover:underline font-semibold"
              >
                Start Tracking Progress
              </Link>
            </p>
          )}
        </section>

        {/* Recommendations Section */}
        <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
          {recommendations.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {recommendations.slice(0, 3).map(rec => (
                <li key={rec._id} className="text-lg">
                  {rec.content}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No recommendations available yet. Keep using the platform to
              receive personalized suggestions.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
