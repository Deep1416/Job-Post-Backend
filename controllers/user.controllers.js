import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloundinary.js";

// Register Function
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    const file = req.file;

    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    // Check for missing fields
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "Required fields are missing",
        success: false,
      });
    }

    // Optional: Validate email format, phone number, and role here

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "User already exists!",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file upload if a file is provided

    // Create the new user
    const newUser = await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      }, // Save the profile picture URL if available
    });

    // Send success response
    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: newUser, // Optionally include the newly created user data
    });
  } catch (error) {
    console.error("Register User error:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "Internal server error",
      success: false,
    });
  }
};

// Login Function
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // console.log(email, password, role );

    // Check for missing fields
    if (!email || !password || !role) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "Something is missing",
        success: false,
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "User does not exist!",
        success: false,
      });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        name: "UnauthorizedError",
        message: "Incorrect password!",
        success: false,
      });
    }

    // Check if role is correct
    if (role !== user.role) {
      return res.status(403).json({
        name: "ForbiddenError",
        message: "Account does not exist with the current role!",
        success: false,
      });
    }

    // Generate token
    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Set cookie and send response
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        // httpOnly: true,
        sameSite: "none",
        secure :true
      })
      .json({
        message: `Welcome, ${user.fullname}!`,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profile: user.profile,
        },
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the token cookie by setting it to an empty string and expiring it immediately
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // console.log(req.body);
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    // Validate required fields
    if (!fullname || !email || !phoneNumber || !bio || !skills) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "Required fields are missing",
        success: false,
      });
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.id) {
      return res.status(409).json({
        name: "ConflictError",
        message: "Email is already in use by another account",
        success: false,
      });
    }

    // Find the user by ID
    const userId = req.id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "User not found",
        success: false,
      });
    }

    // Limit the number of skills
    const skillsArray = skills.split(",").map((skill) => skill.trim());
    if (skillsArray.length > 10) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "You can add up to 10 skills only",
        success: false,
      });
    }

    // Update user profile details
    user.fullname = fullname;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.profile.bio = bio;
    user.profile.skills = skillsArray;

    // Handle file upload if a file is present
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
      user.profile.resumeOriginal = file.originalname; // Save the original file name
    }

    // Save the updated user information
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
      success: true,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "Internal server error",
      success: false,
    });
  }
};
