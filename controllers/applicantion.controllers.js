import { Job } from "../models/job.models.js";
import { Application } from "../models/application.models.js";
export const applyJob = async (req, res) => {
    try {
      const userId = req.id;
      const jobId = req.params.id;
  
      // Check if jobId is provided
      if (!jobId) {
        return res.status(400).json({
          message: "Job ID is required",
          success: false,
        });
      }
      // Check if the user has already applied for the job
      const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
      if (existingApplication) {
        return res.status(400).json({
          message: "You have already applied for this job",
          success: false,
        });
      }
  
      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          message: "Job not found",
          success: false,
        });
      }
  
      // Create a new application
      const newApplication = await Application.create({ job: jobId, applicant: userId });
  
      // Add the new application to the job's applications array
      job.application.push(newApplication._id);
      await job.save();
  
      return res.status(201).json({
        message: "Application submitted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error applying for job:", error);
      return res.status(500).json({
        message: "An error occurred while applying for the job",
        success: false,
      });
    }
  };
  

  export const getAppliedJob = async (req, res) => {
    try {
      const userId = req.id;
  
      // Find applications by the current user and populate job and company details
      const applications = await Application.find({ applicant: userId })
        .sort({ createdAt: -1 }) // Sort applications by creation date
        .populate({
          path: "job",
          populate: {
            path: "company",
          },
        });
  
      // Check if there are any applications
      if (applications.length === 0) {
        return res.status(404).json({
          message: "No applications found",
          success: false,
        });
      }
  
      return res.status(200).json({
        message: "Applications found",
        success: true,
        applications,
      });
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      return res.status(500).json({
        message: "An error occurred while fetching applied jobs",
        success: false,
      });
    }
  };
  

  export const getApplicants = async (req, res) => {
    try {
      const jobId = req.params.id;
  
      // Find the job by its ID and populate the applications and their applicants
      const job = await Job.findById(jobId).populate({
        path: "application", // Correct path
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "applicant", // Assuming the Application schema has an 'applicant' field
        },
      });
      
  
      // If the job is not found
      if (!job) {
        return res.status(404).json({
          message: "Job not found",
          success: false,
        });
      }
  
      // Return the job with applications and applicants
      return res.status(200).json({
        message: "Applications found",
        success: true,
        applications: job.application, // Use 'applications' to match the populated field
      });
    } catch (error) {
      console.error("Error fetching applicants:", error);
      return res.status(500).json({
        message: "An error occurred while fetching applicants",
        success: false,
      });
    }
  };
  
  

  export const updateStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const applicationId = req.params.id;
  
      // Check if status is provided
      if (!status) {
        return res.status(400).json({
          message: "Status is required",
          success: false,
        });
      }
  
      // Find application by ID
      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          message: "Application not found",
          success: false,
        });
      }
  
      // Update status
      application.status = status.toLowerCase();
      await application.save();
  
      return res.status(200).json({
        message: "Status updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  };
  
