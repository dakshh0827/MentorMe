import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import useRequestStore from "../stores/useRequestStore.js";
import ChatBot from "../components/chatBot.jsx";
import { axiosInstance } from '../lib/axios.js';

const MentorDashboard = () => {
  const { authUser } = useAuthStore();
  const {
    pendingRequests,
    resolvedRequests,
    fetchRequests,
    fetchResolvedRequests,
    listenForUpdates,
    acceptRequest,
    rejectRequest,
    isLoading,
  } = useRequestStore();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello buddy! What's going?" },
  ]);
  const [activeTab, setActiveTab] = useState("pending");
  const [mentorProfile, setMentorProfile] = useState(null);

  useEffect(() => {
    if (authUser?._id) {
      fetchRequests(authUser._id);
      fetchResolvedRequests(authUser._id);
      fetchMentorProfile(authUser._id);

      const cleanup = listenForUpdates(authUser._id);
      return cleanup;
    }
  }, [authUser, fetchRequests, fetchResolvedRequests, listenForUpdates]);

  // Function to fetch mentor profile details
  const fetchMentorProfile = async (mentorId) => {
    try {
      const response = await axiosInstance.get(`/mentors/${mentorId}`);
      setMentorProfile(response.data);
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
      // Set default profile if API fails
      setMentorProfile({
        name: authUser?.name || "User",
        field: "Not specified",
        university: "Not specified",
        profilePicture: "",
        experience: "Not specified"
      });
    }
  };

  console.log("pending req....", pendingRequests);
  console.log("resolved: ", resolvedRequests);
  console.log("mentor profile:", mentorProfile);
  console.log("auth user:", authUser);

  if (!authUser || authUser.role !== "mentor") {
    return <div className="text-center text-white">Unauthorized Access</div>;
  }

  const handleAcceptRequest = async (requestId) => {
    await acceptRequest(requestId);
  };

  const handleRejectRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      await rejectRequest(requestId);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { sender: "user", text: message }]);
      setMessage("");

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Thanks for your message! How can I help you with your academic questions today?",
          },
        ]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-0 text-gray-200">
      {/* Header */}
      <div className="border-b border-gray-700 flex justify-between items-center px-6 py-2">
        <div className="flex items-center">
          <div className="mr-2 text-purple-400 font-bold text-2xl">
            <span>Mentor</span>
            <span className="text-purple-300">Me</span>
          </div>
        </div>
      </div>

      {/* Dashboard Title */}
      <h1 className="text-2xl font-bold my-4 text-center text-white">Mentor Dashboard</h1>

      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Profile Overview with detailed information */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-16 w-16 bg-gray-600 rounded-full mr-4 flex items-center justify-center">
                {authUser.profilePicture ? (
                  <img src={authUser.profilePicture} alt={authUser.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">{authUser.name?.charAt(0) || "M"}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-lg text-white">{authUser.name}</p>
                <p className="text-purple-300">{authUser.role || "Mentor"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Field</p>
                <p className="font-medium">{mentorProfile?.field || authUser.field || "Not specified"}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">University</p>
                <p className="font-medium">{mentorProfile?.university || authUser.university || "Not specified"}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Experience</p>
                <p className="font-medium">{mentorProfile?.experience || authUser.experience || "Not specified"}</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ongoing Sessions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Ongoing Sessions</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Requests</h2>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 mr-2 ${
                  activeTab === "pending"
                    ? "border-b-2 border-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`px-4 py-2 ${
                  activeTab === "resolved"
                    ? "border-b-2 border-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Resolved
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === "pending" && !isLoading && (
              <>
                {pendingRequests && pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-white">{request.from.name}</p>
                            <p className="text-gray-400 text-sm">{request.from.email}</p>
                            <p className="text-gray-400 text-sm mt-1">{request.message}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="w-8 h-8 rounded-full bg-green-900 hover:bg-green-800 text-green-400 flex items-center justify-center transition-colors"
                              title="Accept Request"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="w-8 h-8 rounded-full bg-red-900 hover:bg-red-800 text-red-400 flex items-center justify-center transition-colors"
                              title="Reject Request"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No pending requests.</p>
                )}
              </>
            )}

            {/* Resolved Requests Tab */}
            {activeTab === "resolved" && !isLoading && (
              <>
                {resolvedRequests && resolvedRequests.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedRequests.map((request) => (
                      <div key={request._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium text-white">{request.from.name}</p>
                              <span
                                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                  request.status === "accepted"
                                    ? "bg-green-900 text-green-300"
                                    : "bg-red-900 text-red-300"
                                }`}
                              >
                                {request.status === "accepted" ? "Accepted" : "Rejected"}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{request.from.email}</p>
                            <p className="text-gray-400 text-sm mt-1">{request.message}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(request.resolvedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No resolved requests.</p>
                )}
              </>
            )}
          </div>

          {/* Mentees */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Mentees - Mentored by Me</h2>
            <div className="space-y-3">
              {resolvedRequests && Array.isArray(resolvedRequests) && resolvedRequests.filter(req => req.status === "accepted").length > 0 ? (
                resolvedRequests.filter(req => req.status === "accepted").map((request) => (
                  <div key={request._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                    <p className="font-medium text-white">{request.from.name}</p>
                    <p className="text-gray-400 text-sm">{request.from.email}</p>
                    <p className="text-gray-400 text-sm">Domain: {request.from.subject || "Not specified"}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No mentees yet.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
            <p className="text-gray-400 text-center py-4">No recent activities to display.</p>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default MentorDashboard;