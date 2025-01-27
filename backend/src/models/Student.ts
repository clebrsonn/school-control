// filepath: /e:/IdeaProjects/school-control/backend/src/models/StudentModel.ts
import mongoose from 'mongoose';

export interface IStudent extends mongoose.Document {
  nome: string;
  parentId: mongoose.Schema.Types.ObjectId;
}

const studentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  horarioInicio: { type: String, required: true }, // Exemplo: "08:00"
  horarioFim: { type: String, required: true },    // Exemplo: "12:00"
  valorMatricula: { type: Number, required: true },
  valorMensalidade: { type: Number, required: true },

});

const Student = mongoose.model<IStudent>('Student', studentSchema);

export default Student;