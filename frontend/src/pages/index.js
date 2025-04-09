"use client";
import { useState } from "react";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  const [step, setStep] = useState(0);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  const steps = [
    {
      title: "Welcome to BeBetter",
      description: "Your personal growth companion to set goals, track progress, and become your best self.",
      icon: "👋"
    },
    {
      title: "Track Your Progress",
      description: "Monitor your improvements with insightful analytics and real-time feedback.",
      icon: "📊"
    },
    {
      title: "Set Achievable Goals",
      description: "Define goals tailored to your lifestyle and get personalized growth insights.",
      icon: "🎯"
    },
    {
      title: "Join the Community",
      description: "Connect with like-minded individuals and grow together!",
      icon: "👥"
    },
    {
      title: "Ready to Begin?",
      description: "Create an account and start your journey today!",
      icon: "🚀"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
      {/* Admin Login Button */}
      <div className="absolute top-6 right-6 z-10">
        <Link
          href="/admin/login"
          className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/20"
        >
          Admin Login
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        {/* Animated Title */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <TypeAnimation
              sequence={["BeBetter", 1000, "", 250, "BeBetter", 1000]}
              wrapper="span"
              speed={25}
              cursor={true}
              repeat={Infinity}
              className="inline-block"
              aria-live="polite"
            />
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
            Elevate your life with personalized growth insights
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-center max-w-2xl mx-auto mb-12 text-white/90 animate-fade-in-delay">
          Track progress, set goals, and become the best version of yourself with our comprehensive personal development platform.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-delay-2">
          <Link
            href="/user/login"
            className="px-8 py-3 rounded-full bg-white text-slate-800 font-semibold shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            Sign In <span className="ml-2">→</span>
          </Link>
          <button
            onClick={() => setIsOnboardingVisible(true)}
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full animate-fade-in-delay-3">
          {steps.slice(0, 3).map((step, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer hover:bg-white/10"
            >
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-white/80">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Modal */}
      {isOnboardingVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-slate-700 animate-scale-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
              onClick={() => setIsOnboardingVisible(false)}
            >
              ✕
            </button>

            <div className="text-center mb-2 text-4xl">
              {steps[step].icon}
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">
              {steps[step].title}
            </h2>
            <p className="text-gray-300 text-center mb-8">
              {steps[step].description}
            </p>

            <div className="flex justify-between items-center mt-8">
              <button
                className={`px-5 py-2 rounded-lg font-medium ${step === 0 ? "opacity-50 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600"}`}
                disabled={step === 0}
                onClick={() => setStep(prev => prev - 1)}
              >
                Back
              </button>

              <div className="flex items-center space-x-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === step ? "bg-white" : "bg-slate-600"}`}
                  />
                ))}
              </div>

              {step < steps.length - 1 ? (
                <button
                  className="px-5 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 flex items-center"
                  onClick={() => setStep(prev => prev + 1)}
                >
                  Next <span className="ml-1">→</span>
                </button>
              ) : (
                <Link
                  href="/user/register"
                  className="px-5 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign Up Now
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-3 {
          animation: fadeIn 0.6s ease-out 0.6s forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}