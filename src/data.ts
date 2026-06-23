import { InventoryItem, SiteInventory, InventoryTransaction, LowStockAlert } from './types';

export interface Site extends SiteInventory {
  output: number; // in tons
  totalCost: number; // in Naira
  target: number;
  lastMonth: number;
  mom: number;
  budget: number;
  outputTarget: number;
  topSupplier: string;
  topDriver: string;
  topDriverPct: number;
  waste: number;
  wasteTarget: number;
  laborEff: number;
  downtime: number;
  materials: { name: string; pct: number; value: number; color: string }[];
  departments: { name: string; value: number }[];
  suppliers: { name: string; spend: number; avgKg: number; lastDelivery: string }[];
  feed: { type: string; title: string; sub: string; time: string }[];
}

export const INITIAL_ITEMS: InventoryItem[] = [
  { id: 'item-1', name: 'Maize', category: 'Grain', unit: 'kg', weightPerBag: 50, minThreshold: 10000, costPerKg: 410 },
  { id: 'item-2', name: 'Soybean Meal', category: 'Protein', unit: 'kg', weightPerBag: 50, minThreshold: 8000, costPerKg: 389 },
  { id: 'item-3', name: 'Wheat Bran', category: 'Fiber', unit: 'kg', weightPerBag: 25, minThreshold: 5000, costPerKg: 205 },
  { id: 'item-4', name: 'Premix & Additives', category: 'Additive', unit: 'kg', weightPerBag: 25, minThreshold: 1500, costPerKg: 1240 },
  { id: 'item-5', name: 'Limestone', category: 'Mineral', unit: 'kg', weightPerBag: 50, minThreshold: 2000, costPerKg: 98 },
  { id: 'item-6', name: 'Bone Meal', category: 'Mineral', unit: 'kg', weightPerBag: 50, minThreshold: 2500, costPerKg: 140 }
];

