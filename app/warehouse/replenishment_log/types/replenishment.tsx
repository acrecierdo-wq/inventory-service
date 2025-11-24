// app/warehouse/replenishment_log/types/replenishment.tsx

export type Replenishment = {
  id: number;
  supplier: string;
  poRefNum: string;
  remarks?: string;
  drRefNum: string;
  status: "Replenished" | "Draft" | "Archived";
  createdAt: string;
  replenishedAt: string;
  recordedBy: string;
  items: ReplenishmentItemDetail[];
};

export type ReplenishmentItemDetail = {
  itemId: number;
  itemName: string;
  quantity: number;
  sizeId: number | null;
  sizeName: string | null;
  unitId: number | null;
  unitName: string | null;
  variantId: number | null;
  variantName: string | null;
};

export type DraftReplenishment = {
  id: number;
  supplier: string;
  poRefNum: string;
  remarks?: string;
  drRefNum: string;
  status: string;
  isDraft: boolean;
  createdAt: string;
  replenishedAt: string;
  recordedBy: string;
  items: ReplenishmentItemDetail[];
};

export type DraftReplenishmentItem = {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
  sizeId: number | null;
  sizeName: string | null;
  stock: number;
  unitId: number | null;
  unitName: string | null;
  variantId: number | null;
  variantName: string | null;
};

export type FormInfo = {
  itemId: string;
  sizeId: string | null;
  variantId: string | null;
  unitId: string | null;
  quantity: number; // Quantity being received in this replenishment
  itemName: string;
  sizeName: string | null;
  variantName: string | null;
  unitName: string | null;

  //  Track expected vs received
  expectedQuantity?: number; // From PO
  receivedSoFar?: number; // Already received before this replenishment
  remainingQuantity?: number; // Still needed after previous replenishments
};
