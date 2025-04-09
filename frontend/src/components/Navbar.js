import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import {
  CircleUserRound,
  Rocket,
  UserRoundPen,
  Settings,
  LogOut,
} from "lucide-react";

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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user profile:", err));
  }, []);

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

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userId");
      router.push("/");
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/user/home">
          <span className="text-2xl font-bold text-purple-500 cursor-pointer flex items-center gap-2">
            BeBetter <Rocket size={20} />
          </span>
        </Link>

        {/* User Avatar */}
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
                  className="rounded-full object-cover border-2 border-purple-500"
                />
              ) : (
                <CircleUserRound className="w-10 h-10 text-gray-400" />
              )}
            </div>
          </button>

          {isModalOpen && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

              {/* Modal */}
              <div
                ref={modalRef}
                className="absolute right-0 mt-2 w-56 bg-zinc-800 text-white rounded-lg shadow-xl z-50 border border-zinc-700"
              >
                <div className="flex items-center gap-3 p-4 border-b border-zinc-700">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {user?.user_id?.profile_image ? (
                      <Image
                        src={user.user_id.profile_image}
                        alt="User Avatar"
                        width={48}
                        height={48}
                        className="rounded-full border border-zinc-600 object-cover"
                      />
                    ) : (
                      <CircleUserRound className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {user?.user_id?.first_name} {user?.user_id?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">View Profile</p>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-2">
                  <Link
                    href="/user/profile"
                    className="px-4 py-2 hover:bg-zinc-700 flex items-center gap-2 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <UserRoundPen size={18} />
                    My Profile
                  </Link>
                </div>

                <div className="border-t border-zinc-700"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-zinc-700 transition"
                >
                  <LogOut className="inline mr-1" size={18} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
