// filepath: /e:/IdeaProjects/school-control/backend/src/services/DiscountService.ts
import { Discount, IDiscount } from "@hyteck/shared";
import {BaseService} from "./generics/BaseService";

export class DiscountService extends BaseService<IDiscount>{
  constructor() {
    super(Discount);
  }

  findByType = async (type: string) => {
    return Discount.findOne({ type });
  };
}