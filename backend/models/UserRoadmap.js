import mongoose from "mongoose";

const userTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true }, // Reference to static task ID or custom task ID
  name: { type: String, required: true }, // Task name (for custom tasks or copied from static)
  description: { type: String },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed'], 
    default: 'not-started' 
  },
  isCustom: { type: Boolean, default: false }, // True if user created this task
  staticTaskId: { type: String }, // Original static task ID (if applicable)
  roadmapTrack: { type: String }, // Track this task belongs to
  estimatedTime: { type: String },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'] 
  },
  category: { type: String },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['video', 'article', 'course', 'practice'] }
  }],
  notes: { type: String }, // User's personal notes
  order: { type: Number, required: true }, // User's custom ordering
  addedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now }
});

const userPreferencesSchema = new mongoose.Schema({
  defaultTrack: { type: String, default: '' },
  showCompleted: { type: Boolean, default: true },
  sortBy: {
    type: String,
    enum: ['order', 'addedAt', 'difficulty', 'track'],
    default: 'order'
  }
}, { _id: false });

const userRoadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tasks: [userTaskSchema],
  preferences: {
    type: userPreferencesSchema,
    default: () => ({
      defaultTrack: '',
      showCompleted: true,
      sortBy: 'order'
    })
  },
  stats: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    inProgressTasks: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update stats and timestamp before saving
userRoadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update stats
  this.stats.totalTasks = this.tasks.length;
  this.stats.completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  this.stats.inProgressTasks = this.tasks.filter(task => task.status === 'in-progress').length;
  
  next();
});

// Index for faster queries
userRoadmapSchema.index({ userId: 1 });
userRoadmapSchema.index({ 'tasks.status': 1 });
userRoadmapSchema.index({ 'tasks.roadmapTrack': 1 });

export default mongoose.model("UserRoadmap", userRoadmapSchema);