import mongoose from 'mongoose';

export interface IMensalidade extends mongoose.Document {
  amount: number;
  dueDate: Date;
  parentId: mongoose.Schema.Types.ObjectId;
  isPaid: boolean;
}

const mensalidadeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  isPaid: { type: Boolean, default: false },
});

const Mensalidade = mongoose.model<IMensalidade>('Mensalidade', mensalidadeSchema);

export default Mensalidade;