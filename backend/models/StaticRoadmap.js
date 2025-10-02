import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  estimatedTime: { type: String }, // e.g., "2 weeks"
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  category: { type: String }, // e.g., "Frontend", "Backend", "Database"
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['video', 'article', 'course', 'practice'] }
  }],
  order: { type: Number, required: true }
});

const staticRoadmapSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  track: { type: String, required: true }, // e.g., "Frontend Developer", "Backend Developer"
  description: { type: String },
  color: { type: String, default: '#3B82F6' }, // Color theme for the track
  icon: { type: String }, // Icon name or emoji
  tasks: [taskSchema],
  totalEstimatedTime: { type: String }, // e.g., "6 months"
  prerequisites: [String], // Array of prerequisite skills
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
staticRoadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("StaticRoadmap", staticRoadmapSchema);