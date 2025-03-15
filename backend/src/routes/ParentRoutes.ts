import {ParentsController} from '../controllers/ParentsController';
import {createBaseRouter} from "./BaseRoutes";

export const parentRoutes = createBaseRouter(new ParentsController());
