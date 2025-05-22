import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Col, Row } from 'react-bootstrap';
import { getClassRoomById } from '../../features/classes/services/ClassService.ts';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { FaCalendarAlt, FaChalkboardTeacher, FaClock } from 'react-icons/fa';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts';

/**
 * ClassDetails component displays detailed information about a specific class.
 * It fetches class data based on the ID from the route parameters.
 *
 * @returns {React.FC} The ClassDetails component.
 */
const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [classItem, setClassItem] = useState<ClassRoomResponse | undefined>(undefined); // Initialize with undefined
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    /**
     * Fetches the class data from the server.
     */
    const getClass = async () => {
      if (!id) {
        setError(t('classDetails.notifications.noIdProvided'));
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const classData = await getClassRoomById(id);
        setClassItem(classData);
      } catch (e: any) {
        const errorMessage = e.message || t('classDetails.notifications.fetchFailed');
        notification(errorMessage, 'error');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    getClass();
  }, [id, t]); // Add t to dependency array

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    // Display a more user-friendly error message on the page if needed, or rely on notification
    return <p className="text-danger">{error}</p>; 
  }
  
  if (!classItem) {
    // This case might occur if loading is false, error is null, but no classItem (e.g., ID not found by API but no error thrown)
    return <p>{t('classDetails.notifications.classRoomNotFound')}</p>; 
  }


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaChalkboardTeacher className="me-2" />
          {t('classDetails.title')}
        </h1>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <h5 className="mb-4">{t('classDetails.infoTitle')}</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <FaChalkboardTeacher className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">{t('classDetails.labels.name')}</div>
                      <div className="fw-bold">{classItem.name}</div>
                    </div>
                  </div>
                </Col>
                {/* Start: Commented out Fee Sections - i18n keys added for potential future use */}
                {/*<Col md={6} className="mb-3">*/}
                {/*  <div className="d-flex align-items-center">*/}
                {/*    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">*/}
                {/*      <FaMoneyBillWave className="text-success" />*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*      <div className="text-muted small">{t('classDetails.labels.monthlyFee')}</div>*/}
                {/*      <div className="fw-bold">*/}
                {/*        {classItem.monthlyFee ? `R$ ${classItem.monthlyFee}` : t('classDetails.notDefined')}*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</Col>*/}
              </Row>

              <Row>
                {/*<Col md={6} className="mb-3">*/}
                {/*  <div className="d-flex align-items-center">*/}
                {/*    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">*/}
                {/*      <FaMoneyBillWave className="text-warning" />*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*      <div className="text-muted small">{t('classDetails.labels.enrollmentFee')}</div>*/}
                {/*      <div className="fw-bold">*/}
                {/*        {classItem.enrollmentFee ? `R$ ${classItem.enrollmentFee}` : t('classDetails.notDefined')}*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</Col>*/}
                {/* End: Commented out Fee Sections */}
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                      <FaCalendarAlt className="text-info" />
                    </div>
                    <div>
                      <div className="text-muted small">{t('classDetails.labels.schoolYear')}</div>
                      <div className="fw-bold">
                        {classItem.schoolYear || t('classDetails.notDefined')}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-secondary bg-opacity-10 p-3 me-3">
                      <FaClock className="text-secondary" />
                    </div>
                    <div>
                      <div className="text-muted small">{t('classDetails.labels.startTime')}</div>
                      <div className="fw-bold">
                        {classItem.startTime || t('classDetails.notDefined')}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                      <FaClock className="text-danger" />
                    </div>
                    <div>
                      <div className="text-muted small">{t('classDetails.labels.endTime')}</div>
                      <div className="fw-bold">
                        {classItem.endTime || t('classDetails.notDefined')}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Placeholder for displaying list of students in the class, if applicable */}
      {/* E.g., <StudentListForClass classId={id} /> */}
    </div>
  );
};

export default ClassDetails;
