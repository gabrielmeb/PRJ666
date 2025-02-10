import { FaFacebook , FaTwitter , FaInstagram, FaLinkedin  } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-6">
        {/* Footer Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 lg:gap-6 text-center md:text-left">
          {/* Left: Copyright */}
          <div className="text-gray-400">
            <p className="text-sm">
              © {new Date().getFullYear()}{" "}
              <span className="text-purple-400 font-semibold">BeBetter</span>. All rights reserved.
            </p>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 text-sm space-y-2 md:space-y-0 my-2">

            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              Contact Us
            </a>
          </div>

          {/* Right: Social Icons */}
          <div className="flex justify-center md:justify-end space-x-5">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <FaFacebook  className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <FaTwitter  className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <FaInstagram  className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <FaLinkedin  className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
