import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  steps: [{ type: String }], // simple array for now
  estimatedTime: { type: String, required: true },
  status: { type: String, default: 'pending' },
  assignedAt: { type: Date, default: Date.now },
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  }
});

export default mongoose.model("Roadmap", roadmapSchema);
