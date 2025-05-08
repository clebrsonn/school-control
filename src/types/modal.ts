export const ModalTypes = {
  STUDENT: 'student',
  MONTHLY_FEE: 'monthlyFee'
} as const;

export type ModalType = typeof ModalTypes[keyof typeof ModalTypes];
