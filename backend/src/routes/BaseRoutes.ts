import {Router} from 'express';
import {BaseController} from "../controllers/generics/BaseController";
import {Document} from "mongoose";

export function createBaseRouter<T extends Document>(controller: BaseController<T>): Router {
    const router = Router();

    if (controller.create) router.post("/", controller.create);
    if (controller.findAll) router.get("/", controller.findAll);
    if (controller.findById) router.get("/:id", controller.findById);
    if (controller.update) router.put("/:id", controller.update);
    if (controller.delete) router.delete("/:id", controller.delete);

    return router;
}