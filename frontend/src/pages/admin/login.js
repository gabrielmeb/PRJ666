"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setApiError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Login failed");

      if (!["Admin", "SuperAdmin", "Moderator"].includes(result.admin.role)) {
        throw new Error("Unauthorized: You do not have permission.");
      }

      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminInfo", JSON.stringify(result.admin));

      router.push("/admin/dashboard");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden px-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-10 flex items-center text-white/80 hover:text-white hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      {/* Centered Login Box */}
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Admin Login</h2>
          <p className="text-white/70 text-center mb-6">Access the BeBetter admin panel</p>

          {apiError && (
            <div className="bg-red-500/10 text-red-300 p-3 rounded-md text-sm text-center mb-4">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-white/90">
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
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg bg-blue-600 font-semibold text-white transition-all duration-300 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:shadow-lg"
              }`}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-white/60 text-sm text-center">
            Not an admin?{" "}
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
            >
              Return Home
            </Link>
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
