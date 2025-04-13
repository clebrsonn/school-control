import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { IDiscount, DiscountType } from '@hyteck/shared';
import useFormValidation from '../../hooks/useFormValidation';
import { createDiscount, deleteDiscount, fetchDiscounts } from '../../features/enrollments/services/DiscountService.ts';
import ListRegistries from '../common/ListRegistries.tsx';
import notification from '../common/Notification';

const DiscountManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<IDiscount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    validateField: validateFieldHook,
    validateForm,
    setFieldValue,
    validationErrors,
    clearErrors,
    onSubmitted,
    isSubmitted,
  } = useFormValidation<Omit<IDiscount, '_id'>>({
    fieldNames: ['name', 'value', 'validUntil', 'type'],
    validationErrors: {
      name: '' as string,
      value: '' as string,
      validUntil: '' as string,
      type: '' as string,
    },
    onSubmitted: async () => {
      try {
        const newDiscount: Omit<IDiscount, '_id'> = {
          name: setFieldValue('name', ''),
          value: Number(setFieldValue('value', '')),
          validUntil: setFieldValue('validUntil', ''),
          type: setFieldValue('type', 'enroll') as DiscountType,
        };
        const createdDiscount = await createDiscount(newDiscount);
        setDiscounts([...discounts, createdDiscount]);
        notification('Desconto criado com sucesso!', 'success');
      } catch (err: any) {
        setError(err.message || 'Erro ao criar o desconto.');
      }
    }
  });

  const getDiscounts = async () => {
    try {
      const fetchedDiscounts = await fetchDiscounts();
      setDiscounts(fetchedDiscounts);
    } catch (err: any) {
      setError('Erro ao carregar os descontos.');
    }
  };

    useEffect(() => {
        getDiscounts();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitted();
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDiscount(id);
            setDiscounts(discounts.filter((discount) => discount._id !== id));
            notification('Desconto removido com sucesso!', 'success');
        } catch (err: any) {
            setError('Erro ao excluir o desconto.');
      }
    };

  return (
    <div>
        <h2>Gerenciamento de Descontos</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="discountName">
          <Form.Label>Nome do Desconto</Form.Label>
          <Form.Control
            type="text"
            placeholder="Exemplo: Desconto para alunos novos"
            value={setFieldValue('name', '')}
            onChange={(e) => setFieldValue('name', e.target.value)}
            onBlur={(e) => validateField('name', e.target.value, true)}
            isInvalid={!!validationErrors.name}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="discountValue">
          <Form.Label>Valor do Desconto</Form.Label>
          <Form.Control
            type="number"
            placeholder="Exemplo: 50"
            value={setFieldValue('value', '')}
            onChange={(e) => setFieldValue('value', e.target.value)}
            onBlur={(e) => validateField('value', e.target.value, true)}
            isInvalid={!!validationErrors.value}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.value}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="discountValidUntil">
          <Form.Label>Validade do Desconto</Form.Label>
          <Form.Control
            type="date"
            value={setFieldValue('validUntil', '')}
            onChange={(e) => setFieldValue('validUntil', e.target.value)}
            onBlur={(e) => validateField('validUntil', e.target.value, true)}
            isInvalid={!!validationErrors.validUntil}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.validUntil}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="discountType">
          <Form.Label>Tipo de Desconto</Form.Label>
          <Form.Control
            as="select"
            value={setFieldValue('type', 'enroll')}
            onChange={(e) => setFieldValue('type', e.target.value)}
            onBlur={(e) => validateField('type', e.target.value, true)}
            isInvalid={!!validationErrors.type}
          >
            <option value="enroll">Matrícula</option>
            <option value="tuition">Mensalidade</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            {validationErrors.type}
          </Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" className="mt-3" disabled={!isValid()}>
          Adicionar Desconto
        </Button>
      </Form>

        <h3 className="mt-4">Lista de Descontos</h3>
        <ListRegistries data={discounts} entityName={'discount'} onDelete={handleDelete}></ListRegistries>
    </div>
  );
};

export default DiscountManager;