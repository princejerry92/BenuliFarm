import { InventoryItem, SiteInventory, InventoryTransaction, LowStockAlert } from './types';

export const INITIAL_ITEMS: InventoryItem[] = [
  { id: 'item-1', name: 'Maize', category: 'Grain', unit: 'kg', weightPerBag: 50, minThreshold: 10000, costPerKg: 410 },
  { id: 'item-2', name: 'Soybean Meal', category: 'Protein', unit: 'kg', weightPerBag: 50, minThreshold: 8000, costPerKg: 389 },
  { id: 'item-3', name: 'Wheat Bran', category: 'Fiber', unit: 'kg', weightPerBag: 25, minThreshold: 5000, costPerKg: 205 },
  { id: 'item-4', name: 'Premix & Additives', category: 'Additive', unit: 'kg', weightPerBag: 25, minThreshold: 1500, costPerKg: 1240 },
  { id: 'item-5', name: 'Limestone', category: 'Mineral', unit: 'kg', weightPerBag: 50, minThreshold: 2000, costPerKg: 98 },
  { id: 'item-6', name: 'Bone Meal', category: 'Mineral', unit: 'kg', weightPerBag: 50, minThreshold: 2500, costPerKg: 140 }
];

export const INITIAL_SITE_INVENTORIES: SiteInventory[] = [
  {
    siteId: 'site-A',
    siteName: 'Ibadan (HQ)',
    manager: 'Tunde Akinola',
    managerEmail: 'tunde.akinola@benulifarms.com',
    stocks: {
      'item-1': 15400,
      'item-2': 12650,
      'item-3': 4200, // LOW STOCK (Threshold 5000)
      'item-4': 1840,
      'item-5': 2750,
      'item-6': 3100
    }
  },
  {
    siteId: 'site-B',
    siteName: 'Kano Mill',
    manager: 'Aisha Bello',
    managerEmail: 'aisha.bello@benulifarms.com',
    stocks: {
      'item-1': 8500, // LOW STOCK (Threshold 10000)
      'item-2': 9200,
      'item-3': 6100,
      'item-4': 1100, // LOW STOCK (Threshold 1500)
      'item-5': 3100,
      'item-6': 2900
    }
  },
  {
    siteId: 'site-C',
    siteName: 'Aba Depot',
    manager: 'Chidi Okeke',
    managerEmail: 'chidi.okeke@benulifarms.com',
    stocks: {
      'item-1': 12100,
      'item-2': 5400, // LOW STOCK (Threshold 8000)
      'item-3': 3900, // LOW STOCK (Threshold 5000)
      'item-4': 1900,
      'item-5': 1800, // LOW STOCK (Threshold 2000)
      'item-6': 2200  // LOW STOCK (Threshold 2500)
    }
  },
  {
    siteId: 'site-D',
    siteName: 'Kaduna Station',
    manager: 'Musa Garba',
    managerEmail: 'musa.garba@benulifarms.com',
    stocks: {
      'item-1': 22000,
      'item-2': 14000,
      'item-3': 8500,
      'item-4': 2400,
      'item-5': 4100,
      'item-6': 4300
    }
  }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-1',
    siteId: 'site-A',
    siteName: 'Ibadan (HQ)',
    itemId: 'item-1',
    itemName: 'Maize',
    type: 'add',
    quantity: 12000,
    timestamp: '2026-06-22T09:15:00Z',
    operator: 'Tunde Akinola',
    notes: 'Bulk purchase delivery from Premier Feeds Ltd',
    cost: 4920000
  },
  {
    id: 'tx-2',
    siteId: 'site-A',
    siteName: 'Ibadan (HQ)',
    itemId: 'item-2',
    itemName: 'Soybean Meal',
    type: 'collect',
    quantity: 3500,
    timestamp: '2026-06-22T14:30:00Z',
    operator: 'Tunde Akinola',
    notes: 'Batch closure for Layer Mash feed production',
    cost: 1361500
  },
  {
    id: 'tx-3',
    siteId: 'site-B',
    siteName: 'Kano Mill',
    itemId: 'item-4',
    itemName: 'Premix & Additives',
    type: 'collect',
    quantity: 450,
    timestamp: '2026-06-21T11:00:00Z',
    operator: 'Aisha Bello',
    notes: 'Premix depletion for Broiler Starter batch',
    cost: 558000
  },
  {
    id: 'tx-4',
    siteId: 'site-C',
    siteName: 'Aba Depot',
    itemId: 'item-3',
    itemName: 'Wheat Bran',
    type: 'collect',
    quantity: 1200,
    timestamp: '2026-06-20T16:45:00Z',
    operator: 'Chidi Okeke',
    notes: 'Consumed for local feed compound formulation',
    cost: 246000
  },
  {
    id: 'tx-5',
    siteId: 'site-D',
    siteName: 'Kaduna Station',
    itemId: 'item-5',
    itemName: 'Limestone',
    type: 'add',
    quantity: 5000,
    timestamp: '2026-06-19T10:20:00Z',
    operator: 'Musa Garba',
    notes: 'Inflow of calcium carbonate source from Limestone Direct',
    cost: 490000
  }
];

export const INITIAL_ALERTS: LowStockAlert[] = [
  {
    id: 'alt-1',
    siteId: 'site-A',
    siteName: 'Ibadan (HQ)',
    itemId: 'item-3',
    itemName: 'Wheat Bran',
    currentStock: 4200,
    minThreshold: 5000,
    timestamp: '2026-06-22T16:45:00Z',
    status: 'active'
  },
  {
    id: 'alt-2',
    siteId: 'site-B',
    siteName: 'Kano Mill',
    itemId: 'item-1',
    itemName: 'Maize',
    currentStock: 8500,
    minThreshold: 10000,
    timestamp: '2026-06-21T11:20:00Z',
    status: 'active'
  },
  {
    id: 'alt-3',
    siteId: 'site-B',
    siteName: 'Kano Mill',
    itemId: 'item-4',
    itemName: 'Premix & Additives',
    currentStock: 1100,
    minThreshold: 1500,
    timestamp: '2026-06-21T11:00:00Z',
    status: 'active'
  },
  {
    id: 'alt-4',
    siteId: 'site-C',
    siteName: 'Aba Depot',
    itemId: 'item-2',
    itemName: 'Soybean Meal',
    currentStock: 5400,
    minThreshold: 8000,
    timestamp: '2026-06-20T10:15:00Z',
    status: 'active'
  },
  {
    id: 'alt-5',
    siteId: 'site-C',
    siteName: 'Aba Depot',
    itemId: 'item-3',
    itemName: 'Wheat Bran',
    currentStock: 3900,
    minThreshold: 5000,
    timestamp: '2026-06-20T16:45:00Z',
    status: 'active'
  },
  {
    id: 'alt-6',
    siteId: 'site-C',
    siteName: 'Aba Depot',
    itemId: 'item-5',
    itemName: 'Limestone',
    currentStock: 1800,
    minThreshold: 2000,
    timestamp: '2026-06-20T17:00:00Z',
    status: 'active'
  },
  {
    id: 'alt-7',
    siteId: 'site-C',
    siteName: 'Aba Depot',
    itemId: 'item-6',
    itemName: 'Bone Meal',
    currentStock: 2200,
    minThreshold: 2500,
    timestamp: '2026-06-20T17:15:00Z',
    status: 'active'
  }
];
