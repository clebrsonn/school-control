import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import notification from '../common/Notification.tsx';
import { useCrudManager } from '../../hooks/useCrudManager';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    updateStudent
} from '../../features/students/services/StudentService.ts';
import { getAllResponsibles, getStudentsByResponsibleId } from '../../features/parents/services/ParentService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts';
import { ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { StudentRequest, StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { FaList, FaSave, FaUndo, FaUserGraduate } from 'react-icons/fa';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';

/**
 * Props for the StudentManager component.
 * @interface StudentManagerProps
 */
interface StudentManagerProps {
    /**
     * The ID of the responsible parent/guardian, if provided.
     * This will filter the students list to show only students associated with this responsible.
     * It also pre-selects the responsible in the student form and disables the field.
     * @type {string | undefined}
     */
    responsible: string | undefined;
}

/**
 * Interface for the student form data.
 * @interface StudentFormData
 */
interface StudentFormData {
    name: string;
    email: string;
    classId: string;
    selectedResponsible: string;
    enrollmentFee?: number;
    monthlyFee?: number;
}

const initialFormData = (responsibleId?: string): StudentFormData => ({
    name: '',
    email: '',
    classId: '',
    selectedResponsible: responsibleId || '',
    enrollmentFee: undefined,
    monthlyFee: undefined,
});

/**
 * StudentManager component for managing student records.
 * It allows for creating, reading, updating, and deleting student information.
 * It can be used in a general context or filtered by a specific responsible person.
 *
 * @param {StudentManagerProps} props - The component props.
 * @returns {React.FC<StudentManagerProps>} The StudentManager component.
 */
const StudentManager: React.FC<StudentManagerProps> = ({ responsible }) => {
    const { t } = useTranslation();
    const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
    const [parents, setParents] = useState<ResponsibleResponse[]>([]);
    const [formData, setFormData] = useState<StudentFormData>(initialFormData(responsible));
    // const [selectedResponsibleName, setSelectedResponsibleName] = useState(''); // This might be removable if name is part of parents list
    const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const {
        pageData: studentPage,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        create,
        update,
        remove,
        refetch
    } = useCrudManager<StudentResponse, StudentRequest>({
        entityName: 'students',
        fetchPage: (page, size) => responsible
            ? getStudentsByResponsibleId(responsible, { page, size }) // Fetch students for a specific responsible
            : getAllStudents({ page, size, sort: 'name,responsible' }), // Fetch all students
        createItem: createStudent,
        updateItem: updateStudent,
        deleteItem: deleteStudent
    });

    // Effect to fetch classes and parents (if no specific responsible is provided)
    useEffect(() => {
        const getClasses = async () => {
            try {
                const classData = await getAllClassRooms();
                setClasses(classData.content as ClassRoomResponse[]);
            } catch (err) {
                // console.error("Failed to fetch classes:", err);
                // Optionally, show a notification to the user
            }
        };
        const getParents = async () => {
            try {
                const parentData = await getAllResponsibles({ page: 0, size: 100, sort: 'name' }); // Fetch a large list for dropdown
                setParents(parentData.content);
            } catch (err) {
                // console.error("Failed to fetch parents:", err);
            }
        };
        getClasses();
        if (!responsible) { // Only fetch all parents if not filtered by a specific responsible
            getParents();
        }
    }, [responsible]);

    // This effect was for selectedResponsibleName, which might be removed or refactored
    // useEffect(() => {
    //     if (formData.selectedResponsible) {
    //         const parent = parents.find(p => p.id === formData.selectedResponsible);
    //         if (parent) {
    //             // setSelectedResponsibleName(parent.name); // This state might not be needed
    //         }
    //     }
    // }, [formData.selectedResponsible, parents]);

    /**
     * Resets the form fields to their initial state.
     * If a responsible ID was provided as a prop, it preserves that selection.
     * Clears any existing editing student data.
     */
    const resetForm = () => {
        setFormData(initialFormData(responsible));
        setEditingStudent(null);
        setFieldErrors({}); // Clear any previous field errors
    };

    /**
     * Handles the submission of the student form, either creating a new student or updating an existing one.
     * Performs client-side validation before sending the request.
     * Shows notifications for success or error.
     */
    const handleAddOrUpdateStudent = async () => {
        setFieldErrors({}); // Clear previous errors
        setLoading(true);

        // Client-side validation
        const clientErrors: Record<string, string> = {};
        if (!formData.name) clientErrors.name = t('studentManager.validations.nameRequired');
        if (!responsible && !formData.selectedResponsible) clientErrors.responsibleId = t('studentManager.validations.responsibleRequired');
        if (!formData.classId) clientErrors.classId = t('studentManager.validations.classRequired');

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setLoading(false);
            return;
        }

        try {
            const studentData: StudentRequest = {
                name: formData.name,
                email: formData.email,
                responsibleId: (responsible || formData.selectedResponsible) as string,
                classroom: formData.classId,
                enrollmentFee: formData.enrollmentFee || 0,
                monthyFee: formData.monthlyFee || 0,
            };

            if (editingStudent) {
                await update(editingStudent.id, studentData);
                notification(t('studentManager.notifications.updatedSuccess'), 'success');
            } else {
                await create(studentData);
                notification(t('studentManager.notifications.addedSuccess'), 'success');
            }

            resetForm(); // Reset form after successful operation
            refetch();   // Refetch the student list
        } catch (err: any) {
            // Extract and set field-specific errors from the backend response
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
            // notification(t('studentManager.notifications.generalError'), 'error'); // Generic error if not field specific
        } finally {
            setLoading(false);
        }
    };

    /**
     * Populates the form with the data of the student selected for editing.
     * @param {StudentResponse} student - The student object to edit.
     */
    const handleEdit = (student: StudentResponse) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            email: student.email || '',
            classId: student.classroom || '',
            selectedResponsible: student.responsibleId || '',
            enrollmentFee: student.enrollmentFee || undefined,
            monthlyFee: student.monthyFee || undefined,
        });
        // setSelectedResponsibleName(student.responsibleName || ''); // This state might not be needed
    };

    /**
     * Handles the deletion of a student.
     * Shows a success or error notification.
     * @param {string} id - The ID of the student to delete.
     */
    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification(t('studentManager.notifications.removedSuccess'), 'success');
            refetch(); // Refetch the list after deletion
        } catch {
            notification(t('studentManager.notifications.removedError'), 'error');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    };


    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaUserGraduate className="me-2" />
                    {t('studentManager.title')}
                </h1>
            </div>

            {error && <ErrorMessage message={error} />} {/* Error from useCrudManager */}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        {editingStudent ? t('studentManager.editTitle') : t('studentManager.addTitle')}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formStudentName"
                                    label={t('studentManager.labels.studentName')}
                                    type="text"
                                    name="name"
                                    placeholder={t('studentManager.placeholders.studentName')}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="formStudentEmail"
                                    label={t('studentManager.labels.email')}
                                    type="email"
                                    name="email"
                                    placeholder={t('studentManager.placeholders.email')}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={fieldErrors.email || null}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formEnrollmentFee">
                                    <Form.Label>{t('studentManager.labels.enrollmentFee')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="enrollmentFee"
                                        placeholder={t('studentManager.placeholders.enrollmentFee')}
                                        value={formData.enrollmentFee || ''}
                                        onChange={handleNumericInputChange}
                                        isInvalid={!!fieldErrors.enrollmentFee}
                                    />
                                    {fieldErrors.enrollmentFee && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.enrollmentFee}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formMonthlyFee">
                                    <Form.Label>{t('studentManager.labels.monthlyFee')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="monthlyFee"
                                        placeholder={t('studentManager.placeholders.monthlyFee')}
                                        value={formData.monthlyFee || ''}
                                        onChange={handleNumericInputChange}
                                        isInvalid={!!fieldErrors.monthyFee} // Note: API might use 'monthyFee', ensure consistency
                                        min={0}
                                    />
                                    {fieldErrors.monthyFee && ( // Note: API might use 'monthyFee'
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.monthyFee}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formParent">
                                    <Form.Label>{t('studentManager.labels.responsible')}</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="selectedResponsible"
                                        value={formData.selectedResponsible}
                                        onChange={handleInputChange}
                                        isInvalid={!!fieldErrors.responsibleId}
                                        disabled={!!responsible} // Disable if a specific responsible is passed as prop
                                    >
                                        <option value="">{t('studentManager.placeholders.selectResponsible')}</option>
                                        {parents.map((parent) => (
                                            <option key={parent.id} value={parent.id}>
                                                {parent.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    {fieldErrors.responsibleId && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.responsibleId}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="formStudentClass">
                                    <Form.Label>{t('studentManager.labels.class')}</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleInputChange}
                                        isInvalid={!!fieldErrors.classId}
                                    >
                                        <option value="">{t('studentManager.placeholders.selectClass')}</option>
                                        {classes?.map((classItem) => (
                                            <option key={classItem.id as string} value={classItem.id as string}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    {fieldErrors.classId && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.classId}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex mt-3">
                            <Button
                                variant="primary"
                                onClick={handleAddOrUpdateStudent}
                                className="me-2 d-flex align-items-center"
                                disabled={loading || isLoading} // Consider also disabling if useCrudManager is loading
                            >
                                <FaSave className="me-2" />
                                {loading
                                    ? (editingStudent ? t('studentManager.buttons.updating') : t('studentManager.buttons.saving'))
                                    : (editingStudent ? t('studentManager.buttons.update') : t('studentManager.buttons.save'))
                                }
                            </Button>
                            {editingStudent && ( // Show cancel button only when editing
                                <Button
                                    variant="secondary"
                                    onClick={resetForm}
                                    className="d-flex align-items-center"
                                >
                                    <FaUndo className="me-2" />
                                    {t('studentManager.buttons.cancel')}
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        {t('studentManager.listTitle')}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries
                        page={studentPage || { content: [], number: 0, totalPages: 1, size: 10 }} // Fallback for initial load
                        entityName={'students'}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onPageChange={(page) => setCurrentPage(page - 1)} // Assuming API is 0-indexed
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default StudentManager;

