import React, { useState } from 'react';

const SessionScheduleModal = ({ isOpen, onClose, onSubmit, mentorName }) => {
    const [sessionData, setSessionData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 30,
        meetingLink: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSessionData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(sessionData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Schedule Session with {mentorName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Session Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={sessionData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            placeholder="e.g., Math Tutoring, Career Advice"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={sessionData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            placeholder="Briefly describe what you'd like to discuss"
                            rows="3"
                        ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={sessionData.date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                       
                    </div>
                    
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                        >
                            Schedule Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionScheduleModal;