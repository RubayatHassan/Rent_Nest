export interface ICreateRentalRequest {
  propertyId: string;
  message?: string;
  moveInDate?: Date;
  durationMonths?: number;
}
