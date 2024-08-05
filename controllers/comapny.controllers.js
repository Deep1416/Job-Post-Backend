import { Company } from "../models/company.models.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloundinary.js";
export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;

    // Check if the company name is provided
    if (!companyName) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "Company name is required",
        success: false,
      });
    }

    // Check if the company already exists
    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "A company with this name is already registered",
        success: false,
      });
    }

    // Create a new company
    company = await Company.create({
      name: companyName,
      userId: req.id, // Assuming `req.id` contains the ID of the authenticated user
    });

    // Return success response
    return res.status(201).json({
      message: "Company registered successfully",
      success: true,
      company, // Optionally return the created company object
    });
  } catch (error) {
    console.error("Error registering company:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred",
      success: false,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });

    // Check if any companies were found
    if (!companies || companies.length === 0) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "No companies found for the user",
        success: false,
      });
    }

    // Return the found companies
    return res.status(200).json({
      message: "Companies found",
      success: true,
      companies, // Return the list of companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred",
      success: false,
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Find the company by its ID
    const company = await Company.findById(companyId);

    // If the company is not found
    if (!company) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "Company not found",
        success: false,
      });
    }

    // If the company is found
    return res.status(200).json({
      message: "Company found",
      success: true,
      company, // Return the found company data
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred",
      success: false,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    // console.log(name, description, website, location);

      const file = req.file; // Uncomment if handling file uploads
    // cloudinary // Add your file upload logic here, if needed
    const fileUri = getDataUri(file);

    const cloudResponse =await cloudinary.uploader.upload(fileUri.content)
    const logo = cloudResponse.secure_url

    // Prepare the data to be updated
    const updatedData = { name, description, website, location ,logo};

    // Update the company details in the database
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    // If the company is not found
    if (!company) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "Company not found",
        success: false,
      });
    }

    // If the company is successfully updated
    return res.status(200).json({
      message: "Company updated successfully",
      success: true,
      company, // Return the updated company data
    });
  } catch (error) {
    console.error("Update company error:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred",
      success: false,
    });
  }
};
