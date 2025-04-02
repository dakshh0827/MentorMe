import { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("mentee");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ ...formData, role });
    
    if (success) {
      navigate(`/dashboard/${role}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-200">
      {/* Navigation Bar */}
      <div className="w-full flex items-center justify-between px-10 py-4 border-b border-gray-700">
        <div className="flex items-center">
          <img 
            src="/3.png"
            alt="MENTORME"
            className="h-10 w-10 object-contain"
          />
          <img 
            src="/2.png"
            alt="MENTORME"
            className="h-10 w-46 object-contain -ml-2"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-md bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <h1 className="text-2xl font-bold mt-2 text-white">Welcome Back</h1>
              <p className="text-gray-400">Sign in as a {role}</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                role === "mentee" 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setRole("mentee")}
            >
              Mentee
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                role === "mentor" 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setRole("mentor")}
            >
              Mentor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Personal Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full px-4 py-3 pl-10 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pl-10 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                    <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-300"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to={`/signup`} className="text-purple-400 hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
