export const validateField = (value: any, fieldName: string, isRequired?: boolean): string => {
  let errorMessage = '';

  if (isRequired && !value) {
    errorMessage = `${fieldName} is required`;
    return errorMessage;
  }

  switch (fieldName) {
    case 'name':
      if (typeof value !== 'string') {
        errorMessage = `${fieldName} must be a string`;
      }
      break;
    case 'amount':
    case 'enrollmentFee':
    case 'monthlyFee':
    case 'value':
      if (isNaN(Number(value)) || Number(value) <= 0) {
        errorMessage = `${fieldName} must be a number greater than zero`;
      }
      break;
    // Add more field-specific validations as needed
    }

  return errorMessage;
};