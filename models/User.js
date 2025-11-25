import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  image: { type: String },
  bio: { type: String },
  birthday: { type: Date },
  location: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  theme: { type: String, default: 'light' },
  voiceSettings: {
    enabled: { type: Boolean, default: true },
    language: { type: String, default: 'en-US' },
  },
  provider: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.index({ email: 1 });
UserSchema.index({ id: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
