import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      // This checks for user in localStorage
      const user = await authService.getCurrentUser();
      set({ authUser: user, isCheckingAuth: false });
    } catch (error) {
      console.error('Authentication check failed:', error);
      set({ authUser: null, isCheckingAuth: false });
      return null;
    }
  },
  
  // In your useAuthStore.js
  signup: async (userData, userType, onSuccess) => {
    try {
        console.log("Creating FormData from:", userData);

        const formData = new FormData();

        // Add basic fields
        formData.append("name", userData.name || "");
        formData.append("email", userData.email || "");
        formData.append("phone", userData.phone || "");
        formData.append("password", userData.password || "");
        formData.append("joinAs", userType || "");
        formData.append("address", userData.address || "");

        if (userType === "mentor") {
            formData.append("college", userData.college || "");
            formData.append("semester", userData.semester || "");
            formData.append("program", userData.program || "");
            formData.append("experience", userData.experience || "");
            formData.append("linkedin", userData.linkedin || "");
            formData.append("familyAnnualIncome", userData.familyAnnualIncome || "");

            // Handle skills, interests, and exam mastery as arrays
            if (userData.skills && Array.isArray(userData.skills)) {
                userData.skills.forEach(skill => formData.append("skills", skill));
            }
            if (userData.interests && Array.isArray(userData.interests)) {
                userData.interests.forEach(interest => formData.append("interests", interest));
            }
            if (userData.examMastery && Array.isArray(userData.examMastery)) {
                userData.examMastery.forEach(exam => formData.append("examMastery", exam));
            }

            if (userData.github) {
                formData.append("github", userData.github);
            }

            if (userData.resume && userData.resume instanceof File) {
                formData.append("resume", userData.resume);
            }
        } else if (userType === "mentee") {
            formData.append("school", userData.school || "");
            formData.append("subject", userData.subject || "");
            formData.append("class", userData.class || "");
            formData.append("familyAnnualIncome", userData.familyAnnualIncome || "");

            if (userData.idCard && userData.idCard instanceof File) {
                formData.append("idCard", userData.idCard);
            }
        }

        // Debug log to confirm FormData is populated correctly
        console.log("FormData entries:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        const response = await axiosInstance.post('/auth/signup', formData);

        // THIS IS THE IMPORTANT ADDITION: Update the authUser state
        const userDataFromResponse = response.data.user || response.data; // Rename to avoid confusion
        set({
            authUser: userDataFromResponse,
            userType: userType
        });

        console.log("Auth state updated after signup:", userDataFromResponse);

        if (onSuccess && typeof onSuccess === 'function') {
            onSuccess();
        }

        return response.data;
    } catch (error) {
        console.log("Signup error:", error);
        throw error;
    }
},

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("Attempting to login with data:", data);
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login successful:", res.data);
  
      set({ authUser: res.data }); // Store authenticated user data
      toast.success("Logged in successfully");
      
      return true; // Indicate success
    } catch (error) {
      console.log("Error during login:", error);
      let errorMessage = "An error occurred during login.";
  
      if (error.response) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from the server. Please try again later.";
      }
  
      toast.error(errorMessage);
      return false; // Indicate failure
    } finally {
      set({ isLoggingIn: false });
    }
  },  

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out.");
    }
  },
}));
