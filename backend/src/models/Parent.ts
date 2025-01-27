// filepath: /e:/IdeaProjects/school-control/backend/src/models/responsavelModel.ts
import mongoose from 'mongoose';

export interface IParent extends mongoose.Document {
  nome: string;
  alunos: string[];
}

const parentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  alunos: { type: [String], required: true },
});

const Parent = mongoose.model<IParent>('Parent', parentSchema);

export default Parent;