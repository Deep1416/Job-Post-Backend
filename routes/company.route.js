import express from "express";

import isAuthenticated from "../middleware/isAuthicated.js";
import {
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
} from "../controllers/comapny.controllers.js";
import { singleUpload } from "../middleware/mutler.js";

const router = express.Router();

// Define the route for user registration
router.route("/register").post(isAuthenticated, registerCompany);

// Define the route for user login
router.route("/getCompany").get(isAuthenticated, getCompany);

// Define the route for user logout
router.route("/getCompany/:id").get(isAuthenticated, getCompanyById);

// Define the route for updating user profile
router.route("/update/:id").put(isAuthenticated, singleUpload, updateCompany);

export default router;
