import {createBaseRouter} from "./BaseRoutes";
import {DiscountsController} from "../controllers/DiscountsController";

const discountController = new DiscountsController();
const router = createBaseRouter(discountController);

export default router;