import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['movie', 'show', 'series'], default: 'movie' },
  rating: { type: Number, min: 0, max: 10 },
  genre: [{ type: String }],
  watchedDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MovieSchema.index({ userId: 1, watchedDate: -1 });

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
