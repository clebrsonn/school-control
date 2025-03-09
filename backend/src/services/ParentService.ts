// filepath: /e:/IdeaProjects/school-control/backend/src/services/responsavelService.ts
import {IResponsible, Responsible} from '@hyteck/shared';
import {BaseService} from "./generics/BaseService";

export class ParentService extends BaseService<IResponsible>{
  constructor() {
    super(Responsible);
    this.populateFields= ['students'];
    this.sortFields= {name: 1};
  }
}