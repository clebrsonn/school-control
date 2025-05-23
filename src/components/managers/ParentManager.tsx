import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { FaList, FaSave, FaUsers } from 'react-icons/fa';
import ErrorMessage from '../common/ErrorMessage.tsx';
import ListRegistries from '../common/ListRegistries.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import FormField from '../common/FormField';
import { useParentManagerViewModel } from './viewmodels/useParentManagerViewModel';

/**
 * ParentManager component for managing parent/responsible records.
 * It allows for creating, viewing, and deleting parent information.
 * @returns {React.FC} The ParentManager component.
 */
const ParentManager: React.FC = () => {
    const vm = useParentManagerViewModel();

    if (vm.isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">
                    <FaUsers className="me-2" />
                    {vm.t('parentManager.title')}
                </h1>
            </div>

            {vm.error && <ErrorMessage message={vm.error} />}

            <Card className="form-card mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{vm.t('parentManager.addTitle')}</h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <FormField
                                    id="formParentName"
                                    name="name"
                                    label={vm.t('parentManager.labels.name')}
                                    type="text"
                                    placeholder={vm.t('parentManager.placeholders.name')}
                                    value={vm.formData.name || ''}
                                    onChange={vm.handleInputChange}
                                    error={vm.fieldErrors.name || null}
                                    required
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <FormField
                                    id="formParentPhone"
                                    name="phone"
                                    label={vm.t('parentManager.labels.phone')}
                                    type="text"
                                    placeholder={vm.t('parentManager.placeholders.phone')}
                                    value={vm.formData.phone || ''}
                                    onChange={vm.handleInputChange}
                                    error={vm.fieldErrors.phone || null}
                                    required
                                />
                            </Col>
                            <Col md={6} className="mt-3">
                                <FormField
                                    id="formParentEmail"
                                    name="email"
                                    label={vm.t('parentManager.labels.email')}
                                    type="email"
                                    placeholder={vm.t('parentManager.placeholders.email')}
                                    value={vm.formData.email || ''}
                                    onChange={vm.handleInputChange}
                                    error={vm.fieldErrors.email || null}
                                />
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                variant="primary"
                                onClick={vm.handleAddParent}
                                disabled={vm.formIsSubmitting}
                            >
                                <FaSave className="me-2" />
                                {vm.formIsSubmitting ? vm.t('parentManager.buttons.saving') : vm.t('parentManager.buttons.save')}
                            </Button>
                            <Button
                                variant="secondary"
                                className="ms-2"
                                onClick={vm.resetForm}
                                disabled={vm.formIsSubmitting}
                            >
                                {vm.t('actions.cancel')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header className="d-flex align-items-center">
                    <FaList className="me-2" />
                    <span>{vm.t('parentManager.listTitle')}</span>
                </Card.Header>
                <Card.Body>
                    <ListRegistries
                        page={vm.pageData}
                        entityName="parents" // This could be used by ListRegistries for specific i18n keys too
                        onDelete={vm.handleDelete}
                        onPageChange={(page) => vm.setCurrentPage(page - 1)}
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default ParentManager;
