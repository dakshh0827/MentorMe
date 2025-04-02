import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "../stores/useAuthStore.js";
import useRequestStore from "../stores/useRequestStore.js";
import useSessionsStore from "../stores/useSessionsStore.js";
import ChatBot from "../components/ChatBot.jsx";
import { axiosInstance } from '../lib/axios.js';
import { useNavigate } from "react-router-dom";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const {
    pendingRequests,
    resolvedRequests,
    fetchRequests,
    fetchResolvedRequests,
    listenForUpdates,
    acceptRequest,
    rejectRequest,
    isLoading: requestsLoading,
  } = useRequestStore();

  const {
    pendingSessions,
    upcomingSessions,
    resolvedSessions, // Changed from pastSessions to resolvedSessions
    fetchSessions,
    fetchResolvedSessions, // New function to fetch resolved sessions
    updateSessionStatus,
    listenForSessionUpdates,
    cleanupSocketListeners,
    isLoading: sessionsLoading,
    error: sessionError,
    clearError,
  } = useSessionsStore();

  // Using a ref to track mounted state
  const isMounted = useRef(true);
  const dashboardRef = useRef(null);
  const dataFetchedRef = useRef(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello buddy! What's going?" },
  ]);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeSessionTab, setActiveSessionTab] = useState("pending");
  const [mentorProfile, setMentorProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch mentor profile only once
  const fetchMentorProfile = useCallback(async (mentorId) => {
    try {
      const response = await axiosInstance.get(`/users/mentorProfile/${mentorId}`);
      console.log("mentor fetch res:", response.data);
      setMentorProfile(response.data);
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
      if (isMounted.current) {
        setMentorProfile({
          name: authUser?.name || "User",
          domain: authUser?.program || "Not specified",
          college: authUser?.college || "Not specified",
          profilePicture: "",
          experience: authUser?.experience || "Not specified"
        });
      }
    }
  }, [authUser?.name]);

  // Error handling effect
  useEffect(() => {
    if (sessionError) {
      setErrorMessage(sessionError);
      // Clear error after 5 seconds
      const timer = setTimeout(() => {
        setErrorMessage("");
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionError, clearError]);

  // Initial data load - only happens once
  useEffect(() => {
    if (authUser?._id && !dataFetchedRef.current) {
      fetchRequests(authUser._id);
      fetchResolvedRequests(authUser._id);
      fetchSessions(authUser._id);
      fetchResolvedSessions(authUser._id); // Added this to fetch resolved sessions
      fetchMentorProfile(authUser._id);
      dataFetchedRef.current = true;
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [authUser?._id, fetchRequests, fetchResolvedRequests, fetchSessions, fetchResolvedSessions, fetchMentorProfile]);

  // Set up real-time updates listener - only once
  useEffect(() => {
    let requestUnsubscribe = null;
    
    if (authUser?._id) {
      requestUnsubscribe = listenForUpdates(authUser._id);
      listenForSessionUpdates(authUser._id);
    }
    
    return () => {
      if (typeof requestUnsubscribe === 'function') {
        requestUnsubscribe();
      }
      cleanupSocketListeners();
    };
  }, [authUser?._id, listenForUpdates, listenForSessionUpdates, cleanupSocketListeners]);

  // Handle request actions with manual refresh only when needed
  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptRequest(requestId);
      // Manually fetch only what's needed after action
      if (authUser?._id) {
        fetchRequests(authUser._id);
        fetchResolvedRequests(authUser._id);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      setErrorMessage("Failed to accept request. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      try {
        await rejectRequest(requestId);
        // Manually fetch only what's needed after action
        if (authUser?._id) {
          fetchRequests(authUser._id);
          fetchResolvedRequests(authUser._id);
        }
      } catch (error) {
        console.error("Error rejecting request:", error);
        setErrorMessage("Failed to reject request. Please try again.");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    }
  };

  // Handle session actions with improved error handling
  const handleRejectSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to reject this session request?")) {
      return;
    }
    
    setIsUpdating(true);
    try {
      // Make the API call with the correct status
      await updateSessionStatus(sessionId, "rejected");
      
      // Fetch fresh data after successful update
      if (authUser?._id) {
        await fetchSessions(authUser._id);
        await fetchResolvedSessions(authUser._id);
      }
    } catch (error) {
      console.error("Error rejecting session:", error);
      setErrorMessage("Failed to reject session. The server may be unavailable. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Also update the accept function to fetch resolved sessions
  const handleAcceptSession = async (sessionId) => {
    setIsUpdating(true);
    try {
      // Make the API call
      await updateSessionStatus(sessionId, "accepted");
      
      // Fetch fresh data after successful update
      if (authUser?._id) {
        await fetchSessions(authUser._id);
        await fetchResolvedSessions(authUser._id);
      }
    } catch (error) {
      console.error("Error accepting session:", error);
      setErrorMessage("Failed to accept session. The server may be unavailable. Please try again later.");
    } finally {
      setIsUpdating(false);
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

  const handleConnectWithMentee = (menteeId, menteeName) => {
    navigate(`/connect/${menteeId}`);
  };

  // Manual refresh function with loading state
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshData = async () => {
    if (authUser?._id) {
      setIsRefreshing(true);
      try {
        await Promise.all([
          fetchRequests(authUser._id),
          fetchResolvedRequests(authUser._id),
          fetchSessions(authUser._id),
          fetchResolvedSessions(authUser._id) // Added to fetch resolved sessions
        ]);
      } catch (error) {
        console.error("Error refreshing data:", error);
        setErrorMessage("Failed to refresh data. Please try again.");
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleHomeClick = () => {
      navigate('/');
  };

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Mock function to handle session actions when API fails
  const mockSessionAction = (sessionId, action) => {
    if (action === "accept") {
      // Find the session in pending and move it to upcoming
      const sessionToMove = pendingSessions.find(s => s._id === sessionId);
      if (sessionToMove) {
        // Show a notification that this is a mock update due to API error
        setErrorMessage("API Unavailable: Session temporarily marked as accepted (mock update)");
        
        // Refresh the UI after 2 seconds to simulate completion
        setTimeout(refreshData, 2000);
      }
    } else {
      // Just show a notification for rejection
      setErrorMessage("API Unavailable: Session rejection will be processed when connection is restored");
    }
  };

  if (!authUser || authUser.role !== "mentor") {
    return <div className="text-center text-white">Unauthorized Access</div>;
  }

  return (
    <div ref={dashboardRef} id="mentor-dashboard" className="min-h-screen bg-gray-900 p-0 text-gray-200">
      {/* Header */}
      <div className="border-b border-gray-700 flex justify-between items-center px-6 py-2">
      <div className="flex items-center">
        <img 
          src="../public/3.png"
          alt="MENTORME"
          className="h-10 w-10 object-contain"
        />
        <img 
          src="../public/2.png"
          alt="MENTORME"
          className="h-10 w-46 object-contain -ml-2"
        />
      </div>

        <nav className="flex items-center space-x-4">
          <button 
            onClick={handleHomeClick}
            className="px-3 py-1 text-white hover:text-purple-300 flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>
        {/* <button 
          onClick={refreshData}
          disabled={isRefreshing}
          className={`px-3 py-1 ${isRefreshing ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'} text-white text-sm font-medium rounded transition-colors flex items-center`}
        >
          {isRefreshing ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </button> */}
      </div>

      {/* Error Message Banner */}
      {/* {errorMessage && (
        <div className="bg-red-900 text-white px-4 py-2 text-center">
          {errorMessage}
          <button 
            className="ml-4 text-red-300 hover:text-white"
            onClick={() => setErrorMessage("")}
          >
            Dismiss
          </button>
        </div>
      )} */}

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
            
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="bg-gray-700 px-4 py-2 rounded-md">
                <p className="text-sm text-gray-400">Domain</p>
                <p className="text-white font-medium">{authUser.program || mentorProfile?.program || "Not specified"}</p>
              </div>
              <div className="bg-gray-700 px-4 py-2 rounded-md">
                <p className="text-sm text-gray-400">Exam Mastery</p>
                <p className="text-white font-medium">{authUser.examMastery || mentorProfile?.examMastery || "Not specified"}</p>
              </div>
              <div className="bg-gray-700 px-4 py-2 rounded-md">
                <p className="text-sm text-gray-400">College</p>
                <p className="text-white font-medium">{authUser.college || mentorProfile?.college || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ongoing Sessions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Ongoing Sessions</h2>
            <div className="space-y-3">
              {upcomingSessions && upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{session.title}</p>
                        <p className="text-gray-400 text-sm">With: {session.student?.name || "Student"}</p>
                        <p className="text-gray-400 text-sm">Scheduled: {formatDateTime(session.scheduledAt)}</p>
                      </div>
                      <button
                        onClick={() => handleConnectWithMentee(session.student?._id, session.student?.name)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Connect
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No ongoing sessions.</p>
              )}
            </div>
          </div>

          {/* Recent Activity - Now showing resolved session requests */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
            
            {/* Tab Navigation for Sessions */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                onClick={() => setActiveSessionTab("pending")}
                className={`px-4 py-2 mr-2 ${
                  activeSessionTab === "pending"
                    ? "border-b-2 border-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Pending Sessions
              </button>
              <button
                onClick={() => setActiveSessionTab("resolved")}
                className={`px-4 py-2 ${
                  activeSessionTab === "resolved"
                    ? "border-b-2 border-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Resolved Sessions
              </button>
            </div>
            
            {/* Loading State */}
            {sessionsLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
            
            {/* Pending Sessions Tab */}
            {activeSessionTab === "pending" && !sessionsLoading && (
              <>
                {pendingSessions && pendingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {pendingSessions.map((session) => (
                      <div key={session._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-white">{session.title}</p>
                            <p className="text-gray-400 text-sm">From: {session.student?.name || "Student"}</p>
                            <p className="text-gray-400 text-sm">Scheduled: {formatDateTime(session.scheduledAt)}</p>
                            <p className="text-gray-400 text-sm mt-1">{session.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => isUpdating ? null : handleAcceptSession(session._id)}
                              disabled={isUpdating}
                              className={`w-8 h-8 rounded-full ${isUpdating ? 'bg-gray-700 text-gray-500' : 'bg-green-900 hover:bg-green-800 text-green-400'} flex items-center justify-center transition-colors`}
                              title="Accept Session"
                            >
                              {isUpdating ? (
                                <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : "✓"}
                            </button>
                            <button
                              onClick={() => isUpdating ? null : handleRejectSession(session._id)}
                              disabled={isUpdating}
                              className={`w-8 h-8 rounded-full ${isUpdating ? 'bg-gray-700 text-gray-500' : 'bg-red-900 hover:bg-red-800 text-red-400'} flex items-center justify-center transition-colors`}
                              title="Reject Session"
                            >
                              {isUpdating ? (
                                <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : "✕"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No pending session requests.</p>
                )}
              </>
            )}
            
            {/* Resolved Sessions Tab - Modified to show accepted/rejected sessions instead of past sessions */}
            {activeSessionTab === "resolved" && !sessionsLoading && (
              <>
                {resolvedSessions && resolvedSessions.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedSessions.map((session) => (
                      <div key={session._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium text-white">{session.title}</p>
                              <span
                                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                  session.status === "accepted"
                                    ? "bg-green-900 text-green-300"
                                    : "bg-red-900 text-red-300"
                                }`}
                              >
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">From: {session.student?.name || "Student"}</p>
                            <p className="text-gray-400 text-sm">Requested: {formatDateTime(session.createdAt)}</p>
                            <p className="text-gray-400 text-sm">Proposed Date: {formatDateTime(session.scheduledAt)}</p>
                            <p className="text-gray-400 text-sm mt-1">{session.description}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Resolved: {formatDateTime(session.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No resolved session requests.</p>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Mentees and Requests - Now side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Mentees */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-white">Mentees - Mentored by Me</h2>
            <div className="space-y-3">
              {resolvedRequests && Array.isArray(resolvedRequests) && resolvedRequests.filter(req => req.status === "accepted").length > 0 ? (
                resolvedRequests.filter(req => req.status === "accepted").map((request) => (
                  <div key={request._id} className="border border-gray-700 bg-gray-750 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{request.from.name}</p>
                        <p className="text-gray-400 text-sm">{request.from.email}</p>
                        <p className="text-gray-400 text-sm">Subject: {request.from.subject || "Not specified"}</p>
                      </div>
                      <button
                        onClick={() => handleConnectWithMentee(request.from._id, request.from.name)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Connect
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No mentees yet.</p>
              )}
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
            {requestsLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === "pending" && !requestsLoading && (
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
            {activeTab === "resolved" && !requestsLoading && (
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
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default MentorDashboard;
