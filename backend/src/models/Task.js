import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  category: { type: String, enum: ['Assignment', 'Exam', 'Project', 'Personal', 'Reading', 'Other'], default: 'Assignment' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  course: { type: String, trim: true, maxlength: 80, default: '' }
}, { timestamps: true });

taskSchema.index({ user: 1, dueDate: 1, status: 1 });
export default mongoose.model('Task', taskSchema);
