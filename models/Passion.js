import mongoose from 'mongoose';

const PassionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PassionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Passion || mongoose.model('Passion', PassionSchema);
