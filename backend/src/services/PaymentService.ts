// filepath: /e:/IdeaProjects/school-control/backend/src/services/PaymentService.ts
import {Enrollment, IEnrollment, ITuition, Tuition} from '@hyteck/shared';
import {getStudentById} from "./StudentService";
import mongoose from 'mongoose';

export const createPayment = async (data: Partial<IEnrollment>) => {

  const payment = new Enrollment(data);
  await payment.save();

  console.log('Enrollment', payment);

  // // Associar o aluno à classe após o pagamento
  // const classInstance = await Class.findById(data.classId);
  // if (!classInstance) {
  //   throw new Error('Class not found');
  // }
  // //classInstance.students.push(data.studentId);
  // await classInstance.save();

  // Gerar recorrências de pagamento (exemplo: mensalidades)
  await generatePaymentRecurrences(payment);

  return payment;
};

const generatePaymentRecurrences = async (data: IEnrollment) => {
  const monthlyFee = 110; // Valor da mensalidade
  const today = new Date();

  const actualMonth= today.getMonth();

  const student= await getStudentById(data.student as unknown as string)

  for (let i = 1; i <= 12 - actualMonth; i++) {
    const dueDate = new Date(today.getFullYear(), actualMonth + i, 10);
    const paymentData: Partial<ITuition> = {
      amount: monthlyFee,
      status: "pending",
      dueDate: dueDate,
      responsible: student?.responsible._id,
      enrollment: data._id as unknown as mongoose.Types.ObjectId

    };
    const payment = new Tuition(paymentData);
    console.log('payment', payment);
    await payment.save();
  }
};

export const getPayments = async () => {
  return Tuition.find().populate('enrollment');
};

export const getPaymentsByParentId = async (responsible: string) => {
  return Tuition.find({ responsible }).populate('enrollment');
};

export const getPaymentById = async (id: string) => {
  return await Tuition.findById(id).populate('student');
};

export const updatePaymentById = async (id: string, data: Partial<IEnrollment>) => {
  return await Tuition.findByIdAndUpdate(id, data, { new: true }).populate('student').populate('classId');
};

export const deletePaymentById = async (id: string) => {
  return await Tuition.findByIdAndDelete(id);
};