import React, { useState, useEffect } from 'react';
import { useMenteeStore } from '../stores/useMenteeStore';
import useRequestStore from '../stores/useRequestStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios.js';
import ChatBot from '../components/chatBot.jsx';

const MenteeDashboard = () => {
    const navigate = useNavigate();
    const { sendRequest, fetchRequests, requests, listenForUpdates } = useRequestStore();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: "Hello buddy! What's going?" }
    ]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const [requestStatuses, setRequestStatuses] = useState({ pending: {}, accepted: {}, rejected: {} });
    const [acceptedMentors, setAcceptedMentors] = useState([]);
    const [availableMentors, setAvailableMentors] = useState([]);
    const [showAllMentors, setShowAllMentors] = useState(false);
    const [menteeProfile, setMenteeProfile] = useState(null);

    const { mentors, fetchMentors, isLoading } = useMenteeStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        fetchMentors();
        // Fetch mentee profile details
        if (authUser?._id) {
            fetchMenteeProfile(authUser._id);
        }
    }, [fetchMentors, authUser]);

    // Function to fetch mentee profile details
    const fetchMenteeProfile = async (menteeId) => {
        try {
            const response = await axiosInstance.get(`/mentees/${menteeId}`);
            setMenteeProfile(response.data);
        } catch (error) {
            console.error("Error fetching mentee profile:", error);
            // Set default profile if API fails
            setMenteeProfile({
                name: authUser?.name || "User",
                class: "Not specified",
                school: "Not specified",
                profilePicture: "",
                major: "Not specified"
            });
        }
    };

    useEffect(() => {
        const fetchRequestsData = async () => {
            if (authUser?._id) {
                try {
                    const response = await axiosInstance.get(`/requests/${authUser._id}`);
                    const requestsData = response.data;
                    console.log("req data: ", requestsData);

                    const statuses = { pending: {}, accepted: {}, rejected: {} };

                    requestsData.forEach(req => {
                        if (req.status === 'pending') {
                            statuses.pending[req.to._id || req.to] = true;
                        } else if (req.status === 'accepted') {
                            statuses.accepted[req.to._id || req.to] = true;
                        } else if (req.status === 'rejected') {
                            statuses.rejected[req.to._id || req.to] = true;
                        }
                    });

                    setRequestStatuses(statuses);
                    console.log("statusses: ", statuses);

                    listenForUpdates(authUser._id);

                    if (mentors.length) {
                        const acceptedRequestMentorIds = requestsData
                            .filter(req => req.from === authUser._id && req.status === 'accepted')
                            .map(req => req.to._id || req.to); // Ensure consistent ID access

                        setAcceptedMentors(mentors.filter(mentor => acceptedRequestMentorIds.includes(mentor._id)));

                        const allRequestedMentorIds = [
                            ...Object.keys(statuses.pending),
                            ...Object.keys(statuses.accepted),
                            ...Object.keys(statuses.rejected)
                        ];

                        setAvailableMentors(mentors.filter(mentor => !allRequestedMentorIds.includes(mentor._id)));
                    }
                } catch (error) {
                    console.error("Error fetching requests:", error);
                }
            }
        };

        fetchRequestsData();
    }, [authUser, listenForUpdates, mentors]);

    useEffect(() => {
        if (!mentors.length || !authUser) return;

        const allRequestedMentorIds = [
            ...Object.keys(requestStatuses.pending),
            ...Object.keys(requestStatuses.accepted),
            ...Object.keys(requestStatuses.rejected)
        ];

        setAvailableMentors(mentors.filter(mentor => !allRequestedMentorIds.includes(mentor._id)));

        const acceptedRequestMentorIds = Object.keys(requestStatuses.accepted);
        setAcceptedMentors(mentors.filter(mentor => acceptedRequestMentorIds.includes(mentor._id)));
    }, [mentors, requestStatuses, authUser]);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        setChatMessages([...chatMessages, { sender: 'user', text: message }]);
        setMessage('');
        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'ai', text: "I'm your ScholarSync AI assistant. How can I help with your academic needs?" }]);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleSendRequest = async (mentorId) => {
        if (!authUser) {
            showToast('You must be logged in to send a request', 'error');
            return;
        }

        if (requestStatuses.pending[mentorId]) {
            showToast('Request already sent to this mentor', 'info');
            return;
        }

        try {
            await sendRequest(authUser._id, mentorId); // Use the sendRequest from the store

            // Immediately update local state
            setRequestStatuses(prev => ({
                ...prev,
                pending: { ...prev.pending, [mentorId]: true }
            }));

            showToast('Mentorship request sent successfully!', 'success');

            // Update available mentors
            const allRequestedMentorIds = [
                ...Object.keys(requestStatuses.pending),
                ...Object.keys(requestStatuses.accepted),
                ...Object.keys(requestStatuses.rejected)
            ];

            setAvailableMentors(mentors.filter(mentor => !allRequestedMentorIds.includes(mentor._id)));

        } catch (error) {
            console.error('Failed to send request:', error);
            showToast('Failed to send request. Please try again.', 'error');
        }
    };

    const handleMatchWithMentor = () => navigate("/mentorMatching");

    const renderRating = (rating) => {
        if (!rating || rating === 0) return <span className="text-gray-400">Unrated</span>;
        return (
            <div className="flex">
                {Array.from({ length: Math.floor(rating) }, (_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    const getRequestButtonProps = (mentorId) => {
        if (requestStatuses.pending[mentorId]) return { text: 'Request Sent', disabled: true, className: 'bg-gray-500 cursor-not-allowed' };
        else if (requestStatuses.accepted[mentorId]) return { text: 'Accepted', disabled: true, className: 'bg-green-500 cursor-not-allowed' };
        else if (requestStatuses.rejected[mentorId]) return { text: 'Send Request', disabled: false, className: 'bg-purple-600 hover:bg-purple-700' };
        else return { text: 'Send Request', disabled: false, className: 'bg-purple-600 hover:bg-purple-700' };
    };

    const handleViewAllMentors = () => setShowAllMentors(!showAllMentors);

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100">
            {toast.show && (
                <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 max-w-md transition-opacity duration-300 ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    <p className="text-white">{toast.message}</p>
                </div>
            )}
            <header className="border-b border-gray-700 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-600 mr-2"></div>
                        <h1 className="text-xl font-bold"><span>Mentor</span><span className="text-purple-500">Me</span></h1>
                    </div>
                    <nav className="flex items-center space-x-4"><button className="p-2"></button></nav>
                </div>
            </header>
            <main className="container mx-auto p-4">
                <h2 className="text-2xl font-bold text-center my-4">Mentee Dashboard</h2>
                
                {/* Mentee Profile Section */}
                {authUser && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6 border-l-4 border-purple-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex items-center mb-4 md:mb-0">
                                <div className="h-16 w-16 bg-gray-700 rounded-full flex-shrink-0">
                                    {(
                                        <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
                                            <span className="text-xl font-bold text-white">{authUser.name?.charAt(0) || "?"}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xl font-bold text-white">{authUser.name}</h3>
                                    <p className="text-purple-300">Mentee</p>
                                </div>
                            </div>
                            
                            {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">Class</p>
                                    <p className="font-medium">{menteeProfile.class}</p>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">Subject</p>
                                    <p className="font-medium">{menteeProfile.subject}</p>
                                </div>
                            </div> */}
                            
                        </div>
                    </div>
                )}
                
                {acceptedMentors.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-green-400">Your Accepted Mentors</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {acceptedMentors.map(mentor => (
                                <div key={mentor._id} className="border border-green-700 bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-gray-700 rounded-full">{mentor.profilePicture && (<img src={mentor.profilePicture} alt={mentor.name} className="h-12 w-12 rounded-full object-cover" />)}</div>
                                        <div className="ml-3"><h4 className="font-bold">{mentor.name}</h4><p className="text-sm text-gray-400">{mentor.field || 'Field not specified'}</p></div>
                                    </div>
                                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Contact</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Find your perfect mentor</h3>
                        <button onClick={handleMatchWithMentor} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            Match with Mentor
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {isLoading ? (
                            <div className="col-span-2 text-center py-4">Loading mentors...</div>
                        ) : (showAllMentors ? mentors : mentors.slice(0, 4)).map(mentor => {
                            const buttonProps = getRequestButtonProps(mentor._id);
                            return (
                                <div key={mentor._id} className="border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 bg-gray-700 rounded-full">{mentor.profilePicture && (<img src={mentor.profilePicture} alt={mentor.name} className="h-12 w-12 rounded-full object-cover" />)}</div>
                                        <div className="ml-3"><h4 className="font-bold">{mentor.name}</h4><p className="text-sm text-gray-400">{mentor.field || 'Field not specified'}</p></div>
                                    </div>
                                    <button onClick={() => handleSendRequest(mentor._id)} disabled={buttonProps.disabled} className={`text-white px-3 py-1 rounded text-sm ${buttonProps.className}`}>{buttonProps.text}</button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center">
                        <button onClick={handleViewAllMentors} className="text-purple-400 hover:text-purple-300 inline-flex items-center cursor-pointer">
                            {showAllMentors ? "Show Less" : "Show More"}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </main>
            <ChatBot />
        </div>
    );
};

export default MenteeDashboard;