import { Request, Response } from 'express';
import { createMensalidade, getMensalidadesByParentId, updateMensalidadeById, deleteMensalidadeById } from '../services/MonthlyFeeService';

export const addMensalidade = async (req: Request, res: Response) => {
  try {
    const mensalidade = await createMensalidade(req.body);
    res.status(201).send(mensalidade);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchMensalidadesByParentId = async (req: Request, res: Response) => {
  try {
    const mensalidades = await getMensalidadesByParentId(req.params.parentId);
    res.status(200).send(mensalidades);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const updateMensalidade = async (req: Request, res: Response) => {
  try {
    const mensalidade = await updateMensalidadeById(req.params.id, req.body);
    if (!mensalidade) {
      res.status(404).send({ message: 'Mensalidade not found' });
      return;

    }
    res.status(200).send(mensalidade);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const deleteMensalidade = async (req: Request, res: Response) => {
  try {
    const mensalidade = await deleteMensalidadeById(req.params.id);
    if (!mensalidade) {
      res.status(404).send({ message: 'Mensalidade not found' });
      return;
    }
    res.status(200).send({ message: 'Mensalidade deleted successfully' });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};