// app/warehouse/issuance_log/types/issuance.ts

export type IssuanceItemDetail = {
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

export type IssuanceItem = {
  id: number;
  clientName: string;
  dispatcherName: string;
  customerPoNumber: string;
  prfNumber: string;
  drNumber: string;
  status: string;
  createdAt: string; // ISO date string
  issuedAt: string;  // ISO date string
  items: IssuanceItemDetail[];
};

export type DraftIssuance = {
  id: number;
  clientName: string;
  dispatcherName: string;
  createdAt: string;
  issuedAt: string | null;
  customerPoNumber: string;
  drNumber: string;
  prfNumber: string;
  isDraft: boolean;
  restocked: boolean;
  saveAsDraft: boolean;
  status: string;
  items: DraftIssuanceItem[];
};

export type DraftIssuanceItem = {
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

export type FormItem = {
  itemId: string;
  sizeId: string | null;
  variantId: string | null;
  unitId: string | null;
  quantity: number;
  itemName: string;
  sizeName: string | null;
  variantName: string | null;
  unitName: string | null;
};

