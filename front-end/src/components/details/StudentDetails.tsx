import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { enrollStudent, fetchStudentById } from '@services/StudentService';
import { fetchClasses } from '@services/ClassService';
import { IClass, IEnrollment, IStudent } from '@hyteck/shared';
import { Button, Container, Form } from 'react-bootstrap';
import ErrorMessage from '@components/ErrorMessage';
import notification from '../Notification';
import { fetchEnrollmentByStudent } from '../../services/MonthlyFeeService.ts';

const StudentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<IStudent | null>(null);
    const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStudentData();
        fetchClassData();
    }, [id]);

    const fetchStudentData = async () => {
        try {
            // Fetch student and enrollment data
            const studentData = await fetchStudentById(id);
            const enrollmentData = await fetchEnrollmentByStudent(id);
            setStudent(studentData);
            setEnrollments(enrollmentData || []);
        } catch (err: any) {
            setError('Failed to fetch student data.');
            console.error(err);
        }
    };

    const fetchClassData = async () => {
        try {
            const classData = await fetchClasses();
            setClasses(classData);
        } catch (err: any) {
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
        } catch (err: any) {
            setError(err.message || 'Failed to enroll student.');
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
                        <option key={classOption._id} value={classOption._id}>
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
                    {student.responsible.name}
                </Link>
            </p>
            {error && <ErrorMessage message={error} />}

            {enrollments.length > 0 ? (
                <>
                    <h4>Current Enrollment</h4>
                    {enrollments.map((enroll) => (
                        <div key={enroll._id}>
                            <p>Current Class: {enroll.classId?.name}</p>
                            <p>Enrollment Date: {new Date(enroll.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                    <EnrollmentForm buttonLabel="Change Class" />
                </>
            ) : (
                <EnrollmentForm buttonLabel="Enroll" />
            )}
        </Container>
    );
};

export default StudentDetails;