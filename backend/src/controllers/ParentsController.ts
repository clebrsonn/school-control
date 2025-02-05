import {ParentService} from '../services/ParentService';
import {BaseController} from "./generics/BaseController";
import {IResponsible} from "@hyteck/shared";

const parentsService = new ParentService();
export class ParentsController extends BaseController<IResponsible>{
  constructor() {
    super(parentsService);
  }
}