export interface ResponsibleRequest {
  name: string;
  email: string;
  phone: string;
  document?: string;
}

export interface ResponsibleResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
}