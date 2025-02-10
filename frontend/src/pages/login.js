// import React from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const Login = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = async (data) => {
//     try {
//       const response = await axios.post("http://localhost:5000/api/user/login", data);
//       toast.success("Login successful! 🎉");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Logo */}
//       <div className="absolute top-6 left-8">
//         <h1 className="text-4xl font-bold text-blue-600" style={{ fontFamily: "'Righteous', cursive" }}>
//           BeBetter
//         </h1>
//       </div>

//       {/* Login */}
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//           <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             {/* Email */}
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 className={`w-full p-3 border ${
//                   errors.email ? "border-red-500" : "border-gray-300"
//                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
//                 placeholder="you@example.com"
//                 {...register("email", {
//                   required: "Email is required.",
//                   pattern: {
//                     value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                     message: "Invalid email address.",
//                   },
//                 })}
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Password Field */}
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 className={`w-full p-3 border ${
//                   errors.password ? "border-red-500" : "border-gray-300"
//                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
//                 placeholder="Enter your password"
//                 {...register("password", {
//                   required: "Password is required.",
//                 })}
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//               )}
//             </div>

//             {/* Forgot Password Link */}
//             <div className="mb-6 text-right">
//               <a 
//                 href="/forgot-password" 
//                 className="text-sm text-blue-600 hover:text-blue-700"
//               >
//                 Forgot your password?
//               </a>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Login
//             </button>

//             {/* Register Link */}
//             <div className="mt-4 text-center text-sm text-gray-600">
//               Don't have an account?{" "}
//               <a 
//                 href="/register" 
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Register here
//               </a>
//             </div>
//           </form>

//           {/* Toast */}
//           <ToastContainer />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
import Login from "../components/Login";
export default function LoginPage() {
  return <Login />;
}
