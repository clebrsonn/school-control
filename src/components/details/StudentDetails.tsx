import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import {
    cancelEnrollment,
    enrollStudent,
    getStudentEnrollments,
    renewEnrollment
} from '../../features/enrollments/services/EnrollmentService.ts';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes';
import { EnrollmentResponse } from '../../features/enrollments/types/EnrollmentTypes';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { getStudentById } from '../../features/students/services/StudentService.ts';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';

// Lazy load dos ícones
const FaCalendarAlt = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaCalendarAlt })));
const FaChalkboardTeacher = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaChalkboardTeacher })));
const FaExchangeAlt = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaExchangeAlt })));
const FaRedo = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaRedo })));
const FaTimesCircle = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaTimesCircle })));
const FaUser = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaUser })));
const FaUserGraduate = React.lazy(() => import('react-icons/fa').then(m => ({ default: m.FaUserGraduate })));

/**
 * StudentDetails component displays detailed information about a specific student,
 * including personal data, enrollment status, and options to manage enrollments
 * (enroll, cancel, renew, change class).
 * It fetches data based on the student ID from the route parameters.
 * @returns {React.FC} The StudentDetails component.
 */
const StudentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const [student, setStudent] = useState<StudentResponse | null>(null);
    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentDate] = useState<Date>(new Date()); // Removed setCurrentDate as it wasn't used for update
    const [enrollmentFee, setEnrollmentFee] = useState<number | undefined>(undefined);
    const [monthlyFee, setMonthlyFee] = useState<number | undefined>(undefined);
    const [loadingStudent, setLoadingStudent] = useState<boolean>(true); // Specific loading state for student
    const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(true); // Specific loading state for enrollments
    const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);

    /**
     * Fetches student data using caching.
     * Displays notifications on error.
     */
    const fetchStudentData = useCallback(async () => {
        if (!id) {
            setError(t('studentDetails.errors.invalidId'));
            setLoadingStudent(false);
            return;
        }
        setLoadingStudent(true);
        try {
            let cached = sessionStorage.getItem(`student_${id}`);
            let data: StudentResponse;
            if (cached) {
                data = JSON.parse(cached);
            } else {
                data = await getStudentById(id);
                sessionStorage.setItem(`student_${id}`, JSON.stringify(data));
            }
            setStudent(data);
            setError(null);
        } catch (err: any) {
            const msg = err.message || t('studentDetails.notifications.fetchStudentError');
            notification(msg, 'error');
            setError(msg);
        } finally {
            setLoadingStudent(false);
        }
    }, [id, t]);

    /**
     * Fetches classroom data using caching.
     * Displays notifications on error.
     */
    const fetchClassData = useCallback(async () => {
        try {
            let cached = sessionStorage.getItem('classrooms');
            let data: ClassRoomResponse[];
            if (cached) {
                data = JSON.parse(cached);
            } else {
                const classData = await getAllClassRooms({ page: 0, size: 100 }); // Fetch all for dropdown
                data = classData.content;
                sessionStorage.setItem('classrooms', JSON.stringify(data));
            }
            setClasses(data);
        } catch (err: any) {
            const msg = err.message || t('studentDetails.notifications.fetchClassesError');
            notification(msg, 'error');
            // setError(msg); // Optionally set error for classroom fetching specifically
        }
    }, [t]);

    /**
     * Fetches student enrollments. This is polled for updates.
     * Displays notifications on error.
     */
    const fetchEnrollments = useCallback(async () => {
        if (!id) return;
        setLoadingEnrollments(true);
        try {
            const data = await getStudentEnrollments(id);
            setEnrollments(Array.isArray(data) ? data : []);
            setError(null); // Clear previous enrollment fetch errors
        } catch (err: any) {
            const msg = err.message || t('studentDetails.notifications.fetchEnrollmentsError');
            notification(msg, 'error');
            setError(msg); // Set error for enrollment fetching
        } finally {
            setLoadingEnrollments(false);
        }
    }, [id, t]);

    // Polling for enrollments every 10 seconds
    useEffect(() => {
        fetchEnrollments(); // Initial fetch
        if (polling) clearInterval(polling);
        const interval = setInterval(fetchEnrollments, 10000); // Poll every 10 seconds
        setPolling(interval);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [fetchEnrollments]); // Dependency on fetchEnrollments ensures it restarts if id changes

    // Initial data fetch for student and classes
    useEffect(() => {
        fetchStudentData();
        fetchClassData();
    }, [id, fetchStudentData, fetchClassData]); // id added to ensure re-fetch if param changes

    // Memoized class options for select dropdown
    const classOptions = useMemo(() => classes.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
    )), [classes]);
    
    /**
     * Formats a date string or Date object into a localized date string.
     * @param {string | Date | undefined} dateInput - The date to format.
     * @returns {string} The formatted date string or a 'not defined' message.
     */
    const formatDate = (dateInput: string | Date | undefined): string => {
        if (!dateInput) return t('studentDetails.noEndDate'); // More specific for end date, general for others
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) {
                return t('studentDetails.invalidDate'); // Assuming you add this key
            }
            return date.toLocaleDateString(i18n.language);
        } catch (e) {
            return t('studentDetails.invalidDate');
        }
    };


    // Loading state for primary student data
    if (loadingStudent) return <LoadingSpinner message={t('studentDetails.loading.studentData')} />;
    // Display error if student data fetch failed critically
    if (error && !student) return <ErrorMessage message={error} />; 
    // Should not happen if id is always present due to route, but good practice
    if (!student) return <p>{t('studentDetails.notifications.studentNotFound')}</p>; 

    /**
     * Handles student enrollment or class change.
     * Validates class selection and calls the appropriate service.
     */
    const handleEnroll = async () => {
        if (!id) return; // Should be caught earlier, but good for safety
        try {
            if (!selectedClassId) {
                notification(t('studentDetails.notifications.enrollmentSelectClassError'), 'error');
                return;
            }
            await enrollStudent({ // This service likely handles both new enrollments and class changes
                studentId: id,
                classRoomId: selectedClassId,
                enrollmentFee: enrollmentFee, // These are optional in the component state
                monthyFee: monthlyFee     // and might be optional in the request type too
            });
            notification(t('studentDetails.notifications.enrollmentSuccess'), 'success');
            fetchStudentData(); // Refresh student data (which might include enrollment info if backend denormalizes)
            fetchEnrollments(); // Explicitly refresh enrollments
            setSelectedClassId(''); // Reset class selection
            setEnrollmentFee(undefined); // Reset fees
            setMonthlyFee(undefined);
        } catch (err: any) {
            const msg = err.message || t('studentDetails.notifications.enrollmentError');
            notification(msg, 'error');
            // setError(msg); // Optionally set form-level error
        }
    };

    /**
     * Handles cancellation of an existing enrollment.
     * @param {string} enrollmentId - The ID of the enrollment to cancel.
     */
    const handleCancelEnrollment = async (enrollmentId: string) => {
        try {
            await cancelEnrollment(enrollmentId);
            notification(t('studentDetails.notifications.cancelSuccess'), 'success');
            fetchStudentData(); 
            fetchEnrollments();
        } catch (err: any) {
            const msg = err.message || t('studentDetails.notifications.cancelError');
            notification(msg, 'error');
        }
    };

    /**
     * Handles renewal of an ended enrollment.
     * @param {string} enrollmentId - The ID of the enrollment to renew.
     */
    const handleRenewEnrollment = async (enrollmentId: string) => {
        try {
            await renewEnrollment(enrollmentId);
            notification(t('studentDetails.notifications.renewSuccess'), 'success');
            fetchStudentData();
            fetchEnrollments();
        } catch (err: any) {
            const msg = err.message || t('studentDetails.notifications.renewError');
            notification(msg, 'error');
        }
    };

    /**
     * Reusable form component for enrolling or changing class.
     * @param {{ buttonLabel: string }} props - Props containing the button label.
     * @returns {React.ReactElement} The enrollment form.
     */
    const EnrollmentForm = ({ buttonLabelKey }: { buttonLabelKey: string }) => (
        <Form>
            <Form.Group controlId="formClassSelect">
                <Form.Label>{t('studentDetails.enrollmentForm.selectClassLabel')}</Form.Label>
                <Form.Control
                    as="select"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                >
                    <option value="">{t('studentDetails.enrollmentForm.selectClassPlaceholder')}</option>
                    {classOptions}
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="formEnrollmentFee" className="mt-3">
                <Form.Label>{t('studentDetails.enrollmentForm.enrollmentFeeLabel')}</Form.Label>
                <Form.Control
                    type="number"
                    placeholder={t('studentDetails.enrollmentForm.enrollmentFeePlaceholder')}
                    value={enrollmentFee || ''}
                    onChange={(e) => setEnrollmentFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
            </Form.Group>
            <Form.Group controlId="formMonthlyFee" className="mt-3">
                <Form.Label>{t('studentDetails.enrollmentForm.monthlyFeeLabel')}</Form.Label>
                <Form.Control
                    type="number"
                    placeholder={t('studentDetails.enrollmentForm.monthlyFeePlaceholder')}
                    value={monthlyFee || ''}
                    onChange={(e) => setMonthlyFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
            </Form.Group>
            <Button variant="primary" onClick={handleEnroll} className="mt-3">
                {t(buttonLabelKey)}
            </Button>
        </Form>
    );

    return (
        <Suspense fallback={<LoadingSpinner message={t('studentDetails.loading.icons')} />}>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">
                        <FaUserGraduate className="me-2" />
                        {t('studentDetails.title')}
                    </h1>
                </div>

                {error && !loadingStudent && <ErrorMessage message={error} />} {/* Show general error if not loading student */}

                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="dashboard-card border-0">
                            <Card.Body>
                                <h5 className="mb-4">{t('studentDetails.personalInfoTitle')}</h5>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                                <FaUserGraduate className="text-info" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{t('studentDetails.labels.name')}</div>
                                                <div className="fw-bold">{student.name}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                                <FaUser className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-muted small">{t('studentDetails.labels.responsible')}</div>
                                                <div className="fw-bold">
                                                    {student.responsibleId && student.responsibleName ? (
                                                        <Link to={`/parents/${student.responsibleId}`}
                                                              className="text-decoration-none">
                                                            {student.responsibleName}
                                                        </Link>
                                                    ) : t('studentDetails.notDefined')}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {loadingEnrollments ? (
                    <LoadingSpinner message={t('studentDetails.loading.enrollments')} />
                ) : enrollments.length > 0 ? (
                    <>
                        <Card className="dashboard-card border-0 mb-4">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaChalkboardTeacher className="me-2 text-success" />
                                    {t('studentDetails.currentEnrollmentTitle')}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {enrollments.map((enroll) => ( // Assuming only one active enrollment, or display all
                                    <div key={enroll.id} className="mb-4">
                                        <Row className="mb-4">
                                            <Col md={4} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                                        <FaChalkboardTeacher className="text-success" />
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">{t('studentDetails.labels.currentClass')}</div>
                                                        <div className="fw-bold">{enroll.classRoomName}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                                                        <FaCalendarAlt className="text-info" />
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">{t('studentDetails.labels.enrollmentDate')}</div>
                                                        <div
                                                            className="fw-bold">{formatDate(enroll.enrollmentDate)}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                                        <FaCalendarAlt className="text-warning" />
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small">{t('studentDetails.labels.endDate')}</div>
                                                        <div className="fw-bold">
                                                            {formatDate(enroll.endDate)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="d-flex gap-2">
                                            {/* Logic for Cancel/Renew based on endDate */}
                                            {enroll.endDate && new Date(enroll.endDate) <= currentDate ? ( // If enrollment has ended
                                                <OverlayTrigger
                                                    overlay={<Tooltip id={`tooltip-renew-${enroll.id}`}>{t('studentDetails.tooltips.renewEnrollment')}</Tooltip>}
                                                >
                                                    <Button
                                                        variant="success"
                                                        onClick={() => handleRenewEnrollment(enroll.id!)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <FaRedo className="me-2" />
                                                        {t('studentDetails.buttons.renewEnrollment')}
                                                    </Button>
                                                </OverlayTrigger>
                                            ) : ( // If enrollment is active or has no end date
                                                <OverlayTrigger
                                                    overlay={<Tooltip id={`tooltip-cancel-${enroll.id}`}>{t('studentDetails.tooltips.cancelEnrollment')}</Tooltip>}
                                                >
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => handleCancelEnrollment(enroll.id!)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <FaTimesCircle className="me-2" />
                                                        {t('studentDetails.buttons.cancelEnrollment')}
                                                    </Button>
                                                </OverlayTrigger>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>

                        <Card className="dashboard-card border-0">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaExchangeAlt className="me-2 text-primary" />
                                    {t('studentDetails.changeClassTitle')}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <EnrollmentForm buttonLabelKey="studentDetails.buttons.changeClass" />
                            </Card.Body>
                        </Card>
                    </>
                ) : ( // No active enrollments
                    <>
                        <Card className="dashboard-card border-0 mb-4">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaChalkboardTeacher className="me-2 text-info" />
                                    {t('studentDetails.noEnrollmentTitle')}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="alert alert-info mb-0">
                                    {t('studentDetails.noEnrollmentMessage')}
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="dashboard-card border-0">
                            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <FaChalkboardTeacher className="me-2 text-success" />
                                    {t('studentDetails.newEnrollmentTitle')}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <EnrollmentForm buttonLabelKey="studentDetails.buttons.enroll" />
                            </Card.Body>
                        </Card>
                    </>
                )}
            </div>
        </Suspense>
    );
};

export default StudentDetails;

