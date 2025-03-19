import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, Rocket, UserRoundPen, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const modalRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      router.push("/user/login");
      return;
    }

    // Fetch user profile
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user profile:", err));
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleProfileClick = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Logout handler
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userId");
      router.push("/");
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between py-3">
        {/* Logo on the left */}
        <Link href="/user/home">
          <span className="text-2xl font-bold text-purple-600 cursor-pointer">
            BeBetter <span className="inline-block"><Rocket/></span>
          </span>
        </Link>

        {/* Profile avatar on the right */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="focus:outline-none flex items-center"
            aria-label="User Profile"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              {user?.user_id?.profile_image ? (
                <Image
                  src={user.user_id.profile_image}
                  alt="User Avatar"
                  fill
                  sizes="40px"
                  className="rounded-full object-cover border-2 border-purple-600"
                />
              ) : (
                <CircleUserRound className="w-10 h-10 text-gray-500" />
              )}
            </div>
          </button>

          {/* Modal: shows when profile image is clicked */}
          {isModalOpen && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>

              {/* Modal Popup */}
              <div
                ref={modalRef}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
              >
                {/* Profile Section */}
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {user?.user_id?.profile_image ? (
                      <Image
                        src={user.user_id.profile_image}
                        alt="User Avatar"
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-300 object-cover"
                      />
                    ) : (
                      <CircleUserRound className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.user_id?.first_name} {user?.user_id?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">View Profile</p>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-2">
                  <Link
                    href="/user/profile"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <span><UserRoundPen/></span>My Profile
                  </Link>
                  
                </div>

                {/* Divider */}
                <div className="border-t"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="inline"/> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}