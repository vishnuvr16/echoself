import mongoose from 'mongoose';

const TwinMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

TwinMessageSchema.index({ userId: 1, createdAt: 1 });

export default mongoose.models.TwinMessage || mongoose.model('TwinMessage', TwinMessageSchema);
