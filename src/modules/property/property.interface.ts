import { PropertyStatus } from "../../../generated/prisma/enums";

export interface IPropertyQuery {
  searchTerm?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  categoryId?: string;
  propertyType?: string;
  amenities?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ICreateProperty {
  title: string;
  description: string;
  location: string;
  address?: string;
  rentAmount: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  amenities?: string[];
  images?: string[];
  categoryId: string;
  status?: PropertyStatus;
}

export interface IUpdateProperty extends Partial<ICreateProperty> {}
