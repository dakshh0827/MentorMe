import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { getMentors } from "../controllers/mentee.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);

router.get("/users/fetch/mentors", protectRoute, getMentors);

router.get("/check", protectRoute, checkAuth);

export default router;