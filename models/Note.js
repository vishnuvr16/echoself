import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  color: { type: String, default: '#fef3c7' },
  pinned: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, pinned: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
