// api/warehouse/internal_usage_log/types/internal.tsx

export type InternalUsage = {
    id: number;
    personnelName: string;
    department: string;
    purpose: string;
    authorizedBy: string;
    note?: string;
    status: "Utilized" | "Archived";
    loggedAt: string;
    loggedBy: string;
    items: InternalUsageItemDetail[];
};

export type InternalUsageItemDetail = {
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
