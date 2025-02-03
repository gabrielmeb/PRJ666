import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/user/register", data);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex">
  {/* Left Side: Message Section */}
  <div className="w-2/5 bg-gradient-to-b from-blue-500 to-blue-700 text-white p-8 flex flex-col justify-center items-center">
  <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Righteous', cursive" }}>
          BeBetter
        </h1>
    
  <h1 className="text-4xl mb-4 p-10">A Path to Better Living</h1>
  
  <ul className="space-y-6">
  <li className="flex items-start space-x-4">
    <img
      src="/images/graph.png"
      alt="Track Progress Icon"
      className="w-10 h-10 rounded-full" 
    />
    <div>
      <h3 className="font-semibold text-xl">Track progress</h3>
      <p className="text-md mt-2">Stay on top of your goals with our easy-to-use progress tracker, designed to keep you motivated and on track.</p>
    </div>
  </li>

  <li className="flex items-start space-x-4">
    <img
      src="/images/friend.png"
      alt="Connect with Others Icon"
      className="w-10 h-10 rounded-full"
    />
    <div>
      <h3 className="font-semibold text-xl">Connect with others</h3>
      <p className="text-md mt-2">Join a community that supports your journey to better sleep, mindfulness, and well-being.</p>
    </div>
  </li>

  <li className="flex items-start space-x-4">
    <img
      src="/images/personalization.png"
      alt="Personalized Recommendations Icon"
      className="w-10 h-10 rounded-full" 
    />
    <div>
      <h3 className="font-semibold text-xl">Personalized recommendations</h3>
      <p className="text-md mt-2">Receive tailored recommendations based on your preferences and progress to enhance mindfulness and well-being.</p>
    </div>
  </li>
</ul>
</div>

  {/* Right Side: Registration Form Section */}
  <div className="w-3/5 flex items-center justify-center bg-gray-100 p-8">
    <div className="bg-white p-12 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl mb-6 text-center">Create your account</h2>
      <p className="text-center mb-4 text-sm">
            <span>Have a BeBetter account? </span>
            <Link
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Log in
            </Link>
          </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full p-3 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address.",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`w-full p-3 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Create a password"
            {...register("password", {
              required: "Password is required.",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long.",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Register
        </button>
      </form>

      {/* Notifications */}
      <ToastContainer />
    </div>
  </div>
</div>
  );
};

export default Register;
