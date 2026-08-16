export type ClaimStatus = "pending" | "approved" | "paid" | "rejected";

/** A home-charging claim as returned by GET /reimbursements. */
export interface ReimbursementClaim {
  id: string;
  driverName: string;
  driverId: string;
  vehicleModel: string;
  plate: string;
  energyKwh: number;
  priceP: number;
  amountGbp: number;
  /** ISO timestamp of the charging session the claim was raised against. */
  chargedAt: string;
  status: ClaimStatus;
  location: string;
  gridRegion: string;
  tariff: string;
  source: string;
  notes: string;
}
