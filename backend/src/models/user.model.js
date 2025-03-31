import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Common fields for both mentors and mentees
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    address: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      required: true,
    },

    // Mentor-specific fields
    college: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    semester: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    program: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    experience: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    skills: {
      type: [String], // Array of skills
      required: function () {
        return this.role === "mentor";
      },
    },
    linkedin: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    github: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // Change the default value to null
    },
    familyAnnualIncome: {
      type: String,
      required: function () {
        return this.role === "mentor";
      },
    },
    interests: {
      type: [String], // Array of interests
      required: function () {
        return this.role === "mentor";
      },
    },
    examMastery: {
      type: [String], // Array of exams the mentor has mastery in
      required: function () {
        return this.role === "mentor";
      },
    },

    // Mentee-specific fields
    school: {
      type: String,
      required: function () {
        return this.role === "mentee";
      },
    },
    subject: {
      type: String,
      required: function () {
        return this.role === "mentee";
      },
    },
    class: {
      type: String,
      required: function () {
        return this.role === "mentee";
      },
    },
    idCard: {
      type: String,
      required: function () {
        return this.role === "mentee";
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;