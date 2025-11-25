import mongoose from 'mongoose';

const RoadmapTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roadmapId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  day: { type: Number },
  week: { type: Number },
  month: { type: Number },
  completed: { type: Boolean, default: false },
  order: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RoadmapTaskSchema.index({ roadmapId: 1, order: 1 });
RoadmapTaskSchema.index({ userId: 1 });

export default mongoose.models.RoadmapTask || mongoose.model('RoadmapTask', RoadmapTaskSchema);
