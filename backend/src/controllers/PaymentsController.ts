// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/PaymentsController.ts
import { Request, Response } from 'express';
import { createPayment, getPayments, getPaymentsByParentId, getPaymentById, updatePaymentById, deletePaymentById } from '../services/PaymentService';
import {fetchStudentsByParentId} from "./StudentsController";
import {getStudentsByParentId} from "../services/StudentService";

export const addPayment = async (req: Request, res: Response) => {
  try {
    const payment = await createPayment(req.body);
    res.status(201).send(payment);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchPayments = async (req: Request, res: Response) => {
  try {
    const payments = await getPayments();
    res.status(200).send(payments);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchPaymentsByParentId = async (req: Request, res: Response) => {
  try {
    const payments = await getPaymentsByParentId(req.params.parentId);
    res.status(200).send(payments);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) {
      res.status(404).send({ message: 'Payment not found' });
      return;
    }
    res.status(200).send(payment);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const payment = await updatePaymentById(req.params.id, req.body);
    if (!payment) {
      res.status(404).send({ message: 'Payment not found' });
      return;
    }
    res.status(200).send(payment);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const payment = await deletePaymentById(req.params.id);
    if (!payment) {
      res.status(404).send({ message: 'Payment not found' });
      return;
    }
    res.status(200).send({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};