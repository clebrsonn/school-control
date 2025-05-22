import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    createResponsible,
    deleteResponsible,
    getAllResponsibles
} from '../../features/parents/services/ParentService.ts';
import ErrorMessage from '../common/ErrorMessage.tsx';
import notification from '../common/Notification.tsx';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import ListRegistries from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ResponsibleRequest, ResponsibleResponse } from '../../features/parents/types/ResponsibleTypes.ts';
import { useCrudManager } from '../../hooks/useCrudManager';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';
import { FaList, FaSave, FaUsers } from 'react-icons/fa';

// Renamed for consistency
const initialFormData: ResponsibleRequest = { name: '', phone: '', email: '' };

/**
 * ParentManager component for managing parent/responsible records.
 * It allows for creating, viewing, and deleting parent information.
 * @returns {React.FC} The ParentManager component.
 */
const ParentManager: React.FC = () => {
    const { t } = useTranslation();
    const {
        pageData,
        isLoading, // This is from useCrudManager, for page loading
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        refetch
    } = useCrudManager<ResponsibleResponse, ResponsibleRequest>({
        entityName: 'parents', // Used by ListRegistries for i18n keys if needed there
        fetchPage: (page, size) => getAllResponsibles({ page, size }),
        createItem: createResponsible,
        deleteItem: deleteResponsible
    });

    // Renamed formState to formData for consistency
    const [formData, setFormData] = useState<ResponsibleRequest>(initialFormData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formIsSubmitting, setFormIsSubmitting] = useState<boolean>(false); // Renamed for clarity

    if (isLoading) { // This isLoading is for the page data fetching
        return <LoadingSpinner />;
    }

    /**
     * Handles input changes for form fields and updates the formData state.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    /**
     * Resets the form to its initial empty state and clears any field errors.
     */
    const resetForm = () => {
        setFormData(initialFormData);
        setFieldErrors({});
    };

    /**
     * Handles the submission of the add parent/responsible form.
     * Performs client-side validation, then calls the create service.
     * Shows notifications for success or error.
     */
    const handleAddParent = async () => {
        setFieldErrors({});
        setFormIsSubmitting(true);

        // Client-side validation using i18n keys
        const clientErrors: Record<string, string> = {};
        if (!formData.name) clientErrors.name = t('parentManager.validations.nameRequired');
        if (!formData.phone) clientErrors.phone = t('parentManager.validations.phoneRequired');

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setFormIsSubmitting(false);
            return;
        }

        try {
            await create(formData);
            resetForm(); // Use the new resetForm function
            notification(t('parentManager.notifications.addedSuccess'), 'success');
            refetch();
        } catch (err: unknown) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
            // notification(t('parentManager.notifications.addError'), 'error'); // Optional generic error
        } finally {
            setFormIsSubmitting(false);
        }
    };

    /**
     * Handles the deletion of a parent/responsible.
     * Shows a success or error notification.
     * @param {string} id - The ID of the parent/responsible to delete.
     */
    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification(t('parentManager.notifications.removedSuccess'), 'success');
            refetch();
        } catch (err: unknown) {
            notification(t('parentManager.notifications.removedError'), 'error');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaUsers className="me-2" />
                    {t('parentManager.title')}
                </h1>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t('parentManager.addTitle')}</h5>
                </Card.Header>
                <Card.Body>
                    <Form> {/* Removed onSubmit from Form tag, using onClick on Button */}
                        <Row>
                            <Col md={12}>
                                <FormField
                                    id="formParentName"
                                    name="name" // Add name attribute for handleInputChange
                                    label={t('parentManager.labels.name')}
                                    type="text"
                                    placeholder={t('parentManager.placeholders.name')}
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="formParentEmail"
                                    name="email" // Add name attribute
                                    label={t('parentManager.labels.email')}
                                    type="email"
                                    placeholder={t('parentManager.placeholders.email')}
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    error={fieldErrors.email || null}
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="formParentPhone"
                                    name="phone" // Add name attribute
                                    label={t('parentManager.labels.phone')}
                                    type="text"
                                    placeholder={t('parentManager.placeholders.phone')}
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    error={fieldErrors.phone || null}
                                    required
                                />
                            </Col>
                        </Row>
                        <div className="d-flex mt-3">
                            <Button
                                variant="primary"
                                onClick={handleAddParent} // Using onClick for explicit handler call
                                className="d-flex align-items-center"
                                disabled={formIsSubmitting || isLoading} // Disable also if page is loading
                            >
                                <FaSave className="me-2" />
                                {formIsSubmitting ? t('parentManager.buttons.saving') : t('parentManager.buttons.save')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        {t('parentManager.listTitle')}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries
                        page={pageData || { content: [], number: 0, totalPages: 1, size: 10 }}
                        entityName="parents" // This could be used by ListRegistries for specific i18n keys too
                        onDelete={handleDelete}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                        // onEdit is not passed as ParentManager does not implement edit functionality
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ParentManager;
