import { Request, Response } from "express";
import { Document } from "mongoose";
import {BaseService} from "../../services/generics/BaseService";

export class BaseController<T extends Document> {
    protected service: BaseService<T>;

    constructor(service: BaseService<T>) {
        this.service = service;
    }

    create = async (req: Request, res: Response) => {
        try {
            const entity = await this.service.create(req.body);
            res.status(201).json(entity);
        } catch (error) {
            res.status(400).json({ error: "Erro ao criar entidade.", details: error });
        }
    };

    findAll = async (_: Request, res: Response) => {
        try {
            const entities = await this.service.findAll();
            res.status(200).json(entities);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar entidades.", details: error });
        }
    };

    findById = async (req: Request, res: Response) => {
        try {
            const entity = await this.service.findById(req.params.id);
            if (!entity) {
                res.status(404).json({error: "Entidade não encontrada."});
                return;
            }
            res.status(200).send(entity);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar a entidade.", details: error });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const entity = await this.service.update(req.params.id, req.body);
            if (!entity) {
                res.status(404).json({error: "Entidade não encontrada."});
                return
            }
            res.status(200).json(entity);

        } catch (error) {
            res.status(400).json({ error: "Erro ao atualizar entidade.", details: error });

        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const success = await this.service.delete(req.params.id);
            if (!success) {
                res.status(404).json({error: "Entidade não encontrada."});
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Erro ao remover entidade.", details: error });
        }
    };
}