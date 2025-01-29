import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" legacyBehavior>
          <a className="text-2xl font-bold">beBetter</a>
        </Link>

        {/* Navigation Links */}
        <div className="space-x-6">
          <Link href="/dashboard" legacyBehavior>
            <a className="hover:underline">Dashboard</a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className="hover:underline">Settings</a>
          </Link>
          <Link href="/login" legacyBehavior>
            <a className="hover:underline">Profile</a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
