import { ClassModel, IClass } from '@hyteck/shared';
import {BaseService} from "./generics/BaseService";


export class ClassService extends BaseService<IClass>{
  constructor() {
    super(ClassModel);
  }

}