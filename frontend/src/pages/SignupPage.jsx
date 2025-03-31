import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        joinAs: "",
        name: "",
        phone: "",
        email: "",
        password: "",
        college: "",
        semester: "",
        program: "",
        school: "",
        subject: "",
        class: "",
        idCard: null,
        experience: "",
        skills: [],
        interests: [],
        examMastery: [],
        linkedin: "",
        address: "",
        github: "",
        resume: null,
        familyAnnualIncome: "",
    });

    const [tempFormData, setTempFormData] = useState({});
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempFormData({
            ...tempFormData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setTempFormData({
                ...tempFormData,
                [name]: files[0],
            });
        }
    };

    const handleSelectChange = (e) => {
        setTempFormData({
            ...tempFormData,
            joinAs: e.target.value,
        });
        setUserType(e.target.value);
        setStep(2);
    };

    const handleSkillChange = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter((s) => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleInterestChange = (interest) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter((i) => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleExamChange = (exam) => {
        if (selectedExams.includes(exam)) {
            setSelectedExams(selectedExams.filter((e) => e !== exam));
        } else {
            setSelectedExams([...selectedExams, exam]);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        const updatedFormData = {
            ...formData,
            ...tempFormData,
            skills: selectedSkills,
            interests: selectedInterests,
            examMastery: selectedExams,
        };
        setFormData(updatedFormData);
        setTempFormData({});
        setStep(step + 1);
    };

    const handleBack = (e) => {
        e.preventDefault();
        if (step > 1) {
            if (step === 2 && !userType) {
                setStep(1);
            } else {
                const updatedFormData = { ...formData, ...tempFormData };
                setFormData(updatedFormData);
                setTempFormData({});
                setStep(step - 1);
            }
        }
    };

    const validateForm = (data, type) => {
        const errors = [];

        if (!data.name) errors.push("Name is required");
        if (!data.email) errors.push("Email is required");
        else if (!/\S+@\S+\.\S+/.test(data.email)) errors.push("Email is invalid");
        if (!data.phone) errors.push("Phone number is required");
        if (!data.password) errors.push("Password is required");
        else if (data.password.length < 6)
            errors.push("Password must be at least 6 characters");
        if (!data.address) errors.push("Address is required");
        if (!data.familyAnnualIncome) errors.push("Family Annual Income is required");

        if (type === "mentor") {
            if (!data.college) errors.push("College name is required");
            if (!data.semester) errors.push("Semester is required");
            if (!data.program) errors.push("Program is required");
            if (!data.experience) errors.push("Experience is required");
            if (data.skills.length === 0) errors.push("Skills are required");
            if (data.interests.length === 0) errors.push("Interests are required");
            if (data.examMastery.length === 0) errors.push("Exam Mastery is required");
            if (!data.linkedin) errors.push("LinkedIn profile is required");
            if (!data.resume) errors.push("Resume is required");
        } else if (type === "mentee") {
            if (!data.school) errors.push("School name is required");
            if (!data.subject) errors.push("Subject is required");
            if (!data.class) errors.push("Class is required");
            if (!data.idCard) errors.push("ID Card is required");
        }

        return errors;
    };

    const handleSignup = async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
  
      const mergedFormData = {
          ...formData,
          ...tempFormData,
          skills: selectedSkills,
          interests: selectedInterests,
          examMastery: selectedExams,
      };
  
      setFormData(mergedFormData);
  
      const validationErrors = validateForm(mergedFormData, userType);
      if (validationErrors.length > 0) {
          validationErrors.forEach((error) => toast.error(error));
          return;
      }
  
      setIsSubmitting(true);
  
      try {
          // First, call signup without the callback
          await useAuthStore.getState().signup(mergedFormData, userType);
          
          // After successful signup, show success message
          toast.success("Signup successful!");
          
          // Then explicitly navigate
          navigate(`/dashboard/${userType}`);
      } catch (error) {
          toast.error(
              error.response?.data?.message || "Signup failed. Please try again."
          );
      } finally {
          setIsSubmitting(false);
      }
  };

    const getMaxSteps = () => {
        if (!userType) return 1;
        return userType === "mentor" ? 4 : 4;
    };

    const skillsList = [
        "Programming",
        "Data Analysis",
        "Machine Learning",
        "Web Development",
        "UI/UX",
        "Backend Development",
        "AIML",
        "Frontend Development",
        "Blockchain",
        "Web3",
        "IOT",
        "Data Analytics",
    ];
    const interestsList = [
        "Technology",
        "Science",
        "Arts",
        "Music",
        "Sports",
        "Literature",
        "Travel",
        "Cooking",
        "Photography",
    ];
    const exams = ["JEE", "NEET", "CAT", "GATE", "UPSC", "GRE", "GMAT", "Other"];
    const incomeRanges = [
        "Below 2 Lakh",
        "2-5 Lakh",
        "5-10 Lakh",
        "10-15 Lakh",
        "Above 15 Lakh",
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gray-900 text-gray-200">
            <div className="w-full flex items-center justify-between px-10 py-4 border-b border-gray-700">
                <div className="text-3xl font-bold text-white">
                    MENTOR<span className="text-purple-400">ME</span>
                </div>
                <nav className="flex items-center gap-6">
                    <a href="#" className="hover:text-purple-400 text-gray-300">
                        HOME
                    </a>
                    <a href="#" className="hover:text-purple-400 text-gray-300">
                        WHY US?
                    </a>
                    <div className="flex items-center bg-gray-800 rounded-full px-4 py-1">
                        <a href="#" className="hover:text-purple-400 text-gray-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </a>
                    </div>
                </nav>
            </div>
            <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
                <div className="absolute left-32 top-24">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 3C12 7.97 16.03 12 21 12C16.03 12 12 16.03 12 21C12 16.03 7.97 12 3 12C7.97 12 12 7.97 12 3Z"
                            stroke="#8B5CF6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg w-full max-w-lg">
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Sign Up - Step {step} of {getMaxSteps()}
                    </h2>
                    <form onSubmit={step === getMaxSteps() ? handleSignup : handleNext}>
                        {step === 1 && (
                            <div>
                                <label className="block mb-2 text-sm font-medium">Join As</label>
                                <select
                                    name="joinAs"
                                    value={tempFormData.joinAs || ""}
                                    onChange={handleSelectChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                >
                                    <option value="">Select Role</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="mentee">Mentee</option>
                                </select>
                            </div>
                        )}

                        {step === 2 && userType && (
                            <div>
                                <label className="block mb-2 text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={tempFormData.name || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Your Name"
                                />
                                <label className="block mb-2 text-sm font-medium">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={tempFormData.phone || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Your Phone Number"
                                />
                                <label className="block mb-2 text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={tempFormData.email || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Your Email"
                                />
                                <label className="block mb-2 text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={tempFormData.password || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Password"
                                />
                                <label className="block mb-2 text-sm font-medium">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={tempFormData.address || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Address"
                                />
                                <label className="block mb-2 text-sm font-medium">Family Annual Income</label>
                                <select
                                    name="familyAnnualIncome"
                                    value={tempFormData.familyAnnualIncome || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                >
                                    <option value="">Select Income Range</option>
                                    {incomeRanges.map((range) => (
                                        <option key={range} value={range}>
                                            {range}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {step === 3 && userType === "mentor" && (
                            <div>
                                <label className="block mb-2 text-sm font-medium">College</label>
                                <input
                                    type="text"
                                    name="college"
                                    value={tempFormData.college || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="College Name"
                                />
                                <label className="block mb-2 text-sm font-medium">Semester</label>
                                <input
                                    type="text"
                                    name="semester"
                                    value={tempFormData.semester || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Semester"
                                />
                                <label className="block mb-2 text-sm font-medium">Program</label>
                                <input
                                    type="text"
                                    name="program"
                                    value={tempFormData.program || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Program"
                                />
                                <label className="block mb-2 text-sm font-medium">Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={tempFormData.experience || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Experience"
                                />
                            </div>
                        )}

                        {step === 3 && userType === "mentee" && (
                            <div>
                                <label className="block mb-2 text-sm font-medium">School</label>
                                <input
                                    type="text"
                                    name="school"
                                    value={tempFormData.school || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="School Name"
                                />
                                <label className="block mb-2 text-sm font-medium">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={tempFormData.subject || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Subject"
                                />
                                <label className="block mb-2 text-sm font-medium">Class</label>
                                <input
                                    type="text"
                                    name="class"
                                    value={tempFormData.class || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Class"
                                />
                                <label className="block mb-2 text-sm font-medium">ID Card</label>
                                <input
                                    type="file"
                                    name="idCard"
                                    onChange={handleFileChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                />
                            </div>
                        )}

                        {step === 4 && (userType === "mentor" || userType === "mentee") && (
                            <div>
                                {userType === "mentor" && (
                                    <>
                                        <label className="block mb-2 text-sm font-medium">Skills</label>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {skillsList.map((skill) => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => handleSkillChange(skill)}
                                                    className={`px-3 py-1 rounded-full ${selectedSkills.includes(skill) ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"
                                                        }`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                        <label className="block mb-2 text-sm font-medium">Interests</label>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {interestsList.map((interest) => (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    onClick={() => handleInterestChange(interest)}
                                                    className={`px-3 py-1 rounded-full ${selectedInterests.includes(interest) ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"
                                                        }`}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                        <label className="block mb-2 text-sm font-medium">Exam Mastery</label>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {exams.map((exam) => (
                                                <button
                                                    key={exam}
                                                    type="button"
                                                    onClick={() => handleExamChange(exam)}
                                                    className={`px-3 py-1 rounded-full ${selectedExams.includes(exam) ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"
                                                        }`}
                                                >
                                                    {exam}
                                                </button>
                                            ))}
                                        </div>
                                        <label className="block mb-2 text-sm font-medium">LinkedIn</label>
                                        <input
                                            type="text"
                                            name="linkedin"
                                            value={tempFormData.linkedin || ""}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            placeholder="LinkedIn Profile URL"
                                        />
                                        <label className="block mb-2 text-sm font-medium">GitHub</label>
                                        <input
                                            type="text"
                                            name="github"
                                            value={tempFormData.github || ""}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            placeholder="GitHub Profile URL"
                                        />
                                        <label className="block mb-2 text-sm font-medium">Resume</label>
                                        <input
                                            type="file"
                                            name="resume"
                                            onChange={handleFileChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded"
                            >
                                {step === getMaxSteps() ? "Sign Up" : "Next"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;