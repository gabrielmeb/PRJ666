import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";

export default function Profile() {
  // Basic user fields
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [profileImage, setProfileImage] = useState(null); // local File object
  const [previewImage, setPreviewImage] = useState("");

  // Extended profile fields
  const [strengths, setStrengths] = useState([]);
  const [areasForGrowth, setAreasForGrowth] = useState([]);

  const [loading, setLoading] = useState(false);

  // 1) On mount, read localStorage for token + userId
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    const storedUserId = localStorage.getItem("userId");
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
    } else {
      console.warn("No token or userId found in localStorage. Redirect or prompt login!");
      // e.g. router.push("/login");
    }
  }, []);

  // 2) Once we have token + userId, fetch the user + profile data
  useEffect(() => {
    if (!token || !userId) return; // Wait until we have them

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // -- a) Fetch basic user info --
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) {
          throw new Error(`Failed user fetch: ${userRes.status} ${userRes.statusText}`);
        }

        const userData = await userRes.json();

        setFirstName(userData.first_name || "");
        setLastName(userData.last_name || "");
        setEmail(userData.email || "");
        if (userData.date_of_birth) {
          // e.g. "2024-01-01T00:00:00.000Z" => "2024-01-01"
          setDateOfBirth(userData.date_of_birth.slice(0, 10));
        }
        if (userData.profile_image) {
          setPreviewImage(userData.profile_image);
        }
        if (Array.isArray(userData.preferences)) {
          setPreferences(userData.preferences);
        }

        // -- b) Fetch extended profile info --
        const profileRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Possibly returns 404 if profile not created yet
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.strengths) setStrengths(profileData.strengths);
          if (profileData.areas_for_growth) setAreasForGrowth(profileData.areas_for_growth);
        } else if (profileRes.status === 404) {
          console.log("No extended profile found for this user.");
        } else {
          throw new Error(`Failed profile fetch: ${profileRes.status} ${profileRes.statusText}`);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user/profile data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, userId]);

  // 3) Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 4) Save basic user info (including file upload via FormData)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!token || !userId) {
      alert("No auth token or userId found!");
      return;
    }
    try {
      setLoading(true);

      // Build FormData for the file + text fields
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("date_of_birth", dateOfBirth);

      // If preferences is an array, we must JSON-stringify for the backend
      formData.append("preferences", JSON.stringify(preferences));

      // "profile_image" must match .single("profile_image") in your userRoutes.js
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to save user info: ${res.status} ${res.statusText}`);
      }

      alert("Basic user info updated!");
      setLoading(false);
    } catch (error) {
      console.error("Error saving user info:", error);
      setLoading(false);
    }
  };

  // 5) Save extended profile info (JSON body, no file)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token || !userId) {
      alert("No auth token or userId found!");
      return;
    }
    try {
      setLoading(true);

      const body = {
        strengths,
        areas_for_growth: areasForGrowth,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to save extended profile: ${res.status} ${res.statusText}`);
      }

      alert("Extended profile updated!");
      setLoading(false);
    } catch (error) {
      console.error("Error saving extended profile:", error);
      setLoading(false);
    }
  };

  // Example for adding a new strength
  const handleAddStrength = () => {
    setStrengths([...strengths, { category: "", score: 5 }]);
  };
  const handleStrengthChange = (index, field, value) => {
    const updated = [...strengths];
    updated[index][field] = value;
    setStrengths(updated);
  };

  // Example for adding a new area for growth
  const handleAddGrowthArea = () => {
    setAreasForGrowth([...areasForGrowth, { category: "", priority: 3 }]);
  };
  const handleGrowthChange = (index, field, value) => {
    const updated = [...areasForGrowth];
    updated[index][field] = value;
    setAreasForGrowth(updated);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Layout>
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Your Profile</h1>

      {/* ============ BASIC USER FIELDS FORM ============= */}
      <form onSubmit={handleSaveUser} className="space-y-4 mb-8">
        <div>
          <label className="block font-semibold mb-1">First Name</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Last Name</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            className="border rounded w-full p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Date of Birth</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Preferences (comma-separated)</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            placeholder="e.g. reading, coding"
            value={preferences.join(", ")}
            onChange={(e) =>
              setPreferences(
                e.target.value.split(",").map((p) => p.trim())
              )
            }
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Profile Image</label>
          <input type="file" onChange={handleImageChange} />
          {previewImage && (
            <div className="mt-2">
              <img
                src={previewImage}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Basic Info
        </button>
      </form>

      {/* ============ EXTENDED PROFILE FORM ============= */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <h2 className="text-xl font-semibold">Extended Profile</h2>

        {/* Strengths */}
        <div>
          <label className="block font-semibold mb-2">Strengths</label>
          {strengths.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                className="border rounded p-2"
                placeholder="Category"
                value={item.category}
                onChange={(e) => handleStrengthChange(idx, "category", e.target.value)}
              />
              <input
                type="number"
                min={1}
                max={10}
                className="border rounded p-2 w-20"
                placeholder="Score"
                value={item.score}
                onChange={(e) => handleStrengthChange(idx, "score", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddStrength}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Add Strength
          </button>
        </div>

        {/* Areas for Growth */}
        <div>
          <label className="block font-semibold mb-2">Areas for Growth</label>
          {areasForGrowth.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                className="border rounded p-2"
                placeholder="Category"
                value={item.category}
                onChange={(e) => handleGrowthChange(idx, "category", e.target.value)}
              />
              <input
                type="number"
                min={1}
                max={5}
                className="border rounded p-2 w-20"
                placeholder="Priority"
                value={item.priority}
                onChange={(e) => handleGrowthChange(idx, "priority", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddGrowthArea}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Add Growth Area
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Extended Profile
        </button>
      </form>
    </div>
    </Layout>
  );
}