export const INITIAL_SITES: Site[] = [
  {
    siteId: 'site-A',
    siteName: 'Ibadan',
    manager: 'Tunde Akinola',
    managerEmail: 'tunde.akinola@benulifarms.com',
    output: 842,
    totalCost: 55151000,
    target: 60000,
    lastMonth: 64300,
    mom: 1.8,
    budget: 58000000,
    outputTarget: 900,
    topSupplier: 'Premier Feeds Ltd',
    topDriver: 'Maize',
    topDriverPct: 41,
    waste: 3.2,
    wasteTarget: 4,
    laborEff: 4.8,
    downtime: 6.5,
    materials: [
      { name: 'Maize', pct: 41, value: 22612000, color: 'var(--maize)' },
      { name: 'Soybean Meal', pct: 27, value: 14891000, color: 'var(--husk)' },
      { name: 'Wheat Bran', pct: 18, value: 9927000, color: 'var(--teal)' },
      { name: 'Premix & Additives', pct: 9, value: 4964000, color: 'var(--violet)' },
      { name: 'Limestone & Others', pct: 5, value: 2757000, color: 'var(--ink-faint)' }
    ],
    departments: [
      { name: 'Raw Materials', value: 38200000 },
      { name: 'Labor', value: 7800000 },
      { name: 'Transport', value: 5100000 },
      { name: 'Utilities', value: 2900000 },
      { name: 'Maintenance', value: 1151000 }
    ],
    suppliers: [
      { name: 'Premier Feeds Ltd', spend: 18400000, avgKg: 412, lastDelivery: '3 days ago' },
      { name: 'Coastal Soy Traders', spend: 12650000, avgKg: 389, lastDelivery: '1 day ago' },
      { name: 'Bran & Bag Supplies', spend: 6920000, avgKg: 205, lastDelivery: '5 days ago' },
      { name: 'AgroChem Additives Ltd', spend: 4964000, avgKg: 1240, lastDelivery: '2 days ago' },
      { name: 'Limestone Direct', spend: 2757000, avgKg: 98, lastDelivery: '6 days ago' }
    ],
    feed: [
      { type: 'intake', title: 'Intake — Premier Feeds Ltd', sub: '18,000kg Maize', time: '12 min ago' },
      { type: 'production', title: 'Production — Layer Mash Batch #228', sub: '6,200kg', time: '1 hr ago' },
      { type: 'expense', title: 'Expense — Diesel refuel', sub: '₦184,000', time: '3 hrs ago' },
      { type: 'intake', title: 'Intake — Coastal Soy Traders', sub: '9,500kg Soybean Meal', time: 'Yesterday, 4:10pm' },
      { type: 'flag', title: 'Damage flag — Wheat Bran delivery', sub: '6.8% damage recorded', time: 'Yesterday, 11:02am' },
      { type: 'production', title: 'Production — Broiler Starter Batch #227', sub: '5,800kg', time: '2 days ago' }
    ],
    stocks: {
      'item-1': 15400,
      'item-2': 12650,
      'item-3': 4200, // LOW STOCK
      'item-4': 1840,
      'item-5': 2750,
      'item-6': 3100
    }
  },
  {
    siteId: 'site-B',
    siteName: 'Kano',
    manager: 'Aisha Bello',
    managerEmail: 'aisha.bello@benulifarms.com',
    output: 610,
    totalCost: 42029000,
    target: 60000,
    lastMonth: 65800,
    mom: 4.6,
    budget: 44000000,
    outputTarget: 650,
    topSupplier: 'Sahel Grains Co.',
    topDriver: 'Maize',
    topDriverPct: 38,
    waste: 4.8,
    wasteTarget: 4,
    laborEff: 4.1,
    downtime: 11.2,
    materials: [
      { name: 'Maize', pct: 38, value: 15971020, color: 'var(--maize)' },
      { name: 'Soybean Meal', pct: 25, value: 10507250, color: 'var(--husk)' },
      { name: 'Wheat Bran', pct: 19, value: 7985510, color: 'var(--teal)' },
      { name: 'Premix & Additives', pct: 11, value: 4623190, color: 'var(--violet)' },
      { name: 'Limestone & Others', pct: 7, value: 2942030, color: 'var(--ink-faint)' }
    ],
    departments: [
      { name: 'Raw Materials', value: 29420000 },
      { name: 'Labor', value: 6100000 },
      { name: 'Transport', value: 4200000 },
      { name: 'Utilities', value: 1600000 },
      { name: 'Maintenance', value: 709000 }
    ],
    suppliers: [
      { name: 'Sahel Grains Co.', spend: 14100000, avgKg: 398, lastDelivery: '2 days ago' },
      { name: 'Northern Maize Hub', spend: 9800000, avgKg: 401, lastDelivery: '4 days ago' },
      { name: 'Bran & Bag Supplies', spend: 5200000, avgKg: 210, lastDelivery: '1 day ago' },
      { name: 'AgroChem Additives Ltd', spend: 3600000, avgKg: 1255, lastDelivery: '5 days ago' },
      { name: 'Limestone Direct', spend: 2100000, avgKg: 101, lastDelivery: '6 days ago' }
    ],
    feed: [
      { type: 'intake', title: 'Intake — Sahel Grains Co.', sub: '14,200kg Maize', time: '40 min ago' },
      { type: 'flag', title: 'Damage flag — Maize delivery', sub: '7.1% damage recorded', time: '2 hrs ago' },
      { type: 'expense', title: 'Expense — Generator diesel', sub: '₦96,000', time: '5 hrs ago' }
    ],
    stocks: {
      'item-1': 8500, // LOW STOCK
      'item-2': 9200,
      'item-3': 6100,
      'item-4': 1100, // LOW STOCK
      'item-5': 3100,
      'item-6': 2900
    }
  },
  {
    siteId: 'site-C',
    siteName: 'Aba',
    manager: 'Chidi Okeke',
    managerEmail: 'chidi.okeke@benulifarms.com',
    output: 398,
    totalCost: 31155500,
    target: 60000,
    lastMonth: 73700,
    mom: 6.1,
    budget: 30000000,
    outputTarget: 480,
    topSupplier: 'Eastern Agro Supply',
    topDriver: 'Soybean Meal',
    topDriverPct: 35,
    waste: 6.4,
    wasteTarget: 4,
    laborEff: 3.2,
    downtime: 18.5,
    materials: [
      { name: 'Soybean Meal', pct: 35, value: 10904425, color: 'var(--husk)' },
      { name: 'Maize', pct: 33, value: 10281315, color: 'var(--maize)' },
      { name: 'Wheat Bran', pct: 16, value: 4984880, color: 'var(--teal)' },
      { name: 'Premix & Additives', pct: 10, value: 3115550, color: 'var(--violet)' },
      { name: 'Limestone & Others', pct: 6, value: 1869330, color: 'var(--ink-faint)' }
    ],
    departments: [
      { name: 'Raw Materials', value: 21155500 },
      { name: 'Labor', value: 5200000 },
      { name: 'Transport', value: 2900000 },
      { name: 'Utilities', value: 1300000 },
      { name: 'Maintenance', value: 600000 }
    ],
    suppliers: [
      { name: 'Eastern Agro Supply', spend: 9400000, avgKg: 415, lastDelivery: '1 day ago' },
      { name: 'Coastal Soy Traders', spend: 7200000, avgKg: 392, lastDelivery: '3 days ago' },
      { name: 'Bran & Bag Supplies', spend: 4100000, avgKg: 215, lastDelivery: '2 days ago' },
      { name: 'AgroChem Additives Ltd', spend: 2900000, avgKg: 1280, lastDelivery: '4 days ago' },
      { name: 'Limestone Direct', spend: 1500000, avgKg: 104, lastDelivery: '7 days ago' }
    ],
    feed: [
      { type: 'flag', title: 'Damage flag — Soybean Meal delivery', sub: '8.4% damage recorded', time: '1 hr ago' },
      { type: 'expense', title: 'Expense — Machine repair', sub: '₦310,000', time: '6 hrs ago' },
      { type: 'production', title: 'Production — Grower Mash Batch #114', sub: '3,900kg', time: '1 day ago' }
    ],
    stocks: {
      'item-1': 12100,
      'item-2': 5400, // LOW STOCK
      'item-3': 3900, // LOW STOCK
      'item-4': 1900,
      'item-5': 1800, // LOW STOCK
      'item-6': 2200  // LOW STOCK
    }
  },
  {
    siteId: 'site-D',
    siteName: 'Kaduna',
    manager: 'Musa Garba',
    managerEmail: 'musa.garba@benulifarms.com',
    output: 705,
    totalCost: 40819500,
    target: 60000,
    lastMonth: 59200,
    mom: -2.3,
    budget: 43000000,
    outputTarget: 720,
    topSupplier: 'Northern Maize Hub',
    topDriver: 'Maize',
    topDriverPct: 44,
    waste: 2.1,
    wasteTarget: 4,
    laborEff: 5.6,
    downtime: 3.0,
    materials: [
      { name: 'Maize', pct: 44, value: 17960580, color: 'var(--maize)' },
      { name: 'Soybean Meal', pct: 24, value: 9796680, color: 'var(--husk)' },
      { name: 'Wheat Bran', pct: 17, value: 6939315, color: 'var(--teal)' },
      { name: 'Premix & Additives', pct: 9, value: 3673755, color: 'var(--violet)' },
      { name: 'Limestone & Others', pct: 6, value: 2449170, color: 'var(--ink-faint)' }
    ],
    departments: [
      { name: 'Raw Materials', value: 28819500 },
      { name: 'Labor', value: 5900000 },
      { name: 'Transport', value: 3400000 },
      { name: 'Utilities', value: 1800000 },
      { name: 'Maintenance', value: 900000 }
    ],
    suppliers: [
      { name: 'Northern Maize Hub', spend: 14700000, avgKg: 395, lastDelivery: '1 day ago' },
      { name: 'Sahel Grains Co.', spend: 8100000, avgKg: 401, lastDelivery: '3 days ago' },
      { name: 'Bran & Bag Supplies', spend: 4900000, avgKg: 198, lastDelivery: '2 days ago' },
      { name: 'AgroChem Additives Ltd', spend: 3200000, avgKg: 1210, lastDelivery: '4 days ago' },
      { name: 'Limestone Direct', spend: 1900000, avgKg: 95, lastDelivery: '5 days ago' }
    ],
    feed: [
      { type: 'production', title: 'Production — Layer Mash Batch #309', sub: '7,100kg', time: '25 min ago' },
      { type: 'intake', title: 'Intake — Northern Maize Hub', sub: '21,000kg Maize', time: '3 hrs ago' },
      { type: 'expense', title: 'Expense — Forklift maintenance', sub: '₦142,000', time: 'Yesterday' }
    ],
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

export const INITIAL_TOP_SUPPLIERS: { name: string; value: number }[] = [
  { name: 'Premier Feeds Ltd', value: 38200000 },
  { name: 'Sahel Grains Co.', value: 29800000 },
  { name: 'Northern Maize Hub', value: 24500000 },
  { name: 'Eastern Agro Supply', value: 21100000 },
  { name: 'AgroChem Additives Ltd', value: 12900000 }
];

export const INITIAL_DEPARTMENTS_COMPANY: { name: string; value: number }[] = [
  { name: 'Raw Materials', value: 118000000 },
  { name: 'Labor', value: 22400000 },
  { name: 'Transport & Logistics', value: 14600000 },
  { name: 'Utilities', value: 9200000 },
  { name: 'Maintenance', value: 4955000 }
];

export const INITIAL_TREND_12MO: number[] = [58200, 59100, 58700, 60400, 61200, 63500, 62100, 63800, 64900, 65300, 67100, 66200];
export const INITIAL_TREND_MONTHS: string[] = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export interface Expense {
  date: string;
  dept: string;
  desc: string;
  supplier: string;
  amount: number;
  receipt: boolean;
}

export const INITIAL_EXPENSES: Expense[] = [
  { date: 'Jun 17', dept: 'Logistics', desc: 'Diesel refuel — site truck', supplier: 'Total Energies', amount: 184000, receipt: true },
  { date: 'Jun 17', dept: 'Maintenance', desc: 'Conveyor belt repair', supplier: 'Bello Mechanical', amount: 96500, receipt: false },
  { date: 'Jun 16', dept: 'Utilities', desc: 'NEPA bill — June', supplier: 'Ibadan Disco', amount: 412000, receipt: true },
  { date: 'Jun 15', dept: 'Labor', desc: 'Casual loaders — weekend shift', supplier: '—', amount: 68000, receipt: false },
  { date: 'Jun 14', dept: 'Raw Materials', desc: 'Premix top-up order', supplier: 'AgroChem Additives Ltd', amount: 1240000, receipt: true },
  { date: 'Jun 13', dept: 'Logistics', desc: 'Truck hire — Kano route', supplier: 'Yusuf Transport', amount: 230000, receipt: true },
  { date: 'Jun 12', dept: 'Maintenance', desc: 'Hammer mill blade set', supplier: 'Industrial Parts NG', amount: 540000, receipt: false }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-1',
    siteId: 'site-A',
    siteName: 'Ibadan',
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
    siteName: 'Ibadan',
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
    siteName: 'Kano',
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
    siteName: 'Aba',
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
    siteName: 'Kaduna',
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
    siteName: 'Ibadan',
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
    siteName: 'Kano',
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
    siteName: 'Kano',
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
    siteName: 'Aba',
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
    siteName: 'Aba',
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
    siteName: 'Aba',
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
    siteName: 'Aba',
    itemId: 'item-6',
    itemName: 'Bone Meal',
    currentStock: 2200,
    minThreshold: 2500,
    timestamp: '2026-06-20T17:15:00Z',
    status: 'active'
  }
];
