// import { useState } from "react";
// import Link from "next/link";

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleToggle = () => setIsOpen(!isOpen);

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center py-4">

//           {/* Logo */}
//           <Link href="/dashboard" className="text-2xl font-bold text-purple-600">
//             BeBetter <span className="inline-block">🚀</span>
//           </Link>

//           {/* Desktop Nav Links */}
//           <div className="hidden md:flex space-x-6">
//             <Link
//               href="/dashboard"
//               className="text-gray-600 hover:text-purple-600 transition-colors"
//             >
//               Dashboard
//             </Link>
//             <Link
//               href="/community"
//               className="text-gray-600 hover:text-purple-600 transition-colors"
//             >
//               Community
//             </Link>
//             <Link
//               href="/library"
//               className="text-gray-600 hover:text-purple-600 transition-colors"
//             >
//               Content Library
//             </Link>
//             <Link
//               href="/profile"
//               className="text-gray-600 hover:text-purple-600 transition-colors"
//             >
//               Profile
//             </Link>
//           </div>

//           {/* Auth Button (Desktop) */}
//           <div className="hidden md:flex">
//             <Link
//               href="/auth/login"
//               className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
//             >
//               Login
//             </Link>
//           </div>

//           {/* Mobile Menu Toggle */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={handleToggle}
//               type="button"
//               className="text-gray-600 hover:text-purple-600 focus:outline-none"
//               aria-label="Toggle menu"
//             >
//               {isOpen ? (
//                 // Close Icon (X)
//                 <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
//                   <path
//                     fillRule="evenodd"
//                     clipRule="evenodd"
//                     d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"
//                   />
//                 </svg>
//               ) : (
//                 // Hamburger Icon
//                 <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
//                   <path
//                     fillRule="evenodd"
//                     clipRule="evenodd"
//                     d="M4 5h16a1 1 0 110 2H4a1 1 0 010-2zm0 6h16a1 1 0 110 2H4a1 1 0 010-2zm16 6H4a1 1 0 110-2h16a1 1 0 110 2z"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu Links */}
//         {isOpen && (
//           <div className="md:hidden flex flex-col space-y-2 pb-4">
//             <Link
//               href="/dashboard"
//               className="block text-gray-600 hover:text-purple-600 transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               Dashboard
//             </Link>
//             <Link
//               href="/community"
//               className="block text-gray-600 hover:text-purple-600 transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               Community
//             </Link>
//             <Link
//               href="/library"
//               className="block text-gray-600 hover:text-purple-600 transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               Content Library
//             </Link>
//             <Link
//               href="/profile"
//               className="block text-gray-600 hover:text-purple-600 transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               Profile
//             </Link>
//             {/* Auth Button (Mobile) */}
//             <Link
//               href="/auth/login"
//               className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors w-fit"
//               onClick={() => setIsOpen(false)}
//             >
//               Login
//             </Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }



import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

export default function Navbar({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between py-3">
        {/* Logo on the left */}
        <Link href="/">
          <span className="text-2xl font-bold text-purple-600 cursor-pointer">
            BeBetter <span className="inline-block">🚀</span>
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
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
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
          {/* {isModalOpen && (
            <>

              <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>

              <div
                ref={modalRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-2"
              >
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsModalOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsModalOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </>
           )}  */}
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
          {user?.profileImage ? (
            <Image
              src={user.profileImage}
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
          <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
          <p className="text-xs text-gray-500">View Profile</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="py-2">
        <Link
          href="/profile"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          onClick={() => setIsModalOpen(false)}
        >
          <span>👤</span> Profile
        </Link>
        <Link
          href="/settings"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          onClick={() => setIsModalOpen(false)}
        >
          <span>⚙️</span> Settings
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t"></div>

      {/* Logout */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
      >
        🚪 Logout
      </button>
    </div>
  </>
)}

        </div>
      </div>
    </nav>
  );
}


