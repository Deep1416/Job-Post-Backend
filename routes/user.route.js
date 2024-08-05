import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controllers.js";
import isAuthenticated from "../middleware/isAuthicated.js";
import { singleUpload } from "../middleware/mutler.js";

const router = express.Router();

// Define the route for user registration
router.route("/register").post(singleUpload, register);

// Define the route for user login
router.route("/login").post(login);

// Define the route for user logout
router.route("/logout").get(logout);

// Define the route for updating user profile
router.route("/profile/update").put( isAuthenticated,singleUpload, updateProfile);

export default router;
