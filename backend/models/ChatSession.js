import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const sessionContextSchema = new mongoose.Schema({
  careerGoal: String,
  skillLevel: String,
  interests: [String],
  timeAvailability: String
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  messages: [messageSchema],
  sessionContext: sessionContextSchema,
  summary: String,
  lastSummarizedAt: Date,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  messageCount: { type: Number, default: 0 }
});

// Update messageCount before saving
chatSessionSchema.pre('save', function (next) {
  this.messageCount = this.messages.length;
  this.updatedAt = Date.now();
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
