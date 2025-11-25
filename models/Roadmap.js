import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  durationUnit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' },
  createdByAI: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RoadmapSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
