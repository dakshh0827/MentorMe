import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useMenteeStore = create((set) => ({
  mentors: [],
  isLoading: false,
  error: null,

  fetchMentors: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/users/fetch/mentors");
      set({ mentors: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch mentors", isLoading: false });
    }
  },
}));