import express from "express";

import isAuthenticated from "../middleware/isAuthicated.js";
import {
  getAdminJobs,
  getallJob,
  getJobById,
  postJob,
} from "../controllers/job.controller.js";

const router = express.Router();

// Define the route for user registration
router.route("/post").post(isAuthenticated, postJob);

// Define the route for user login
router.route("/get").get(isAuthenticated, getallJob);

// Define the route for user logout
router.route("/get/:id").get(isAuthenticated, getJobById);

// Define the route for updating user profile
router.route("/getAdmin").get(isAuthenticated, getAdminJobs);

export default router;
