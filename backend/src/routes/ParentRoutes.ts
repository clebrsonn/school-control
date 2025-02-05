import {ParentsController} from '../controllers/ParentsController';
import {createBaseRouter} from "./BaseRoutes";

const router = createBaseRouter(new ParentsController());

export default router;