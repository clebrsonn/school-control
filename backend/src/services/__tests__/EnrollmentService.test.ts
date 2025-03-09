// EnrollmentService.test.ts
import {Enrollment} from '@hyteck/shared';
import {EnrollmentService} from "../EnrollmentService";
import {PaymentService} from "../PaymentService";
import {ClassService} from "../ClassService";

jest.mock('./PaymentService');
jest.mock('./ClassService');
jest.mock('@hyteck/shared');

describe('EnrollmentService', () => {
    let enrollmentService: EnrollmentService;
    let paymentService: jest.Mocked<PaymentService>;
    let classService: jest.Mocked<ClassService>;

    beforeEach(() => {
        paymentService = new PaymentService() as jest.Mocked<PaymentService>;
        classService = new ClassService() as jest.Mocked<ClassService>;
        enrollmentService = new EnrollmentService();
    });

    it('should create a new enrollment and generate payment recurrences', async () => {
        const enrollmentData = { student: 'studentId', classId: 'classId' };
        const savedEnrollment = { ...enrollmentData, _id: 'enrollmentId' };

        Enrollment.prototype.save = jest.fn().mockResolvedValue(savedEnrollment);
        paymentService.generatePaymentRecurrences = jest.fn();

        const result = await enrollmentService.create(enrollmentData);

        expect(result).toEqual(savedEnrollment);
        expect(paymentService.generatePaymentRecurrences).toHaveBeenCalledWith(savedEnrollment);
    });

    it('should delete existing enrollments and classes before creating a new one', async () => {
        const enrollmentData = { student: 'studentId', classId: 'classId' };
        const existingEnrollments = [{ _id: 'existingEnrollmentId', classId: 'existingClassId' }];

        enrollmentService.getEnrollmentsByStudentId = jest.fn().mockResolvedValue(existingEnrollments);
        enrollmentService.delete = jest.fn();
        classService.delete = jest.fn();

        await enrollmentService.create(enrollmentData);

        expect(enrollmentService.delete).toHaveBeenCalledWith('existingEnrollmentId');
        expect(classService.delete).toHaveBeenCalledWith('existingClassId');
    });
});