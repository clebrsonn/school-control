// filepath: /e:/IdeaProjects/school-control/backend/src/services/responsavelService.ts
import { Responsible, IResponsible } from '@hyteck/shared';
import {BaseService} from "./generics/BaseService";

export class ParentService extends BaseService<IResponsible>{
  constructor() {
    super(Responsible);
  }
}