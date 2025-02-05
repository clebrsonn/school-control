import {DiscountService} from '../services/DiscountService';
import {BaseController} from "./generics/BaseController";
import {IDiscount} from "@hyteck/shared";

const discountService = new DiscountService();
export class DiscountsController extends BaseController<IDiscount>{
  constructor(){
    super(discountService)
  }
}