// filepath: /e:/IdeaProjects/school-control/backend/src/services/DiscountService.ts
import {Discount, IDiscount} from "@hyteck/shared";
import {BaseService} from "./generics/BaseService";
import {ParentService} from "./ParentService";

export class DiscountService extends BaseService<IDiscount> {
    constructor() {
        super(Discount);
    }

    findByType = async (type: string) => {
        return Discount.findOne({type});
    };

    calculateDiscounts = async (parentId: string): Promise<number> => {
        const parentService = new ParentService();

        const parent = await parentService.findById(parentId);

        if (!parent) {
            throw new Error('Student or Parent not found');
        }

        const siblingDiscount = parent.students && parent.students.length > 1
            ? await this.findByType('tuition')
            : null;

        const enrollmentDiscount = parent.students && parent.students.length > 1
            ? await this.findByType('enroll')
            : null;

        return (siblingDiscount?.value ?? 0);
    }

}