import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrudManager } from '../../hooks/useCrudManager';
import { createClassRoom, deleteClassRoom, getAllClassRooms } from '../../features/classes/services/ClassService';
import { ClassRoomRequest, ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import notification from '../common/Notification.tsx';
import ListRegistries from '../common/ListRegistries.tsx';
import { FaChalkboardTeacher, FaList, FaSave } from 'react-icons/fa';
import ErrorMessage from '../common/ErrorMessage.tsx';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';

/**
 * Interface for the class form data.
 * @interface ClassFormData
 */
interface ClassFormData {
    name: string;
    startTime: string;
    endTime: string;
    enrollmentFee: string; // Keep as string for form input, parse on submit
    monthlyFee: string;    // Keep as string for form input, parse on submit
}

const initialFormData: ClassFormData = {
    name: '',
    startTime: '',
    endTime: '',
    enrollmentFee: '',
    monthlyFee: '',
};

/**
 * ClassManager component for managing class records.
 * It allows for creating, reading, and deleting class information.
 * @returns {React.FC} The ClassManager component.
 */
const ClassManager: React.FC = () => {
    const { t } = useTranslation();
    const {
        pageData: classPage,
        isLoading: crudLoading, // Renamed to avoid conflict with form loading state
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        refetch
    } = useCrudManager<ClassRoomResponse, ClassRoomRequest>({
        entityName: 'classes',
        fetchPage: (page, size) => getAllClassRooms({ page, size }),
        createItem: createClassRoom,
        deleteItem: deleteClassRoom
        // Note: updateItem is not provided, so edit functionality is not available through useCrudManager
    });

    const [formData, setFormData] = useState<ClassFormData>(initialFormData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formLoading, setFormLoading] = useState<boolean>(false); // Renamed to avoid conflict

    /**
     * Handles input changes for form fields and updates the formData state.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The input change event.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    /**
     * Resets the form to its initial empty state and clears any field errors.
     */
    const resetForm = () => {
        setFormData(initialFormData);
        setFieldErrors({});
    };

    /**
     * Handles the submission of the add class form.
     * Performs client-side validation and then calls the create service.
     * Shows notifications for success or error.
     */
    const handleAddClass = async () => {
        setFieldErrors({}); // Clear previous errors
        setFormLoading(true);

        // Client-side validation
        const clientErrors: Record<string, string> = {};
        if (!formData.name) clientErrors.name = t('classManager.validations.nameRequired');
        // Add more client-side validations if needed (e.g., for time format, fee values)

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setFormLoading(false);
            return;
        }

        try {
            // Prepare request data, parsing fees to numbers
            const newClassRequest: ClassRoomRequest = {
                name: formData.name,
                schoolYear: new Date().getFullYear().toString(), // Or make this part of the form
                startTime: formData.startTime,
                endTime: formData.endTime,
                // Assuming enrollmentFee and monthlyFee should be numbers in the request
                // and that the ClassRoomRequest type might need updating if these are new fields.
                // For now, let's add them if they are part of an extended ClassRoomRequest type.
                // If not, they should be removed from here or the type updated.
                // Let's assume they are part of the type for now.
                enrollmentFee: parseFloat(formData.enrollmentFee) || 0,
                monthlyFee: parseFloat(formData.monthlyFee) || 0,
            };
            await create(newClassRequest);

            resetForm(); // Reset form fields
            notification(t('classManager.notifications.addedSuccess'), 'success');
            refetch(); // Refresh the list of classes
        } catch (err: any) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
            // Optionally, a generic error notification if not field-specific
            // notification(t('classManager.notifications.generalError'), 'error');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * Handles the deletion of a class.
     * Shows a success or error notification.
     * @param {string} id - The ID of the class to delete.
     */
    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification(t('classManager.notifications.removedSuccess'), 'success');
            refetch(); // Refresh the list
        } catch {
            notification(t('classManager.notifications.removedError'), 'error');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaChalkboardTeacher className="me-2" />
                    {t('classManager.title')}
                </h1>
            </div>

            {error && <ErrorMessage message={error} />} {/* Error from useCrudManager */}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t('classManager.addTitle')}</h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <FormField
                                    id="formClassName"
                                    name="name" // Ensure name attribute matches formData key
                                    label={t('classManager.labels.name')}
                                    type="text"
                                    placeholder={t('classManager.placeholders.name')}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formClassStartTime"
                                    name="startTime"
                                    label={t('classManager.labels.startTime')}
                                    type="text" // Consider using type="time" for better UX
                                    placeholder={t('classManager.placeholders.startTime')}
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    error={fieldErrors.startTime || null}
                                />
                            </Col>

                            <Col md={6}>
                                <FormField
                                    id="formClassEndTime"
                                    name="endTime"
                                    label={t('classManager.labels.endTime')}
                                    type="text" // Consider using type="time"
                                    placeholder={t('classManager.placeholders.endTime')}
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    error={fieldErrors.endTime || null}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formClassEnrollmentFee"
                                    name="enrollmentFee"
                                    label={t('classManager.labels.enrollmentFee')}
                                    type="number" // Use type="number" for numeric input
                                    placeholder={t('classManager.placeholders.enrollmentFee')}
                                    value={formData.enrollmentFee}
                                    onChange={handleInputChange} // handleInputChange can manage string, parsing done on submit
                                    error={fieldErrors.enrollmentFee || null}
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="formClassMonthlyFee"
                                    name="monthlyFee"
                                    label={t('classManager.labels.monthlyFee')}
                                    type="number" // Use type="number"
                                    placeholder={t('classManager.placeholders.monthlyFee')}
                                    value={formData.monthlyFee}
                                    onChange={handleInputChange}
                                    error={fieldErrors.monthlyFee || null} // Assuming API might return 'monthlyFee'
                                />
                            </Col>
                        </Row>
                        <div className="d-flex mt-3">
                            <Button 
                                variant="primary" 
                                onClick={handleAddClass} 
                                className="d-flex align-items-center"
                                disabled={formLoading || crudLoading} // Disable if form is submitting or CRUD manager is loading
                            >
                                <FaSave className="me-2" />
                                {formLoading ? t('classManager.buttons.saving') : t('classManager.buttons.add')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        {t('classManager.listTitle')}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries 
                        page={classPage || { content: [], number: 0, totalPages: 1, size: 10 }} // Fallback for initial load
                        entityName={'classes'}
                        onDelete={handleDelete}
                        // onEdit is not passed as edit functionality is not implemented for classes in this component
                        onPageChange={(page) => setCurrentPage(page - 1)} // Assuming API is 0-indexed
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ClassManager;
