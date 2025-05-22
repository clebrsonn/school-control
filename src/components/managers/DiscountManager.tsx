import React, { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useCrudManager } from '../../hooks/useCrudManager';
import { createDiscount, deleteDiscount, fetchDiscounts } from '../../features/enrollments/services/DiscountService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import { FaList, FaPercentage, FaSave } from 'react-icons/fa';
import ErrorMessage from '../common/ErrorMessage.tsx';
import FormField from '../common/FormField';
import { extractFieldErrors } from '../../utils/errorUtils';
import { DiscountRequest, DiscountResponse } from '../../features/billing/types/Discount.ts'; // Assuming DiscountRequest exists or is similar
import notification from '../common/Notification.tsx'; // Added missing import

/**
 * @interface DiscountFormData
 * Represents the structure of the discount form data.
 */
interface DiscountFormData {
    name: string;
    value: string; // Keep as string for form input, parse to number on submit
    validUntil: string;
    type: "MATRICULA" | "MENSALIDADE";
}

const initialFormData: DiscountFormData = {
    name: "",
    value: "",
    validUntil: "",
    type: "MATRICULA",
};

/**
 * DiscountManager component for managing discount records.
 * It allows creating, viewing, and deleting discounts applicable to enrollments or monthly fees.
 * @returns {React.FC} The DiscountManager component.
 */
const DiscountManager: React.FC = () => {
    const { t } = useTranslation();
    const {
        pageData: discountPage,
        isLoading: crudIsLoading, // Renamed to avoid conflict
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        refetch
    } = useCrudManager<DiscountResponse, DiscountRequest>({ // Assuming DiscountRequest for create operation
        entityName: 'discounts',
        fetchPage: (page, size) => fetchDiscounts(page, size),
        createItem: createDiscount,
        deleteItem: deleteDiscount
    });

    const [formData, setFormData] = useState<DiscountFormData>(initialFormData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formIsLoading, setFormIsLoading] = useState<boolean>(false); // Renamed to avoid conflict

    /**
     * Handles changes to form input fields and updates the form data state.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The event object from the input change.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
     * Handles the submission of the discount form.
     * It performs client-side validation, then attempts to create a new discount via the API.
     * Notifications are shown for success or failure.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setFormIsLoading(true);

        const clientErrors: Record<string, string> = {};
        if (!formData.name) clientErrors.name = t('discountManager.validations.nameRequired');
        const numericValue = parseFloat(formData.value);
        if (isNaN(numericValue) || numericValue <= 0) clientErrors.value = t('discountManager.validations.valuePositive');
        if (!formData.validUntil) clientErrors.validUntil = t('discountManager.validations.validUntilRequired');
        if (!formData.type) clientErrors.type = t('discountManager.validations.typeRequired'); // Should not happen with default

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setFormIsLoading(false);
            return;
        }

        try {
            // Ensure DiscountRequest type matches what createDiscount service expects
            const discountToCreate: DiscountRequest = { 
                name: formData.name, 
                value: numericValue, // Parsed value
                validUntil: new Date(formData.validUntil), 
                type: formData.type 
            };
            await create(discountToCreate);
            resetForm();
            notification(t('discountManager.notifications.createdSuccess'), "success");
            refetch();
        } catch (err: any) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
            // Consider a generic error notification if fields errors are not set
            // notification(t('discountManager.notifications.creationError'), 'error');
        } finally {
            setFormIsLoading(false);
        }
    };

    /**
     * Handles the deletion of a discount.
     * Shows a success or error notification upon completion.
     * @param {string} id - The ID of the discount to be deleted.
     */
    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification(t('discountManager.notifications.removedSuccess'), "success");
            refetch();
        } catch (err: any) {
            notification(t('discountManager.notifications.removedError'), "error");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaPercentage className="me-2" />
                    {t('discountManager.title')}
                </h1>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t('discountManager.addTitle')}</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="discountName"
                                    name="name"
                                    label={t('discountManager.labels.name')}
                                    type="text"
                                    placeholder={t('discountManager.placeholders.name')}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    error={fieldErrors.name || null}
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    id="discountValue"
                                    name="value"
                                    label={t('discountManager.labels.value')}
                                    type="number" // Keep type number for semantic input, parsing done from string state
                                    placeholder={t('discountManager.placeholders.value')}
                                    value={formData.value} // Bind to string state
                                    onChange={handleInputChange}
                                    error={fieldErrors.value || null}
                                    required
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormField
                                    id="discountValidUntil"
                                    name="validUntil"
                                    label={t('discountManager.labels.validUntil')}
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={handleInputChange}
                                    error={fieldErrors.validUntil || null}
                                    required
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="discountType">
                                    <Form.Label>{t('discountManager.labels.type')}</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="type" // Add name attribute for handleInputChange
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                        isInvalid={!!fieldErrors.type}
                                    >
                                        <option value="MATRICULA">{t('discountManager.types.enrollment')}</option>
                                        <option value="MENSALIDADE">{t('discountManager.types.monthly')}</option>
                                    </Form.Control>
                                    {fieldErrors.type && (
                                        <Form.Control.Feedback type="invalid">
                                            {fieldErrors.type}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex mt-3">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="d-flex align-items-center"
                                disabled={formIsLoading || crudIsLoading} // Consider both loading states
                            >
                                <FaSave className="me-2" />
                                {formIsLoading ? t('discountManager.buttons.saving') : t('discountManager.buttons.save')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="table-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaList className="me-2" />
                        {t('discountManager.listTitle')}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <ListRegistries 
                        page={discountPage || { content: [], number: 0, totalPages: 1, size: 10 }}
                        entityName={'discounts'}
                        onDelete={handleDelete}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                        // onEdit is not passed as edit functionality is not implemented for discounts
                    />
                </Card.Body>
            </Card>

        </div>
    );
};

export default DiscountManager;
