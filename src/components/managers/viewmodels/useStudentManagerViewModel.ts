import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import notification from '../../common/Notification';
import { useCrudManager } from '../../../hooks/useCrudManager';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    updateStudent
} from '../../../features/students/services/StudentService';
import { getAllResponsibles } from '../../../features/parents/services/ParentService';
import { getAllClassRooms } from '../../../features/classes/services/ClassService';
import { extractFieldErrors } from '../../../utils/errorUtils';
import { StudentRequest, StudentResponse } from '../../../features/students/types/StudentTypes';
import { ResponsibleResponse } from '../../../features/parents/types/ResponsibleTypes';
import { ClassRoomResponse } from '../../../features/classes/types/ClassRoomTypes';

export function useStudentManagerViewModel(responsibleId?: string) {
    const { t } = useTranslation();
    const {
        pageData,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        update
    } = useCrudManager<StudentResponse, StudentRequest>({
        entityName: 'students',
        fetchPage: (page, size) => getAllStudents({ page, size, responsibleId }),
        createItem: createStudent,
        updateItem: updateStudent,
        deleteItem: deleteStudent
    });

    const [formData, setFormData] = useState<StudentRequest>({
        name: '',
        email: '',
        classId: '',
        responsibleId: responsibleId || '',
        enrollmentFee: undefined,
        monthlyFee: undefined
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formIsSubmitting, setFormIsSubmitting] = useState(false);
    const [responsibles, setResponsibles] = useState<ResponsibleResponse[]>([]);
    const [classes, setClasses] = useState<ClassRoomResponse[]>([]);

    useEffect(() => {
        getAllResponsibles({ page: 0, size: 100 }).then(res => setResponsibles(res.content));
        getAllClassRooms({ page: 0, size: 100 }).then(res => setClasses(res.content));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            classId: '',
            responsibleId: responsibleId || '',
            enrollmentFee: undefined,
            monthlyFee: undefined
        });
        setFieldErrors({});
    };

    const handleAddStudent = async () => {
        setFieldErrors({});
        setFormIsSubmitting(true);
        const clientErrors: Record<string, string> = {};
        if (!formData.name) clientErrors.name = t('studentManager.validations.nameRequired');
        if (!formData.responsibleId) clientErrors.responsibleId = t('studentManager.validations.responsibleRequired');
        if (!formData.classId) clientErrors.classId = t('studentManager.validations.classRequired');
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setFormIsSubmitting(false);
            return;
        }
        try {
            await create(formData);
            resetForm();
            notification(t('studentManager.notifications.addedSuccess'), 'success');
        } catch (err: unknown) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
        } finally {
            setFormIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification(t('studentManager.notifications.removedSuccess'), 'success');
        } catch (err: unknown) {
            notification(t('studentManager.notifications.removedError'), 'error');
        }
    };

    return {
        t,
        pageData,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        formData,
        setFormData,
        fieldErrors,
        setFieldErrors,
        formIsSubmitting,
        responsibles,
        classes,
        handleInputChange,
        handleAddStudent,
        handleDelete,
        resetForm,
    };
}

