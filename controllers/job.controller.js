import { Job } from "../models/job.models.js";
// admin post
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobtype,
      position,
      experience,
      companyId,
    } = req.body;

    // Ensure all required fields are provided
    console.log(
      title,
      description,
      requirements,
      salary,
      location,
      jobtype,
      position,
      experience,
      companyId
    );

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobtype ||
      !position ||
      !experience ||
      !companyId
    ) {
      return res.status(400).json({
        name: "BadRequestError",
        message: "Missing required fields",
        success: false,
      });
    }

    // Create a new job posting
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","), // Convert comma-separated string to array
      salary: Number(salary), // Ensure salary is a number
      location,
      jobtype,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: req.id, // Use the authenticated user ID
    });

    // Respond with the created job
    return res.status(201).json({
      message: "New job created successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred while creating the job",
      success: false,
    });
  }
};

//student
export const getallJob = async (req, res) => {
  try {
    // Extract keyword from query parameters, default to an empty string
    const keyword = req.query.keyword || "";

    // Construct the query to search jobs based on title or description
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    // Find jobs based on the query
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    // Check if jobs are found
    if (jobs.length === 0) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "No jobs found matching the criteria",
        success: false,
      });
    }

    // Respond with the found jobs
    return res.status(200).json({
      message: "Jobs found successfully",
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred while retrieving jobs",
      success: false,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id; // Correct the parameter name to lowercase 'id'
    const job = await Job.findById(jobId).populate({
      path: "application",
    });

    if (!job) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "Job not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job found",
      job, // Return the found job object
      success: true,
    });
  } catch (error) {
    console.error("Error retrieving job by ID:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred while retrieving the job",
      success: false,
    });
  }
};

// admin post
export const getAdminJobs = async (req, res) => {
  try {
    // Extract admin ID from request
    const adminId = req.id;
    // console.log(adminId);

    // Find jobs created by the admin
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });

    // Check if jobs are found
    if (!jobs) {
      return res.status(404).json({
        name: "NotFoundError",
        message: "No jobs found for the specified admin",
        success: false,
      });
    }

    // Respond with the found jobs
    return res.status(200).json({
      message: "Jobs found successfully",
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Error retrieving admin jobs:", error);
    return res.status(500).json({
      name: "InternalServerError",
      message: "An unexpected error occurred while retrieving jobs",
      success: false,
    });
  }
};
