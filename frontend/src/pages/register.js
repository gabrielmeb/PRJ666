// import React from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const Register = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = async (data) => {
//     try {
//       const response = await axios.post("http://localhost:8080/api/users/register", data);
//       toast.success("Registration successful! 🎉");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Registration failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Logo Section */}
//       <div className="absolute top-6 left-8">
//         <h1 className="text-4xl font-bold text-blue-600" style={{ fontFamily: "'Righteous', cursive" }}>
//           BeBetter
//         </h1>
//       </div>

//       {/* Registration Form */}
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//           <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             {/* Name */}
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
//                 Name
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 className={`w-full p-3 border ${
//                   errors.name ? "border-red-500" : "border-gray-300"
//                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
//                 placeholder="Enter your name"
//                 {...register("name", { required: "Name is required." })}
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
//               )}
//             </div>

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

//             {/* Password */}
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
//                 placeholder="Create a password"
//                 {...register("password", {
//                   required: "Password is required.",
//                   minLength: {
//                     value: 6,
//                     message: "Password must be at least 6 characters long.",
//                   },
//                 })}
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//               )}
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Register
//             </button>
//           </form>

//           {/* Notifications */}
//           <ToastContainer />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import Register from "../components/Register";
export default function RegisterPage() {
  return <Register />;
}
