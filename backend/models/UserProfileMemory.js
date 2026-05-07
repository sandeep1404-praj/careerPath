import mongoose from 'mongoose';

const userProfileMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  careerGoals: [String],
  skillLevel: { type: String, default: 'Beginner' },
  interests: [String],
  timeAvailability: String,
  learningPreferences: {
    pace: String, // slow, moderate, fast
    learningStyle: [String], // visual, kinesthetic, auditory, reading
    preferredRoadmapLength: String // short, medium, long
  },
  completedRoadmaps: [
    {
      roadmapId: mongoose.Schema.Types.ObjectId,
      title: String,
      completedAt: Date
    }
  ],
  preferences: {
    defaultTrack: String,
    enableEmailNotifications: Boolean,
    enableChatNotifications: Boolean
  },
  keyAchievements: [String],
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const UserProfileMemory = mongoose.model('UserProfileMemory', userProfileMemorySchema);
export default UserProfileMemory;
