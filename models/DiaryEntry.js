import mongoose from 'mongoose';

const DiaryEntrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  content: { type: String, required: true },
  mood: { type: String },
  aiSummary: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DiaryEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.models.DiaryEntry || mongoose.model('DiaryEntry', DiaryEntrySchema);
