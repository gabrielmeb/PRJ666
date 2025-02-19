import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ strengths: "", areas_for_growth: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchProfile = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProfile(data);
      setFormData({ strengths: data.strengths, areas_for_growth: data.areas_for_growth });
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    setLoading(false);
    alert("Profile Updated!");
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-10">
        <h1 className="text-2xl font-bold">User Profile</h1>

        {profile ? (
          <div className="mt-5 p-4 bg-white shadow-md rounded-lg">
            <input
              type="text"
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Strengths"
            />
            <input
              type="text"
              value={formData.areas_for_growth}
              onChange={(e) => setFormData({ ...formData, areas_for_growth: e.target.value })}
              className="w-full px-4 py-2 border rounded-md mt-2"
              placeholder="Areas for Growth"
            />
            <button onClick={handleUpdate} className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
