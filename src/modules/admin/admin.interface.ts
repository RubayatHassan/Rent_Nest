import { ActiveStatus, PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";

export interface IUpdateUserStatus {
  activeStatus: ActiveStatus;
}

export interface IUpdatePropertyStatus {
  status: PropertyStatus;
}

export interface IUpdateRentalStatus {
  status: RentalRequestStatus;
}
