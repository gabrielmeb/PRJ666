"use client";
import { useState } from "react";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  const [step, setStep] = useState(0);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  // Onboarding steps
  const steps = [
    { title: "Welcome to BeBetter!", description: "Your personal growth companion to set goals, track progress, and become your best self." },
    { title: "Track Your Progress", description: "Monitor your improvements with insightful analytics and real-time feedback." },
    { title: "Set Achievable Goals", description: "Define goals tailored to your lifestyle and get personalized growth insights." },
    { title: "Join the Community", description: "Connect with like-minded individuals and grow together!" },
    { title: "Ready to Begin?", description: "Create an account and start your journey today!" }
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden">

      {/* Admin Login Button (top-right corner) */}
      <div className="absolute top-4 right-4">
        <Link
          href="/admin/login"
          className="bg-transparent text-black px-1 md:px-3 py-1 text-sm md:text-lg font-semibold hover:text-white transition-colors"
        >
          Admin
        </Link>
      </div>

      {/* Animated Title */}
      <div className="fade-up drop-shadow-lg mb-8" style={{ animationDelay: "0.5s" }}>
        <TypeAnimation
          sequence={["BeBetter", 1000, "", 250, "BeBetter", 1000, "", 250]}
          wrapper="span"
          speed={25}
          cursor={true}
          className="text-5xl font-extrabold mb-8 text-center"
          repeat={Infinity}
          aria-live="polite"
        />
      </div>

      {/* Subtitle / Description */}
      <p className="fade-up text-lg max-w-2xl px-4 text-center" style={{ animationDelay: "1.2s" }}>
        Elevate your life with personalized growth insights. Track progress, set goals, 
        and be the best version of yourself!
      </p>

      {/* Buttons (fade up) */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 mb-12 fade-up" style={{ animationDelay: "1.8s" }}>
        <Link
          href="/login"
          className="px-6 py-2 rounded-full bg-white text-purple-600 text-md font-semibold shadow-md transition-all duration-300 
                    hover:bg-gray-100 hover:shadow-lg hover:scale-105"
        >
          Sign In
        </Link>

        {/* Get Started Button - Triggers Onboarding */}
        <button
          className="px-4 py-2 rounded-full bg-black text-white text-md font-semibold shadow-lg transition-all duration-300 
                    hover:bg-gray-900 hover:shadow-xl hover:scale-105 fade-up"
          onClick={() => setIsOnboardingVisible(true)}
        >
          Get Started
        </button>
      </div>

      {/* Fullscreen Onboarding Guide */}
      {isOnboardingVisible && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white"
          onClick={() => setIsOnboardingVisible(false)} // Close on outside click
        >
          <div 
            className="w-[90%] max-w-lg p-8 bg-gray-900 rounded-2xl shadow-xl text-center relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close (X) Button */}
            <button 
              className="absolute top-3 right-4 text-2xl font-bold text-gray-400 hover:text-white"
              onClick={() => setIsOnboardingVisible(false)}
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold">{steps[step].title}</h2>
            <p className="text-lg mt-3">{steps[step].description}</p>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              {/* Back Button */}
              <button
                className={`px-5 py-2 rounded-lg text-lg font-semibold ${step === 0 ? "opacity-50 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600"}`}
                disabled={step === 0}
                onClick={() => setStep((prev) => prev - 1)}
              >
                Back
              </button>

              {/* Next or Sign Up Now Button */}
              {step < steps.length - 1 ? (
                <button
                  className="px-5 py-2 bg-purple-600 rounded-lg text-lg font-semibold hover:bg-purple-700"
                  onClick={() => setStep((prev) => prev + 1)}
                >
                  Next
                </button>
              ) : (
                <Link
                  href="/register"
                  className="px-5 py-2 bg-green-600 rounded-lg text-lg font-semibold hover:bg-green-700"
                >
                  Sign Up Now
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

