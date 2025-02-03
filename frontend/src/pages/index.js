import Button from "@/components/Button";
import Image from "next/image";

export default function Home() {
  return (
    <section className="w-full bg-gray-100 text-center">
      <div className="relative w-full h-64">
        <Image 
          src="/images/jasper-lake-hero-banner.webp" 
          alt="BeBetter Hero Image" 
          layout="fill" 
          objectFit="cover" 
          quality={75} 
        />
      </div>
      <div className="max-w-4xl mx-auto mt-12 text-left px-6">
        <h1 className="text-5xl font-bold text-gray-800">Calm your mind. Change your life.</h1>
        <p className="mt-6 text-xl text-gray-600 leading-relaxed">
          BeBetter is your personal self-improvement companion, designed to help you build better habits,
          stay motivated, and track your progress. Our app provides personalized content to manage stress,
          improve sleep, and enhance mindfulness, helping you become the best version of yourself.
        </p>
        <div className="mt-8">
          <Button className="px-6 py-3 text-lg">Try BeBetter for Free</Button>
        </div>
      </div>
      {/* New section with the list of features */}
      <div className="mt-16 px-10">
        <ul className="flex justify-center space-x-8">
          <li>
            <button className="text-gray-800 p-6 rounded-xl shadow-xl hover:bg-blue-500 transform transition-transform duration-200 hover:scale-105 hover:text-white text-left">
              <img src="/images/graph.png" alt="Stress Icon" className="w-10 h-10 mb-4" />
              <h3 className="font-semibold text-xl">Track progress.</h3>
              <p className="text-md mt-2">Stay on top of your goals with our easy-to-use progress tracker, designed to keep you motivated and on track.</p>
              <span className="text-blue-500 mt-2 block">Learn More</span>
            </button>
          </li>
          <li>
            <button className="text-gray-800 p-6 rounded-xl shadow-xl hover:bg-blue-500 transform transition-transform duration-200 hover:scale-105 hover:text-white text-left">
              <img src="/images/friend.png" alt="Stress Icon" className="w-10 h-10 mb-4" />
              <h3 className="font-semibold text-xl">Connect with others.</h3>
              <p className="text-md mt-2">Join a community that supports your journey to better sleep, mindfulness, and well-being.</p>
              <span className="text-blue-500 mt-2 block">Learn More</span>
            </button>
          </li>
          <li>
            <button className="text-gray-800 p-6 rounded-xl shadow-xl hover:bg-blue-500 transform transition-transform duration-200 hover:scale-105 hover:text-white text-left">
              <img src="/images/personalization.png" alt="Stress Icon" className="w-10 h-10 mb-4" />
              <h3 className="font-semibold text-xl">Personalized recommendations.</h3>
              <p className="text-md mt-2">Receive tailored recommendations based on your preferences and progress to enhance mindfulness and well-being.</p>
              <span className="text-blue-500 mt-2 block">Learn More</span>
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}