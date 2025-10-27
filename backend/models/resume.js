import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    thumbnail: { type: String },

    template: {
      theme: { type: String },
      colorPalette: { type: [String] },
    },

    profileInfo: {
      photo: { type: String }, // base64 encoded image
      profilePreviewUrl: { type: String },
      fullName: { type: String },
      designation: { type: String },
      summary: { type: String },
    },

    contactInfo: {
      email: { type: String },
      phoneNo: { type: String },
      location: { type: String },
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
    },

    workExperience: [
      {
        company: { type: String },
        role: { type: String },
        startingDate: { type: String },
        endDate: { type: String },
        description: { type: String },
      },
    ],

    education: [
      {
        degree: { type: String },
        institute: { type: String },
        startDate: { type: String },
        endDate: { type: String },
      },
    ],

    skills: [
      {
        name: { type: String },
        progress: { type: Number }, // percentage 0–100
      },
    ],

    projects: [
      {
        title: { type: String },
        description: { type: String },
        github: { type: String },
        liveDemo: { type: String },
      },
    ],

    certificates: [
      {
        title: { type: String },
        issuer: { type: String },
        year: { type: String },
      },
    ],

    languages: [
      {
        name: { type: String },
        progress: { type: Number },
      },
    ],

    interests: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
