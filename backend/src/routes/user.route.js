import express from "express";
import { getMentors, getMentorProfile, getMenteeProfile } from "../controllers/mentee.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/fetch/mentors", protectRoute, getMentors);
router.get("/mentorProfile/:mentorId", protectRoute, getMentorProfile);
router.get("/menteeProfile/:menteeId", protectRoute, getMenteeProfile);

export default router;