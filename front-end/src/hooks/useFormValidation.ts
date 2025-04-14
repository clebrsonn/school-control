import { useCallback, useState } from 'react';
import { validateField } from '../utils/validation';

interface FieldValidation<T> {
    name: keyof T;
    value: any;
    isRequired?: boolean;
}

interface ValidationHookOptions<T extends Record<string, any>> {
    fields: FieldValidation<T>[];
    onSubmit?: () => void;
}

interface ValidationHookResult<T extends Record<string, any>> {
    validateField: (
        fieldName: keyof T,
        value: any,
        isRequired?: boolean
    ) => string;
    isValid: () => boolean;
    setFieldValue: (fieldName: keyof T, value: any) => void;
    validationErrors: Record<keyof T, string>;
    clearErrors: () => void;
    isSubmitted: boolean;
    onSubmit: () => void;
    getFieldByName: (fieldName: keyof T) => FieldValidation<T> | undefined;
    getFieldValue: (fieldName: keyof T) => any;
}

const useFormValidation = <T extends Record<string, any>>({
    fields,
    onSubmit,
}: ValidationHookOptions<T>): ValidationHookResult<T> => {
    const [currentFields, setFields] = useState<FieldValidation<T>[]>(fields);
    const initialErrors = fields?.reduce((acc, field) => {
        acc[field.name] = "";
        return acc;
    }, {} as Record<keyof T, string>);

    const [validationErrors, setValidationErrors] =
        useState<Record<keyof T, string>>(initialErrors);

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const validateFieldHook = useCallback(
        (fieldName: keyof T, value: any, isRequired?: boolean): string => {
            const errorMessage = validateField(
                value,
                String(fieldName),
                isRequired
            );
            setValidationErrors((prevErrors) => ({
                ...prevErrors,
                [fieldName]: errorMessage,
            }));
            return errorMessage;
        },
        []
    );

    const isValid = useCallback((): boolean => {
        let isValid = true;
        const newValidationErrors = { ...validationErrors };

        currentFields?.forEach((field) => {
            const fieldKey = field.name as keyof T;

            newValidationErrors[fieldKey] = validateField(
                field.value,
                String(fieldKey),
                field.isRequired
            );
        });

        setValidationErrors(newValidationErrors);
        Object.values(newValidationErrors).forEach(
            (error) => {
                if (error) isValid = false;
            }
        );
        return isValid;
    }, [currentFields, validationErrors]);

    const setFieldValue = useCallback((fieldName: keyof T, value: any): void => {
        setFields((prevFields) =>
            prevFields?.map((field) =>
                field.name === fieldName ? { ...field, value } : field
            )
        );
    }, []);

    const clearErrors = useCallback(() => {
        setValidationErrors(initialErrors);
    }, [initialErrors]);

    const handleSubmit = useCallback(() => {
        setIsSubmitted(true);
        onSubmit?.();
    }, [onSubmit]);

    const getFieldByName = useCallback((fieldName: keyof T) => currentFields?.find(field => field.name === fieldName), [currentFields]);
    const getFieldValue = useCallback((fieldName: keyof T) => getFieldByName(fieldName)?.value, [getFieldByName])

    return {
        validateField: validateFieldHook,
        isValid,
        setFieldValue,
        validationErrors,
        clearErrors,
        isSubmitted,
        onSubmit: handleSubmit,
        getFieldByName,
        getFieldValue
    };
};

export default useFormValidation;