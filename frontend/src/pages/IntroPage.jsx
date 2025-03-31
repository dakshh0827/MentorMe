import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const IntroPage = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();

  const handleLetsLinkClick = () => {
    if (authUser?.role === "mentee") {
      navigate("/menteeLink");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <div className="w-full flex items-center justify-between px-10 py-4">
        <div className="text-3xl font-bold text-white">
          MENTOR<span className="text-purple-600">ME</span>
        </div>

        <nav className="flex items-center gap-6">
          <a href="#" className="text-purple-400 hover:underline">HOME</a>
          <a href="#" className="hover:text-gray-300">WHY US?</a>

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
      <div className="flex flex-1 items-center justify-center px-8 py-16 mt-8">
        <div className="flex w-full max-w-6xl items-center justify-between">
          {/* Left Section */}
          <div className="space-y-6 mt-12">
            <h1 className="text-5xl font-bold leading-tight">
              THE NEW LINKING
              <br />
              ERA IS HERE.
            </h1>
            <p className="text-xl tracking-wide">THINK-LINK-GROW</p>
            <button
              className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-lg font-semibold shadow-lg transition hover:bg-purple-700 cursor-pointer"
              onClick={handleLetsLinkClick}
            >
              Let's link <span className="inline-block ml-1">🔗</span>
            </button>
          </div>

          {/* Right Section - Image */}
          <div className="relative">
            <div className="absolute -inset-8 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
            <div
              // src="/bulb.png"
              // alt="Light Bulb"
              className="relative h-100 w-100 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-black px-8 py-16 mt-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold mt-8">Why Choose MentorMe?</h2>
          <p className="mb-12 text-center text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48">
              <h3 className="mb-3 text-xl font-semibold">User Verification</h3>
              <p className="text-sm text-gray-300 flex-grow">
                Only bona-fide, high-reputation professionals and verified aspiring mentees.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48">
              <h3 className="mb-3 text-xl font-semibold">Mentor-Mentee Matchmaking</h3>
              <p className="text-sm text-gray-300 flex-grow">
                Perfect connections based on skills, interests, and experience level.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48">
              <h3 className="mb-3 text-xl font-semibold">One-on-One Sessions</h3>
              <p className="text-sm text-gray-300 flex-grow">
                Mentor & mentee collaborate live for personalized learning.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48">
              <h3 className="mb-3 text-xl font-semibold">Community Q&A Hub</h3>
              <p className="text-sm text-gray-300 flex-grow">
                Experienced community forum where questions get rapid answers.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48">
              <h3 className="mb-3 text-xl font-semibold">Electronics reviews</h3>
              <p className="text-sm text-gray-300 flex-grow">
                Verified mentors provide perfect product reviews.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="rounded-lg bg-purple-900 bg-opacity-40 p-6 transition hover:bg-opacity-50 flex flex-col h-48">
              <h3 className="mb-3 text-xl font-semibold">Education Loan & Scholarship Portal</h3>
              <p className="text-sm text-gray-300 flex-grow">
                Secure verified partners for scholarships & loan opportunities.
              </p>
            </div>
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
              <div>
                <a href="#" className="text-gray-400 hover:text-white">About</a>
              </div>
              <div>
                <a href="#" className="text-gray-400 hover:text-white">Pricing</a>
              </div>
              <div>
                <a href="#" className="text-gray-400 hover:text-white">Contact Us</a>
              </div>
              <div>
                <a href="#" className="text-gray-400 hover:text-white">Blog</a>
              </div>
              <div>
                <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              </div>
              <div>
                <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroPage;