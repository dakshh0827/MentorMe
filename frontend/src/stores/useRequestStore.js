import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-toastify";

const socket = io("http://localhost:5001");

const useRequestStore = create((set, get) => ({
  pendingRequests: [],
  resolvedRequests: [],
  isLoading: false,
  error: null,

  fetchRequests: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.get(`/requests/mentor/${userId}`);
  
      console.log("Fetched requests res:", res); // Debugging log
      console.log("Fetched requests data:", res.data); // Debugging log
  
      if (!res.data || !Array.isArray(res.data)) {
        console.log("entered error");
        console.error("Invalid response format:", res.data);
        set({ requests: [], isLoading: false }); // Set empty requests array
        return [];
      }
      set({ pendingRequests: res.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch requests",
        isLoading: false,
      });
      toast.error("Failed to fetch requests");
      return [];
    }
  },

  fetchResolvedRequests: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.get(`/requests/resolved/${userId}`);
  
      // Check if the response data is valid
      if (!res.data || !Array.isArray(res.data)) {
        console.error("Invalid response format for resolved requests:", res.data);
        set({ resolvedRequests: res.data, isLoading: false }); // Set to empty array
        return; // Early return to prevent further errors
      }

      set({ resolvedRequests: res.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch resolved requests",
        isLoading: false,
      });
      toast.error("Failed to fetch resolved requests");
    }
  },

  sendRequest: async (from, to) => {
    try {
        if (!from || !to) {
            console.error("Missing required fields: from, to");
            return;
        }
        console.log("sending...");
        const res = await axiosInstance.post("/requests", { from, to });
        socket.emit("sendRequest", res.data.request);
        set((state) => ({ requests: [...state.requests, res.data.request] }));
    } catch (error) {
        console.error("Failed to send request.", error);
    }
},

  acceptRequest: async (requestId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.post(`/requests/${requestId}/accept`);
      set((state) => ({
        requests: state.requests.filter((req) => req._id !== requestId),
        resolvedRequests: [...state.resolvedRequests, res.data],
        isLoading: false,
      }));
      toast.success("Request accepted successfully");
    } catch (error) {
      set({ error: "Failed to accept request", isLoading: false });
      toast.error("Failed to accept request");
    }
  },

  rejectRequest: async (requestId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.post(`/requests/${requestId}/reject`);
      set((state) => ({
        requests: state.requests.filter((req) => req._id !== requestId),
        resolvedRequests: [...state.resolvedRequests, res.data],
        isLoading: false,
      }));
      toast.info("Request rejected");
    } catch (error) {
      set({ error: "Failed to reject request", isLoading: false });
      toast.error("Failed to reject request");
    }
  },

  listenForUpdates: (userId) => {
    console.log("Listening for updates for user:", userId);
    socket.emit("join", userId);

    socket.on("newRequest", (request) => {
      set((state) => ({ requests: [...state.requests, request] }));
    });

    socket.on("requestUpdated", (updatedRequest) => {
      set((state) => ({
        requests: state.requests.map((req) =>
          req._id === updatedRequest._id ? updatedRequest : req
        ),
      }));
    });
  },
}));

export default useRequestStore;
