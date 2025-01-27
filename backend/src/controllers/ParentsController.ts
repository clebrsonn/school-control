// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/responsavelController.ts
import { Request, Response } from 'express';
import { createParent, getParents, getParentById, updateParentById, deleteParentById } from '../services/ParentService';

export const addParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parent = await createParent(req.body);
    res.status(201).send(parent);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchParents = async (req: Request, res: Response): Promise<void> => {
  try {
    const parents = await getParents();
    res.status(200).send(parents);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const fetchParentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const parent = await getParentById(req.params.id);
    if (!parent) {
      res.status(404).send({ message: 'Parent not found' });
      return;
    }
    res.status(200).send(parent);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const updateParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parent = await updateParentById(req.params.id, req.body);
    if (!parent) {
      res.status(404).send({ message: 'Parent not found' });
      return;
    }
    res.status(200).send(parent);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};

export const deleteParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parent = await deleteParentById(req.params.id);
    if (!parent) {
      res.status(404).send({ message: 'Parent not found' });
      return;
    }
    res.status(200).send({ message: 'Parent deleted successfully' });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
};