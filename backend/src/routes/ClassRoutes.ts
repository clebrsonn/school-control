import {ClassesController} from "../controllers/ClassesController";
import {createBaseRouter} from "./BaseRoutes";

const classesController = new ClassesController();
const router = createBaseRouter(classesController);

export default router;