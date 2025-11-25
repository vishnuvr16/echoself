import mongoose from 'mongoose';

const PasswordItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  service: { type: String, required: true },
  username: { type: String },
  encryptedPassword: { type: String, required: true },
  category: { type: String, default: 'personal' },
  url: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PasswordItemSchema.index({ userId: 1, category: 1 });

export default mongoose.models.PasswordItem || mongoose.model('PasswordItem', PasswordItemSchema);
