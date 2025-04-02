import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import SplineBulbImage from "../components/SplineBulbImage.jsx";

const IntroPage = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <div className="w-full flex items-center justify-between px-10 py-4">
        {/* Logo Container */}
        <div className="flex items-center gap-2">
          <img 
            src="3.png"
            alt="MENTORME"
            className="h-12 w-12 object-contain"
          />
          <img 
            src="2.png"
            alt="MENTORME"
            className="h-12 w-50 object-contain -ml-2"
          />
        </div>

        <nav className="flex items-center gap-6">
          {!authUser ? (
            <>
              <a
                href="#"
                className="font-semibold hover:text-gray-300"
                onClick={() => navigate("/login")}
              >
                LOGIN
              </a>
              <a
                href="#"
                className="rounded-full bg-white px-4 py-2 text-black shadow-md hover:bg-gray-200"
                onClick={() => navigate("/signup")}
              >
                SIGN UP
              </a>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium">👋 {authUser.fullName}</span>
              <button
                onClick={logout}
                className="rounded-full bg-red-600 px-4 py-2 text-white shadow-md hover:bg-red-700"
              >
                LOGOUT
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center px-8 py-16">
        <div className="flex w-full max-w-6xl items-center justify-between">
          {/* Left Section */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              THE NEW LINKING
              <br />
              ERA IS HERE.
            </h1>
            <p className="text-xl tracking-wide">THINK-LINK-GROW</p>
            <button
              className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-lg font-semibold shadow-lg transition hover:bg-purple-700"
              onClick={() => navigate("/login")}
            >
              Let's link <span className="inline-block ml-1">🔗</span>
            </button>
          </div>

          {/* Right Section - 3D Model */}
          <div className="w-[500px] h-[500px]">
            <SplineBulbImage />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-black px-8 py-16 mt-1">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold">Why Choose MentorMe?</h2>
          <p className="mb-12 text-center text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            {[
              {
                title: "User Verification",
                description: "Only bona-fide, high-reputation professionals and verified aspiring mentees."
              },
              {
                title: "Mentor-Mentee Matchmaking",
                description: "Perfect connections based on skills, interests, and experience level."
              },
              {
                title: "One-on-One Sessions",
                description: "Mentor & mentee collaborate live for personalized learning."
              },
              {
                title: "Community Q&A Hub",
                description: "Experienced community forum where questions get rapid answers."
              },
              {
                title: "Electronics Reviews",
                description: "Verified mentors provide perfect product reviews."
              },
              {
                title: "Education Loan & Scholarship Portal",
                description: "Secure verified partners for scholarships & loan opportunities."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48"
              >
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-300 flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-black border-t border-gray-800 px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-8 md:mb-0">
              <div className="text-3xl font-bold text-white mb-4">
                MENTOR<span className="text-purple-600">ME</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {["About", "Pricing", "Contact Us", "Blog", "Terms of Service", "Privacy"].map((link, index) => (
                <div key={index}>
                  <a href="#" className="text-gray-400 hover:text-white">{link}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroPage;
