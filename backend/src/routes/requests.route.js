import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { sendRequest, respondToRequest, getRequestsForUser } from "../controllers/requests.controller.js";
import { getMentorRequests, getResolvedRequests, acceptRequest, rejectRequest } from "../controllers/resolvedRequests.controller.js";


const router = express.Router();

router.post("/", sendRequest);
router.put("/:id", respondToRequest);
router.get("/:userId", getRequestsForUser);

// Get requests for a mentor
router.get('/mentor/:mentorId', protectRoute, getMentorRequests);
// Get resolved requests for a mentor
router.get('/resolved/:mentorId', protectRoute, getResolvedRequests);

// Accept a request
router.post('/:requestId/accept', protectRoute, acceptRequest);

// Reject a request
router.post('/:requestId/reject', protectRoute, rejectRequest);

export default router;
