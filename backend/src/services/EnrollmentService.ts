import {Enrollment, IEnrollment, IStudent, TuitionStatus} from "@hyteck/shared";
import {BaseService} from "./generics/BaseService";

import {PaymentService} from "./PaymentService";
import {RootFilterQuery} from "mongoose";


export class EnrollmentService extends BaseService<IEnrollment> {
    private _paymentService!: PaymentService;
    constructor() {
        super(Enrollment);
    }

    // Getter para obter a instância de PaymentService quando necessário
    private get paymentService(): PaymentService {
        if (!this._paymentService) {
            // Aqui carregamos a dependência de forma tardia
            const {PaymentService} = require("./PaymentService");
            this._paymentService = new PaymentService();
        }
        return this._paymentService;
    }

    override async deleteMany(params: RootFilterQuery<IEnrollment> | undefined): Promise<boolean> {

        const enrollments = await Enrollment.find(params as  RootFilterQuery<IEnrollment>);

        for (const enrollment of enrollments) {
            this.paymentService.deleteMany({enrollment: enrollment._id});
        }
        return super.deleteMany(params);
    }


    
    override async delete(id: string): Promise<boolean> {
        this.paymentService.deleteMany({enrollment: id});
        
        return super.delete(id);
    }


    create = async (data: Partial<IEnrollment>) => {

        await this.deleteMany({ student: data.student as unknown as string });

        const instance = new this.model(data);
        return await instance.save();
    };


    getEnrollmentsByStudentId = async (studentId: string) => {
        return Enrollment.find({student: studentId}).populate("student").populate("classId");
    };

    renewEnrollment = async (enrollmentId: string) => {
        const enrollment = await this.findById(enrollmentId);
        if (!enrollment) {
            throw new Error("Enrollment not found");
        }
        const newEnrollment = new Enrollment({
            student: enrollment.student,
            classId: enrollment.classId,
            fee: enrollment.fee,
            //discount: enrollment.discount,
            active: true,
        });

        return this.create(newEnrollment);
    };


    cancelEnrollment = async (enrollmentId: string) => {
        this.populateFields = ["student"];
        const enrollment = await this.findById(enrollmentId);
        if (!enrollment) {
            throw new Error("Enrollment not found");
        }
        const opened= await this.paymentService.getLatePaymentsByResponsible((enrollment.student  as IStudent).responsible._id as string);
        if(opened.length > 0){
            throw new Error("There are pending payments");
        }
        await this.paymentService.deleteMany({
            enrollment: enrollment._id,
            status: TuitionStatus.PENDING,
            dueDate: {$gte: new Date()},
        });

        enrollment.active = false;
        enrollment.endDate = new Date();
        await enrollment.save();

        return enrollment;
    };

    findAcitveAndEndDateLessThanToday = async () => {
        return Enrollment.find({active: true, endDate: {$lt: new Date()}});
    }

}