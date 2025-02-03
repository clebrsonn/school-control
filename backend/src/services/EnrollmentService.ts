import {Enrollment, IEnrollment} from "@hyteck/shared";

export const createEnrollment = async (data: Partial<IEnrollment>) => {
    const enrollment = new Enrollment(data);
    return await enrollment.save();
};

export const getAllEnrollments = async () => {
    return await Enrollment.find().populate("student").populate("classId");
};

export const getEnrollmentById = async (id: string) => {
    return await Enrollment.findById(id).populate("student").populate("classId");
};

export const updateEnrollmentById = async (id: string, data: Partial<IEnrollment>) => {
    return await Enrollment.findByIdAndUpdate(id, data, { new: true })
        .populate("student")
        .populate("classId");
};

export const deleteEnrollmentById = async (id: string) => {
    return await Enrollment.findByIdAndDelete(id);
};

export const getEnrollmentsByStudentId = async (studentId: string) => {
    return Enrollment.find({ student: studentId }).populate("student").populate("classId");
};
