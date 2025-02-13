import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle form submission
  const onSubmit = async (formData) => {
    setApiError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Check if the logged-in user is an admin
      if (result.admin.role !== "Admin" && result.admin.role !== "SuperAdmin") {
        throw new Error("Unauthorized: You are not an admin");
      }

      // Store token in localStorage
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminInfo", JSON.stringify(result.admin));

      // Redirect to admin dashboard upon successful login
      router.push("/admin/dashboard");
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 px-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center font-semibold text-gray-700 hover:text-gray-900 hover:underline"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Back
      </button>

      {/* Login Form */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
        <p className="text-gray-500 mt-2">Access the BeBetter admin panel</p>

        {/* Display API errors */}
        {apiError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Admin Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Admin Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-gray-500">
          Not an admin?{" "}
          <Link href="/" className="text-purple-600 font-semibold hover:underline">
            Return Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
