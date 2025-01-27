export interface Parent {
  _id: string;
  nome: string;
  // Adicione outros campos conforme necessário
}

export interface Student {
  _id: string;
  nome: string;
  parentId: string;
  // Adicione outros campos conforme necessário
}

export interface MonthlyFee {
  _id: string;
  amount: number;
  dueDate: string;
  parentId: string;
  isPaid: boolean;
  // Adicione outros campos conforme necessário
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  discountId?: string;
  parentId: string;
  // Adicione outros campos conforme necessário
}