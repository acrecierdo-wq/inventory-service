// app/warehouse/w_inventory/w_inventory_list/types/inventory.ts
export type InventoryCategory = {
  id: number;
  name: string;
};

export type InventoryUnit = {
  id: number;
  name: string;
};

export type InventoryVariant = {
  id: number;
  name: string;
};

export type InventorySize = {
  id: number;
  name: string;
};

export type InventoryItem = {
  id: number;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  variant: InventoryVariant | null;
  size: InventorySize | null;
  stock: number;
  status: string;
  ceilingLevel: number;
  reorderLevel: number;
  criticalLevel: number;
};

export interface InventoryItemsReport {
  id: number;
  name: string;
  category?: InventoryCategory;
  unit?: InventoryUnit;
  variant?: InventoryVariant | null;
  size?: InventorySize | null;
  stock?: number;
  status?: string;
}

export type ChartData = {
    name: string;
    stock: number;
};

export type PieChartData = {
    name: string;
    value: number;
}