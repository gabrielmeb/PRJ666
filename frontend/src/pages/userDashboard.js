import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchUserData = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserData(data);
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-10">
        <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>

        {userData ? (
          <div className="mt-5 p-4 bg-white shadow-md rounded-lg">
            <p><strong>Name:</strong> {userData.first_name} {userData.last_name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Goals:</strong> {userData.goals.length} goals</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
