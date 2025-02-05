import {BaseController} from "./generics/BaseController";
import {IClass} from "@hyteck/shared";
import {ClassService} from "../services/ClassService";

const classService = new ClassService();

export class ClassesController extends BaseController<IClass>{
  constructor() {
    super(classService);
  }

}