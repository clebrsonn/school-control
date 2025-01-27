// filepath: /e:/IdeaProjects/school-control/backend/src/controllers/ClassesController.ts
import { Request, Response } from 'express';
import { createClass, getClasses } from '../services/ClassService';

export const addClass = async (req: Request, res: Response) => {
  try {
    const classInstance = await createClass(req.body);
    res.status(201).send(classInstance);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const fetchClasses = async (req: Request, res: Response) => {
  try {
    const classes = await getClasses();
    res.status(200).send(classes);
  } catch (error) {
    res.status(400).send(error);
  }
};