// filepath: /e:/IdeaProjects/school-control/backend/src/services/PaymentService.ts
import {Enrollment, IEnrollment, ITuition, Tuition} from '@hyteck/shared';
import mongoose from 'mongoose';
import {getParentById} from "./ParentService";
import {getDiscountsByType} from "./DiscountService";
import {createEnrollment, updateEnrollmentById} from "./EnrollmentService";
import {StudentService} from "./StudentService";

export const createPayment = async (data: Partial<IEnrollment>) => {
  const payment = await createEnrollment(data);
  await generatePaymentRecurrences(payment);
  return payment;
};


const generatePaymentRecurrences = async (data: IEnrollment) => {
  const today = new Date();

  const actualMonth= today.getMonth();

  const student= await new StudentService().findById(data.student as unknown as string)
  const parent= (await getParentById(student?.responsible as unknown as string));

  const discount= parent?.students && parent.students.length > 1 ? await getDiscountsByType('tuition'): null;
  const monthlyFee = 110 - (discount?.value ?? 0); // Valor da mensalidade
  const discountEnroll= parent?.students && parent.students.length > 1 ? await getDiscountsByType('enroll'): null;
  data.fee = data.fee - (discountEnroll?.value ?? 0) ;

  await updateEnrollmentById(data._id as string, {fee: data.fee});

  for (let i = 1; i <= 12 - actualMonth; i++) {
    const dueDate = new Date(today.getFullYear(), actualMonth + i, 10);
    const paymentData: Partial<ITuition> = {
      amount: monthlyFee,
      status: "pending",
      dueDate: dueDate,
      responsible: student?.responsible._id,
      enrollment: data._id as unknown as mongoose.Types.ObjectId,
      discount: discount?._id as mongoose.Types.ObjectId | undefined
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
  return Tuition.find({ responsible }).populate('enrollment').sort({ dueDate: 1 });
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