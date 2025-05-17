export interface DiscountRequest {
    name: string;
    value: number;
    validUntil: Date;
    type: 'MATRICULA' | 'MENSALIDADE';  // Using literal types for better type safety
}
export interface DiscountResponse {
    id: string;

}




