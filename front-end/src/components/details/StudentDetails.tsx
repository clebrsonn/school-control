import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {cancelEnrollment, enrollStudent, fetchStudentById, renewEnrollment} from '@services/StudentService';
import {fetchClasses} from '@services/ClassService';
import {IClass, IEnrollment, IResponsible, IStudent} from '@hyteck/shared';
import {Alert, Button, Container, Form} from 'react-bootstrap';
import ErrorMessage from '@components/ErrorMessage';
import notification from '@components/Notification';
import {fetchEnrollmentByStudent} from '@services/MonthlyFeeService';

const StudentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<IStudent | null>(null);
    const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    useEffect(() => {
        fetchStudentData();
        fetchClassData();
    }, [id]);

    if (!id) {
        setError('Invalid student ID.');
        return;
    }

    const fetchStudentData = async () => {
        try {
            // Fetch student and enrollment data
            const studentData = await fetchStudentById(id);
            setStudent(studentData);
            
            try {
                const enrollmentData = await fetchEnrollmentByStudent(id);
                setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : []);
            } catch (enrollmentErr) {
                // If there's an error fetching enrollment, it means the student doesn't have one
                setEnrollments([]);
            }
        } catch (err: unknown) {
            setError('Failed to fetch student data.');
            console.error(err);
        }
    };

    const fetchClassData = async () => {
        try {
            const classData = await fetchClasses();
            setClasses(classData);
        } catch (err: unknown) {
            setError('Failed to fetch class data.');
            console.error(err);
        }
    };

    const handleEnroll = async () => {
        try {
            if (!selectedClassId) {
                setError('Please select a class.');
                return;
            }
            await enrollStudent(id, selectedClassId);
            setError(null);
            notification('Student successfully enrolled or updated!');
            fetchStudentData(); // Refresh data after enrollment
        } catch (err: unknown) {
            setError(err.message || 'Failed to enroll student.');
        }
    };

    const handleCancelEnrollment = async (enrollmentId: string) => {
        try {
            await cancelEnrollment(enrollmentId);
            setError(null);
            notification('Enrollment successfully canceled!');
            fetchStudentData(); // Refresh data after cancellation
        } catch (err: unknown) {
            setError(err.message || 'Failed to cancel enrollment.');
        }
    };

    const handleRenewEnrollment = async (enrollmentId: string) => {
        try {
            await renewEnrollment(enrollmentId);
            setError(null);
            notification('Enrollment successfully renewed!');
            fetchStudentData(); // Refresh data after renewal
        } catch (err: unknown) {
            setError(err.message || 'Failed to renew enrollment.');
        }
    };

    if (!student) {
        return <div>Loading...</div>;
    }

    const EnrollmentForm = ({ buttonLabel }: { buttonLabel: string }) => (
        <Form>
            <Form.Group controlId="formClassSelect">
                <Form.Label>Select a Class</Form.Label>
                <Form.Control
                    as="select"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                >
                    <option value="">Select a class</option>
                    {classes.map((classOption) => (
                        <option key={classOption._id as string} value={classOption._id as string}>
                            {classOption.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Button variant="primary" onClick={handleEnroll} className="mt-3">
                {buttonLabel}
            </Button>
        </Form>
    );

    return (
        <Container>
            <h2>Student Details</h2>
            <p>Name: {student.name}</p>
            <p>
                Parent:{' '}
                <Link to={`/parents/${student.responsible._id}`}>
                    {(student.responsible as IResponsible).name}
                </Link>
            </p>
            {error && <ErrorMessage message={error} />}

            {enrollments.length > 0 ? (
                <>
                    <h4>Current Enrollment</h4>
                    {enrollments.map((enroll) => (
                        <div key={enroll._id} className="mb-4 p-3 border rounded">
                            <p>Current Class: {enroll.classId?.name}</p>
                            <p>Enrollment Date: {new Date(enroll.createdAt).toLocaleDateString()}</p>
                            <p>End Date: {enroll.endDate ? new Date(enroll.endDate).toLocaleDateString() : 'No end date'}</p>
                            <div className="d-flex gap-2">
                                {enroll.endDate && new Date(enroll.endDate) <= currentDate && (
                                    <>
                                        <Button variant="danger" onClick={() => handleCancelEnrollment(enroll._id!! as string)}>
                                            Cancel Enrollment
                                        </Button>
                                        <Button variant="success" onClick={() => handleRenewEnrollment(enroll._id!! as string)}>
                                            Renew Enrollment
                                        </Button>
                                    </>
                                )}
                                {(!enroll.endDate || new Date(enroll.endDate) > currentDate) && (
                                    <Button variant="danger" onClick={() => handleCancelEnrollment(enroll._id!! as string)}>
                                        Cancel Enrollment
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    <EnrollmentForm buttonLabel="Change Class" />
                </>
            ) : (
                <>
                    <Alert variant="info" className="mb-4">
                        This student is not currently enrolled in any class.
                    </Alert>
                    <EnrollmentForm buttonLabel="Enroll" />
                </>
            )}
        </Container>
    );
};

export default StudentDetails;