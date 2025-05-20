import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import { getClassRoomById } from '../../features/classes/services/ClassService.ts';
import notification from '../common/Notification.tsx';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { FaCalendarAlt, FaChalkboardTeacher, FaClock } from 'react-icons/fa';
import { ClassRoomResponse } from '../../features/classes/types/ClassRoomTypes.ts';

const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [classItem, setClassItem] = useState<ClassRoomResponse>();

  useEffect(() => {
    const getClass = async () => {
        try{
            const classData = await getClassRoomById(id as string);
            setClassItem(classData);
        }catch (e) {
            notification(e.message || 'Failed to fetch class data.', 'error');
        }

    };
    getClass();
  }, [id]);

  if (!classItem) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaChalkboardTeacher className="me-2" />
          Detalhes da Turma
        </h1>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <h5 className="mb-4">Informações da Turma</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <FaChalkboardTeacher className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">Nome da Turma</div>
                      <div className="fw-bold">{classItem.name}</div>
                    </div>
                  </div>
                </Col>
                {/*<Col md={6} className="mb-3">*/}
                {/*  <div className="d-flex align-items-center">*/}
                {/*    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">*/}
                {/*      <FaMoneyBillWave className="text-success" />*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*      <div className="text-muted small">Mensalidade</div>*/}
                {/*      <div className="fw-bold">*/}
                {/*        {classItem.monthlyFee ? `R$ ${classItem.monthlyFee}` : 'Não definido'}*/}
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
                {/*      <div className="text-muted small">Taxa de Matrícula</div>*/}
                {/*      <div className="fw-bold">*/}
                {/*        {classItem.enrollmentFee ? `R$ ${classItem.enrollmentFee}` : 'Não definido'}*/}
                {/*      </div>*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*</Col>*/}
                <Col md={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                      <FaCalendarAlt className="text-info" />
                    </div>
                    <div>
                      <div className="text-muted small">Ano Letivo</div>
                      <div className="fw-bold">
                        {classItem.schoolYear || 'Não definido'}
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
                      <div className="text-muted small">Horário de Início</div>
                      <div className="fw-bold">
                        {classItem.startTime || 'Não definido'}
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
                      <div className="text-muted small">Horário de Término</div>
                      <div className="fw-bold">
                        {classItem.endTime || 'Não definido'}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClassDetails;
