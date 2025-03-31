import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    console.log("Backend signup called...");
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);

    // Extract common fields
    const { name, email, phone, password, joinAs, address, familyAnnualIncome } = req.body;

    if (!name || !email || !phone || !password || !joinAs || !address || !familyAnnualIncome) {
      return res.status(400).json({ message: "Name, email, phone, password, role, address, and familyAnnualIncome are required" });
    }

    if (!["mentor", "mentee"].includes(joinAs)) {
      return res.status(400).json({ message: "Invalid role. Must be either 'mentor' or 'mentee'" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      name,
      email,
      phone,
      password: hashedPassword,
      role: joinAs,
      address,
      familyAnnualIncome,
    };

    // Mentor-specific fields
    if (joinAs === "mentor") {
      const { college, semester, program, experience, skills, linkedin, github, interests, examMastery } = req.body;
      if (!college || !semester || !program || !experience || !skills || !linkedin || !interests || !examMastery) {
        return res.status(400).json({ message: "Mentor fields are required" });
      }
      userData.college = college;
      userData.semester = semester;
      userData.program = program;
      userData.experience = experience;
      userData.skills = skills;
      userData.linkedin = linkedin;
      userData.interests = interests;
      userData.examMastery = examMastery;
      if (github) userData.github = github;

      // Upload resume if provided
      if (req.files && req.files.resume) {
        const resumeUpload = await cloudinary.uploader.upload(req.files.resume.tempFilePath, {
          folder: "mentor_resumes",
          resource_type: "raw",
        });
        userData.resume = resumeUpload.secure_url;
      }
    }

    // Mentee-specific fields
    else if (joinAs === "mentee") {
      const { school, subject, class: studentClass } = req.body;
      if (!school || !subject || !studentClass) {
        return res.status(400).json({ message: "Mentee fields are required" });
      }
      userData.school = school;
      userData.subject = subject;
      userData.class = studentClass;

      // Upload ID card if provided
      if (req.files && req.files.idCard) {
        const idCardUpload = await cloudinary.uploader.upload(req.files.idCard.tempFilePath, {
          folder: "mentee_id_cards",
        });
        userData.idCard = idCardUpload.secure_url;
      }
    }

    // Create user and save to database
    const newUser = new User(userData);
    await newUser.save();

    // Generate JWT and send response
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      profilePic: newUser.profilePic,
      address: newUser.address,
      familyAnnualIncome : newUser.familyAnnualIncome
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = {};
    
    // Handle text field updates
    const allowedFields = [
      'name', 'phone', 'address', 
      // Mentor fields
      'college', 'semester', 'program', 'experience', 'skills', 'linkedin', 'github',
      // Mentee fields
      'school', 'subject', 'class'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Special handling for 'class' field due to JavaScript reserved keyword
        if (field === 'class') {
          updateData['class'] = req.body[field];
        } else {
          updateData[field] = req.body[field];
        }
      }
    });
    
    // Handle file uploads
    if (req.files) {
      // Profile picture
      if (req.files.profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath);
        updateData.profilePic = uploadResponse.secure_url;
      }
      
      // Resume for mentors
      if (req.files.resume) {
        const resumeUpload = await cloudinary.uploader.upload(req.files.resume.tempFilePath, {
          folder: "mentor_resumes",
          resource_type: "raw"
        });
        updateData.resume = resumeUpload.secure_url;
      }
      
      // ID Card for mentees
      if (req.files.idCard) {
        const idCardUpload = await cloudinary.uploader.upload(req.files.idCard.tempFilePath, {
          folder: "mentee_id_cards"
        });
        updateData.idCard = idCardUpload.secure_url;
      }
    }
    
    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profilePic: updatedUser.profilePic,
      role: updatedUser.role
    });
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all mentors (for mentees to browse)
export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" })
      .select('name college program skills experience profilePic')
      .sort({ createdAt: -1 });
    
    res.status(200).json(mentors);
  } catch (error) {
    console.log("Error in getAllMentors controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Search mentors by skills or program
export const searchMentors = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const mentors = await User.find({
      role: "mentor",
      $or: [
        { skills: { $regex: query, $options: 'i' } },
        { program: { $regex: query, $options: 'i' } }
      ]
    }).select('name college program skills experience profilePic');
    
    res.status(200).json(mentors);
  } catch (error) {
    console.log("Error in searchMentors controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};