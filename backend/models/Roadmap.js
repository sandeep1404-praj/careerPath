import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  steps: [{ type: String }], // simple array for now
});

export default mongoose.model("Roadmap", roadmapSchema);
