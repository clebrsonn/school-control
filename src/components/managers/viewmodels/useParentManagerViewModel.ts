import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    createResponsible,
    deleteResponsible,
    getAllResponsibles
} from '../../../features/parents/services/ParentService';
import notification from '../../common/Notification';
import { ResponsibleRequest, ResponsibleResponse } from '../../../features/parents/types/ResponsibleTypes';
import { useCrudManager } from '../../../hooks/useCrudManager';
import { extractFieldErrors } from '../../../utils/errorUtils';
import { formatDateLocalized } from '../../../utils/dateUtils';

const initialFormData: ResponsibleRequest = { name: '', phone: '', email: '' };

export function useParentManagerViewModel() {
    const { t } = useTranslation();
    const {
        pageData,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        create,
        remove,
        refetch
    } = useCrudManager<ResponsibleResponse, ResponsibleRequest>({
        entityName: 'parents',
        fetchPage: (page, size) => getAllResponsibles({ page, size }),
        createItem: createResponsible,
        deleteItem: deleteResponsible
    });

    const [formData, setFormData] = useState<ResponsibleRequest>(initialFormData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formIsSubmitting, setFormIsSubmitting] = useState<boolean>(false);

    const formatDate = (dateString: string | Date): string => {
        return formatDateLocalized(dateString, t('language') || 'pt-BR');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setFieldErrors({});
    };

    const handleAddParent = async () => {
        setFieldErrors({});
        setFormIsSubmitting(true);
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
            resetForm();
            notification(t('parentManager.notifications.addedSuccess'), 'success');
            // NÃO chame refetch aqui, pois o React Query já faz o fetch automático após a mutação
        } catch (err: unknown) {
            const errors = extractFieldErrors(err);
            setFieldErrors(errors);
        } finally {
            setFormIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await remove(id);
            notification(t('parentManager.notifications.removedSuccess'), 'success');
            // NÃO chame refetch aqui, pois o React Query já faz o fetch automático após a mutação
        } catch (err: unknown) {
            notification(t('parentManager.notifications.removedError'), 'error');
        }
    };

    return {
        t,
        pageData,
        isLoading,
        error,
        currentPage,
        setCurrentPage,
        formData,
        setFormData,
        fieldErrors,
        setFieldErrors,
        formIsSubmitting,
        handleInputChange,
        handleAddParent,
        handleDelete,
        resetForm,
        formatDate,
        refetch,
    };
}

