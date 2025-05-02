export enum PaymentMethod {
  PIX = "PIX",
  BOLETO = "BOLETO",
  CARTAO_CREDITO = "CARTAO_CREDITO",
  CARTAO_DEBITO = "CARTAO_DEBITO",
  TRANSFERENCIA_BANCARIA = "TRANSFERENCIA_BANCARIA"
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  invoiceId: string;
}
