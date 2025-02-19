import Link from "next/link";
import { RiAlertLine } from "react-icons/ri";

export default function WarningPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-center items-center mb-4">
      <RiAlertLine size={96} className="text-red-600" />
    </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Warning: Restricted Area
        </h1>
        <p className="text-gray-600 mb-6">
          You are about to enter an administrative space. Proceed with caution.
        </p>
        <div className="flex flex-col space-y-4">
          <Link href="/admin/login">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition">
              Proceed to Admin Login
            </button>
          </Link>
          <Link href="/home">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition">
              Go to User Homepage
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            Go Back to Previous Page
          </button>
          <Link href="/admin/contact">
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded transition">
              Contact Admin
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
