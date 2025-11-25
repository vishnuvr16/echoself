import mongoose from 'mongoose';

const EmbeddingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  embedding: [{ type: Number }],
  sourceType: { type: String, enum: ['diary', 'note', 'passion', 'movie'], required: true },
  sourceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

EmbeddingSchema.index({ userId: 1, sourceType: 1 });

export default mongoose.models.Embedding || mongoose.model('Embedding', EmbeddingSchema);
