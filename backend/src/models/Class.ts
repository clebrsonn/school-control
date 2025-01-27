// filepath: /e:/IdeaProjects/school-control/backend/src/models/ClassModel.ts
import mongoose from 'mongoose';

export interface IClass extends mongoose.Document {
  studentId: mongoose.Schema.Types.ObjectId;
  className: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const Class = mongoose.model<IClass>('Class', classSchema);

export default Class;