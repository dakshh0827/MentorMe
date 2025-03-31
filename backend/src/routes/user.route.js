import express from "express";
import { getMentors } from "../controllers/mentee.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/fetch/mentors", protectRoute, getMentors);

export default router;