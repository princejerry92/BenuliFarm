export interface InventoryItem {
  id: string;
  name: string;
  category: 'Grain' | 'Protein' | 'Fiber' | 'Additive' | 'Mineral';
  unit: 'kg' | 'tons';
  weightPerBag?: number; // e.g., 50kg bags
  minThreshold: number; // overall or site-specific threshold in kg
  costPerKg: number; // Unit price in Naira per kg
}

export interface SiteInventory {
  siteId: string;
  siteName: string;
  manager: string;
  managerEmail: string;
  stocks: { [itemId: string]: number }; // quantity in kg
}

export interface InventoryTransaction {
  id: string;
  siteId: string;
  siteName: string;
  itemId: string;
  itemName: string;
  type: 'add' | 'collect'; // 'add' to stock, 'collect' (consume/use) from stock
  quantity: number; // in kg
  timestamp: string; // ISO format
  operator: string;
  notes?: string;
  cost?: number; // Total value of transaction (qty * costPerKg)
}

export interface LowStockAlert {
  id: string;
  siteId: string;
  siteName: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minThreshold: number;
  timestamp: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
}
