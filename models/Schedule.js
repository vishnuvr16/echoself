import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  recurring: {
    enabled: { type: Boolean, default: false },
    pattern: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    endDate: { type: Date },
  },
  reminders: [{
    minutes: { type: Number },
    sent: { type: Boolean, default: false },
  }],
  color: { type: String, default: '#3b82f6' },
  category: { type: String },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ScheduleSchema.index({ userId: 1, startTime: 1 });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
