import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js"; // Import your router
import companyRoutes from "./routes/company.route.js";
import jobRoutes from "./routes/job.route.js";
import applicationRoutes from "./routes/application.route.js";
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Use express.json() as a middleware function
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS options
const corsOptions = {
  origin: "http://localhost:5173", // Corrected URL
  credentials: true,
};
app.use(cors(corsOptions));

// Use the imported router
app.use("/api/v1/users", userRoutes); // Prefix routes with /api/users
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/application", applicationRoutes);

// Connect to the database and start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}!!`);
});
