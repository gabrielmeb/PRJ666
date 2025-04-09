"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setApiError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("userToken", result.token);
      localStorage.setItem("userId", result.user._id);

      router.push("/user/home");
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/20"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/10 hover:border-white/20 transition-all animate-fade-in">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-center text-white/80 mb-6">
            Log in to continue your journey at BeBetter
          </p>

          {/* API Error */}
          {apiError && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded-md mb-4 border border-red-500/30">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Please enter a valid email address",
                  },
                })}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder:text-white/60 hover:border-white/20 transition-all"
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.email.message}
                </p>
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
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder:text-white/60 hover:border-white/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/90 transition-all"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 mt-2"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-white/80">
            Don&apos;t have an account yet?{" "}
            <Link 
              href="/user/register" 
              className="text-blue-300 font-semibold hover:text-blue-200 hover:underline transition-all"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}