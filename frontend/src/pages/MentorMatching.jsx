import React, { useState, useEffect } from 'react';
import { useMenteeStore } from '../stores/useMenteeStore';
import useRequestStore from '../stores/useRequestStore';
import { useAuthStore } from '../stores/useAuthStore';

export const MentorMatching = () => {
  const [filters, setFilters] = useState({
    domain: '',
    university: '',
    skills: [],
    address: '',
    familyAnnualIncome: '',
    interests: [],
    attemptedExam: '',
    rating: ''
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [matchedMentors, setMatchedMentors] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showResults, setShowResults] = useState(false);

  const { mentors, fetchMentors, isLoading } = useMenteeStore();
  const { sendRequest, requests, fetchRequests } = useRequestStore();
  const { authUser } = useAuthStore();

  const domains = ['All Domains', 'Computer Science', 'Engineering', 'Medicine', 'Business', 'Arts', 'Law', 'Education'];
  const skillsList = ['Programming', 'Data Analysis', 'Machine Learning', 'Web Development', 'UI/UX', 'Backend Development', 'AIML', 'Frontend Development', 'Blockchain', 'Web3', 'IOT', 'Data Analytics'];
  const interestsList = ['Technology', 'Science', 'Arts', 'Music', 'Sports', 'Literature', 'Travel', 'Cooking', 'Photography'];
  const ratings = ['All Ratings', '5.0', '4.0+', '3.0+'];
  const incomeRanges = ['Below 2 Lakh', '2-5 Lakh', '5-10 Lakh', '10-15 Lakh', 'Above 15 Lakh'];
  const exams = ['JEE', 'NEET', 'CAT', 'GATE', 'UPSC', 'GRE', 'GMAT', 'Other'];

  useEffect(() => {
    fetchMentors();
    if (authUser?._id) {
      fetchRequests(authUser._id);
    }
  }, [fetchMentors, authUser, fetchRequests]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleInterestChange = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      domain: '',
      university: '',
      skills: [],
      address: '',
      familyAnnualIncome: '',
      interests: [],
      attemptedExam: '',
      rating: ''
    });
    setSelectedSkills([]);
    setSelectedInterests([]);
    setShowResults(false);
    setMatchedMentors([]);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const findMatches = () => {
    setIsMatching(true);

    const updatedFilters = {
      ...filters,
      skills: selectedSkills,
      interests: selectedInterests
    };
    setFilters(updatedFilters);

    let processedMentors = mentors.map(mentor => {
      const skillsMatch = selectedSkills.length > 0
        ? selectedSkills.filter(skill => mentor.skills?.includes(skill)).length / selectedSkills.length
        : 0;

      const interestsMatch = selectedInterests.length > 0
        ? selectedInterests.filter(interest => mentor.interests?.includes(interest)).length / selectedInterests.length
        : 0;

      const incomeMatch = !filters.familyAnnualIncome || mentor.familyAnnualIncome === filters.familyAnnualIncome ? 1 : 0;
      const examMatch = !filters.attemptedExam || mentor.examMastery === filters.attemptedExam ? 1 : 0;

      const matchScore = (
        (skillsMatch * 0.4) +
        (interestsMatch * 0.25) +
        (incomeMatch * 0.15) +
        (examMatch * 0.2)
      ) * 100;

      return {
        ...mentor,
        rating: mentor.ratings || null,
        matchScore: matchScore.toFixed(1),
        skillsMatch: (skillsMatch * 100).toFixed(0),
        interestsMatch: (interestsMatch * 100).toFixed(0),
        _id: mentor._id,
        name: mentor.name,
        university: mentor.college,
        skills: mentor.skills,
      };
    });

    if (filters.university && filters.university !== "All Universities") {
      processedMentors = processedMentors.filter(mentor => mentor.college === filters.university);
    }

    if (filters.domain && filters.domain !== "All Domains") {
      processedMentors = processedMentors.filter(mentor => mentor.program === filters.domain);
    }

    if (filters.address && filters.address !== "All Locations") {
      processedMentors = processedMentors.filter(mentor => mentor.address === filters.address);
    }

    if (filters.rating && filters.rating !== "All Ratings") {
      processedMentors = processedMentors.filter(mentor => {
        const mentorRating = parseFloat(mentor.rating) || 0;
        if (filters.rating === "5.0") return mentorRating >= 5;
        if (filters.rating === "4.0+") return mentorRating >= 4;
        if (filters.rating === "3.0+") return mentorRating >= 3;
        return true;
      });
    }

    processedMentors = processedMentors.filter(mentor => parseFloat(mentor.matchScore) >= 25);
    const matches = processedMentors.sort((a, b) => parseFloat(b.matchScore) - parseFloat(a.matchScore));

    setMatchedMentors(matches);

    setTimeout(() => {
      setIsMatching(false);
      setShowResults(true);

      if (matches.length === 0) {
        showToast('No matches found. Try adjusting your filters.', 'info');
      } else {
        showToast(`Found ${matches.length} potential mentor matches!`, 'success');
      }
    }, 1500);
  };

  const hasRequestBeenSent = (mentorId) => {
    return requests?.some(req => req.from === authUser?._id && req.to === mentorId);
  };

  const handleSendRequest = (mentorId) => {
    sendRequest(authUser._id, mentorId);
    showToast('Request Sent Successfully!');
  };

  const getRequestButtonProps = (mentorId) => {
    if (hasRequestBeenSent(mentorId)) return { text: 'Request Sent', disabled: true, className: 'bg-gray-500 cursor-not-allowed' };
    else return { text: 'Send Request', disabled: false, className: 'bg-purple-600 hover:bg-purple-700' };
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      {toast.show && (
        <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 max-w-md transition-opacity duration-300
          ${toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'info' ? 'bg-blue-600' : 'bg-purple-600'
          }`}
        >
          <p className="text-white">{toast.message}</p>
        </div>
      )}

      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-purple-600 mr-2"></div>
            <h1 className="text-xl font-bold">
              <span>Mentor</span>
              <span className="text-purple-500">Me</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <button className="p-2">
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-center my-6">Mentor Match-making</h2>

        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-300 mb-2">Domain</label>
              <div className="relative">
                <select
                  name="domain"
                  value={filters.domain}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose your Domain</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">College Name</label>
              <input
                type="text"
                name="university"
                value={filters.university}
                onChange={handleFilterChange}
                placeholder="Enter your preferred college name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Rating</label>
              <div className="relative">
                <select
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose Rating</option>
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                placeholder="Your location"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Family Annual Income</label>
              <div className="relative">
                <select
                  name="familyAnnualIncome"
                  value={filters.familyAnnualIncome}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Income Range</option>
                  {incomeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Attempted Exam</label>
              <div className="relative">
                <select
                  name="attemptedExam"
                  value={filters.attemptedExam}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Exam</option>
                  {exams.map(exam => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skillsList.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillChange(skill)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestsList.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestChange(interest)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-end mt-6">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={findMatches}
              disabled={isMatching}
              className={`bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center ${
                isMatching ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isMatching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Mentors...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Submit & Find Mentors
                </>
              )}
            </button>
          </div>
        </div>

        {showResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              Array(6).fill().map((_, index) => (
                <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow animate-pulse">
                  <div className="h-48 bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-700 mb-2"></div>
                    <div className="h-4 bg-gray-700"></div>
                  </div>
                </div>
              ))
            ) : (
              matchedMentors.map(mentor => {
                const buttonProps = getRequestButtonProps(mentor._id);
                return (
                  <div key={mentor._id} className="bg-gray-800 rounded-lg overflow-hidden shadow border border-gray-700">
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white">{mentor.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{mentor.university}</p>
                      <p className="text-gray-400 text-sm mb-2">Match Score: {mentor.matchScore}%</p>
                      <p className="text-gray-400 text-sm mb-2">Skills Match: {mentor.skillsMatch}%</p>
                      <p className="text-gray-400 text-sm mb-2">Interests Match: {mentor.interestsMatch}%</p>
                      <button
                        onClick={() => handleSendRequest(mentor._id)}
                        disabled={buttonProps.disabled}
                        className={`text-white px-3 py-1 rounded text-sm ${buttonProps.className} w-full`}
                      >
                        {buttonProps.text}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};