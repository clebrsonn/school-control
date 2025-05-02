import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { enrollStudent, getStudentEnrollments } from '../../features/enrollments/services/EnrollmentService.ts';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes';
import { EnrollmentResponse } from '../../features/enrollments/types/EnrollmentTypes';
import notification from '../common/Notification.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import { StudentResponse } from '../../features/students/types/StudentTypes.ts';
import { getStudentById } from '../../features/students/services/StudentService';
import { getAllClassRooms } from '../../features/classes/services/ClassService.ts';

const StudentDetails: React.FC = () => {
        const { id } = useParams<{ id: string }>();
        const [student, setStudent] = useState<StudentResponse | null>(null);
        const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
        const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
        const [selectedClassId, setSelectedClassId] = useState<string>('');
        const [error, setError] = useState<string | null>(null);
        const [currentDate, setCurrentDate] = useState<Date>(new Date());
        const [enrollmentFee, setEnrollmentFee] = useState<number | undefined>(undefined);
        const [monthlyFee, setMonthlyFee] = useState<number | undefined>(undefined);

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
                const studentData = await getStudentById(id);
                setStudent(studentData);

                try {
                    const enrollmentData = await getStudentEnrollments(id);
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
                const classData = await getAllClassRooms({ page: 0, size: 100 });
                setClasses(classData.content);
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
                await enrollStudent({
                    studentId: id,
                    classRoomId: selectedClassId,
                    enrollmentFee,
                    monthyFee: monthlyFee
                });
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
                            <option key={classOption.id as string} value={classOption.id as string}>
                                {classOption.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="formEnrollmentFee" className="mt-3">
                    <Form.Label>Enrollment Fee</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter enrollment fee"
                        value={enrollmentFee || ''}
                        onChange={(e) => setEnrollmentFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                </Form.Group>
                <Form.Group controlId="formMonthlyFee" className="mt-3">
                    <Form.Label>Monthly Fee</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter monthly fee"
                        value={monthlyFee || ''}
                        onChange={(e) => setMonthlyFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
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
                    <Link to={`/parents/${student.responsibleId}`}>
                        {student.responsibleName}
                    </Link>
                </p>
                {error && <ErrorMessage message={error} />}

                {enrollments.length > 0 ? (
                    <>
                        <h4>Current Enrollment</h4>
                        {enrollments.map((enroll) => (
                            <div key={enroll.id} className="mb-4 p-3 border rounded">
                                <p>Current Class: {enroll.classRoomName}</p>
                                <p>Enrollment Date: {new Date(enroll.enrollmentDate).toLocaleDateString()}</p>
                                <p>End
                                    Date: {enroll.endDate ? new Date(enroll.endDate).toLocaleDateString() : 'No end date'}</p>
                                <div className="d-flex gap-2">
                                    {enroll.endDate && new Date(enroll.endDate) <= currentDate && (
                                        <>
                                            <Button variant="danger"
                                                    onClick={() => handleCancelEnrollment(enroll.id!! as string)}>
                                                Cancel Enrollment
                                            </Button>
                                            <Button variant="success"
                                                    onClick={() => handleRenewEnrollment(enroll.id!! as string)}>
                                                Renew Enrollment
                                            </Button>
                                        </>
                                    )}
                                    {(!enroll.endDate || new Date(enroll.endDate) > currentDate) && (
                                        <Button variant="danger"
                                                onClick={() => handleCancelEnrollment(enroll.id!! as string)}>
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
    }
;

export default StudentDetails;
