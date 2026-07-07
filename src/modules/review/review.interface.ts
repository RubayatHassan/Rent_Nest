export interface ICreateReview {
  rentalRequestId: string;
  rating: number | string;
  comment?: string;
}

export interface IUpdateReview {
  rating?: number | string;
  comment?: string;
}