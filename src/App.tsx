import React, { useState, useEffect, useMemo } from 'react';
import { 
  Warehouse, LayoutGrid, Receipt, FileText, Bell, Sun, Moon, 
  ChevronDown, X, Plus, Search, Check, AlertTriangle, ArrowUp, ArrowRight,
  ArrowDown, User, SlidersHorizontal, Download, LogOut, Wifi, 
  Layers, Coins, Settings, Sprout
} from 'lucide-react';

import { 
  INITIAL_ITEMS, INITIAL_SITES, INITIAL_EXPENSES, 
  INITIAL_TRANSACTIONS, INITIAL_ALERTS, Site, Expense 
} from './data';
import { InventoryItem, InventoryTransaction, LowStockAlert } from './types';

// Import our modular subcomponents
import { MDDashboard } from './components/MDDashboard';
import { SiteDashboard } from './components/SiteDashboard';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { Modals } from './components/Modals';
import { AlertHub } from './components/AlertHub';
import { MultiSiteSiloMatrix } from './components/MultiSiteSiloMatrix';
import { TransactionLedger } from './components/TransactionLedger';

export default function App() {
  // --- DATABASE & STATE DEGRADATION RESISTANCE (Synced to LocalStorage) ---
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('benuli_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [sites, setSites] = useState<Site[]>(() => {
    const saved = localStorage.getItem('benuli_sites');
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('benuli_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('benuli_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [alerts, setAlerts] = useState<LowStockAlert[]>(() => {
    const saved = localStorage.getItem('benuli_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('benuli_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('benuli_sites', JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem('benuli_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('benuli_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('benuli_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // --- APPEARANCE & NAVIGATION STATE ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('benuli_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [currentRole, setCurrentRole] = useState<'md' | 'site'>('md');
  const [activeView, setActiveView] = useState<'md' | 'site' | 'inventory' | 'expenses' | 'reports' | 'profile'>('md');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-A');

  const [isBooting, setIsBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1900);
    return () => clearTimeout(timer);
  }, []);

  // Modal controls
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isCollectStockOpen, setIsCollectStockOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddProductionOpen, setIsAddProductionOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);

  // Profile Menu Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toast System
  interface Toast { id: string; type: 'success' | 'warn' | 'danger' | 'info'; title: string; desc?: string }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const triggerToast = (type: 'success' | 'warn' | 'danger' | 'info', title: string, desc?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, desc }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // --- THEME REFLEX ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('benuli_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    triggerToast('info', 'Theme Switched', `Interface adjusted to ${theme === 'light' ? 'dark' : 'light'} mode.`);
  };

  // Switch views cleanly based on active role
  const handleRoleSwitch = (role: 'md' | 'site') => {
    setCurrentRole(role);
    setIsProfileOpen(false);
    if (role === 'md') {
      setActiveView('md');
    } else {
      setActiveView('site');
    }
    triggerToast('info', 'Workspace Switched', `Now operating under ${role === 'md' ? 'Managing Director' : 'Site Manager'} dashboard credentials.`);
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    setCurrentRole('site');
    setActiveView('site');
    triggerToast('info', 'Silo Loaded', `Direct link mapped to ${sites.find(s => s.siteId === siteId)?.siteName} Mill Floor.`);
  };

  // --- TRANSACTIONAL ACTIONS & BUSINESS LOGIC ---

  // 1. Logging raw material intake delivery
  const handleAddStockSubmit = (
    itemId: string, 
    quantity: number, 
    operator: string, 
    notes: string,
    supplier?: string,
    unitCost?: number,
    damaged?: number,
    transport?: number,
    invoice?: string
  ) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const currentSite = sites.find(s => s.siteId === selectedSiteId);
    if (!currentSite) return;

    const finalUnitCost = unitCost !== undefined ? unitCost : item.costPerKg;
    const finalDamaged = damaged !== undefined ? damaged : 0;
    const finalTransport = transport !== undefined ? transport : 0;
    const netWeight = quantity - finalDamaged;
    const landedValue = (quantity * finalUnitCost) + finalTransport;

    // Update sites stocks
    setSites(prev => 
      prev.map(s => {
        if (s.siteId === selectedSiteId) {
          const newStocks = { ...s.stocks, [itemId]: (s.stocks[itemId] || 0) + netWeight };
          // Append feed log
          const newFeed = [
            { 
              type: 'intake', 
              title: `Intake — ${supplier || item.name}`, 
              sub: `Net: ${netWeight.toLocaleString()}kg registered by ${operator} (Landed: ₦${landedValue.toLocaleString()})`, 
              time: 'Just now' 
            },
            ...s.feed
          ];

          // Also check for damage warning flag and add to activity feed if needed
          const damagePct = quantity > 0 ? (finalDamaged / quantity) * 100 : 0;
          if (damagePct > 5) {
            newFeed.unshift({
              type: 'flag',
              title: `Damage flag — ${item.name} delivery`,
              sub: `Warning: ${damagePct.toFixed(1)}% damage recorded at intake from ${supplier || 'supplier'}.`,
              time: 'Just now'
            });
          }

          return {
            ...s,
            stocks: newStocks,
            feed: newFeed,
            // Increment operating costs as a raw material purchase
            totalCost: s.totalCost + landedValue
          };
        }
        return s;
      })
    );

    // Append to Transactions
    const txId = 'tx-' + Math.random().toString(36).substr(2, 9);
    const newTx: InventoryTransaction = {
      id: txId,
      siteId: selectedSiteId,
      siteName: currentSite.siteName,
      itemId,
      itemName: item.name,
      type: 'add',
      quantity: netWeight,
      timestamp: new Date().toISOString(),
      operator,
      notes: notes || `Intake delivery logged${invoice ? ` (Invoice: ${invoice})` : ''}`,
      cost: landedValue
    };
    setTransactions(prev => [newTx, ...prev]);

    // Check and update alerts
    setAlerts(prev => {
      const activeForThis = prev.filter(a => !(a.siteId === selectedSiteId && a.itemId === itemId));
      const currentStock = (currentSite.stocks[itemId] || 0) + netWeight;
      if (currentStock >= item.minThreshold) {
        return activeForThis;
      }
      return prev;
    });

    setIsAddStockOpen(false);
    triggerToast('success', 'Intake Logged Successfully', `₦${landedValue.toLocaleString()} landed cost mapped to ${currentSite.siteName} silo reserves.`);
  };

  // 2. Logging mixing/depletion consumption
  const handleCollectStockSubmit = (itemId: string, quantity: number, operator: string, notes: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const currentSite = sites.find(s => s.siteId === selectedSiteId);
    if (!currentSite) return;

    // Deduct stock
    setSites(prev => 
      prev.map(s => {
        if (s.siteId === selectedSiteId) {
          const newStocks = { ...s.stocks, [itemId]: Math.max(0, (s.stocks[itemId] || 0) - quantity) };
          const newFeed = [
            { type: 'production', title: `Formulation — ${item.name}`, sub: `${quantity.toLocaleString()}kg blended by ${operator}`, time: 'Just now' },
            ...s.feed
          ];
          return {
            ...s,
            stocks: newStocks,
            feed: newFeed
          };
        }
        return s;
      })
    );

    // Append transaction log
    const txId = 'tx-' + Math.random().toString(36).substr(2, 9);
    const newTx: InventoryTransaction = {
      id: txId,
      siteId: selectedSiteId,
      siteName: currentSite.siteName,
      itemId,
      itemName: item.name,
      type: 'collect',
      quantity,
      timestamp: new Date().toISOString(),
      operator,
      notes: notes || 'Silo reserve depletion formulation',
      cost: quantity * item.costPerKg
    };
    setTransactions(prev => [newTx, ...prev]);

    // Evaluate if low-stock alert is breached
    const finalStock = Math.max(0, (currentSite.stocks[itemId] || 0) - quantity);
    if (finalStock < item.minThreshold) {
      const exists = alerts.some(a => a.siteId === selectedSiteId && a.itemId === itemId && a.status === 'active');
      if (!exists) {
        const altId = 'alt-' + Math.random().toString(36).substr(2, 9);
        const newAlt: LowStockAlert = {
          id: altId,
          siteId: selectedSiteId,
          siteName: currentSite.siteName,
          itemId,
          itemName: item.name,
          currentStock: finalStock,
          minThreshold: item.minThreshold,
          timestamp: new Date().toISOString(),
          status: 'active'
        };
        setAlerts(prev => [newAlt, ...prev]);
        triggerToast('danger', 'Low Stock Alert Triggered!', `${item.name} at ${currentSite.siteName} has fallen to ${finalStock.toLocaleString()}kg. Below limit!`);
      }
    }

    setIsCollectStockOpen(false);
    triggerToast('success', 'Consumption Logged', `${quantity.toLocaleString()}kg of ${item.name} dispatched to mixer lines.`);
  };

  // 3. Add New Catalog Material Item
  const handleNewItemSubmit = (
    name: string, 
    category: 'Grain' | 'Protein' | 'Fiber' | 'Additive' | 'Mineral', 
    unit: 'kg' | 'tons', 
    minThreshold: number, 
    costPerKg: number, 
    weightPerBag: number
  ) => {
    const nextId = 'item-' + (items.length + 1);
    const newItem: InventoryItem = {
      id: nextId,
      name,
      category,
      unit,
      minThreshold,
      costPerKg,
      weightPerBag
    };

    setItems(prev => [...prev, newItem]);
    setIsNewItemOpen(false);
    triggerToast('success', 'Material Cataloged', `${name} added to global nutritional ingredients indices.`);
  };

  // 4. Log General Operating Expense
  const handleAddExpenseSubmit = (dept: string, desc: string, supplier: string, amount: number, receipt: boolean) => {
    const newExpense: Expense = {
      date: 'Jun ' + new Date().getDate(),
      dept,
      desc,
      supplier: supplier || '—',
      amount,
      receipt
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Deduct site budget and register feed
    setSites(prev => 
      prev.map(s => {
        if (s.siteId === selectedSiteId) {
          return {
            ...s,
            totalCost: s.totalCost + amount,
            feed: [
              { type: 'expense', title: `Expense — ${desc}`, sub: `₦${amount.toLocaleString()} logged under ${dept}`, time: 'Just now' },
              ...s.feed
            ]
          };
        }
        return s;
      })
    );

    setIsAddExpenseOpen(false);
    triggerToast('success', 'Expense Logged', `₦${amount.toLocaleString()} charged against operational ledger.`);
  };

  // 5. Complete Production Batch Tonnage
  const handleAddProductionSubmit = (qty: number, damaged: number, cost: number, product: string, bagWeight?: number) => {
    const finalBagWeight = bagWeight || 25;
    const netWeight = qty - damaged;
    const qtyTons = netWeight / 1000;
    const wastePct = qty > 0 ? (damaged / qty) * 100 : 0;
    
    setSites(prev => 
      prev.map(s => {
        if (s.siteId === selectedSiteId) {
          // Increment site output and update feed
          const newFeed = [
            { 
              type: 'production', 
              title: `Production Batch — ${product}`, 
              sub: `Completed ${netWeight.toLocaleString()}kg finished mash tonnage (${Math.floor(netWeight / finalBagWeight).toLocaleString()} bags)`, 
              time: 'Just now' 
            },
            ...s.feed
          ];

          if (wastePct > 5) {
            newFeed.unshift({
              type: 'flag',
              title: `Damage/Waste flag — Batch ${product}`,
              sub: `Warning: Process waste is ${wastePct.toFixed(1)}% on this batch.`,
              time: 'Just now'
            });
          }

          return {
            ...s,
            output: s.output + qtyTons,
            totalCost: s.totalCost + cost,
            feed: newFeed
          };
        }
        return s;
      })
    );

    setIsAddProductionOpen(false);
    triggerToast('success', 'Production Batch Recorded', `Batch completed successfully. ${qtyTons.toFixed(2)} tons added to mill output.`);
  };

  // 6. Establish New Site Mill Location
  const handleAddSiteSubmit = (name: string, manager: string, outputTarget: number, budget: number) => {
    const nextId = 'site-' + String.fromCharCode(65 + sites.length); // site-E, F, etc.
    const newSite: Site = {
      siteId: nextId,
      siteName: name,
      manager,
      managerEmail: `${manager.toLowerCase().replace(/\s+/g, '.')}@benulifarms.com`,
      output: 0,
      totalCost: 0,
      target: 60000,
      lastMonth: 0,
      mom: 0,
      budget,
      outputTarget,
      topSupplier: '—',
      topDriver: '—',
      topDriverPct: 0,
      waste: 0,
      wasteTarget: 4,
      laborEff: 0,
      downtime: 0,
      materials: [],
      departments: [],
      suppliers: [],
      feed: [],
      stocks: {}
    };

    setSites(prev => [...prev, newSite]);
    setIsAddSiteOpen(false);
    triggerToast('success', 'New Site Established', `${name} Mill Terminal successfully active in database.`);
  };

  // 7. Resolve Stock Alerts (Trigger Quick Restock)
  const handleResolveAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    // Trigger standard addStock logic automatically
    handleAddStockSubmit(
      alert.itemId, 
      alert.minThreshold, 
      'Central Procurement Auto', 
      `Emergency replenishment of ${alert.itemName} under Restock protocol.`
    );

    setAlerts(prev => prev.filter(a => a.id !== alertId));
    triggerToast('success', 'Replenishment Dispatched', `Urgent restock order for ${alert.minThreshold.toLocaleString()}kg ${alert.itemName} sent to logistics channels.`);
  };

  const handleNotifyManager = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    triggerToast('info', 'Manager Notified', `SMS & Email dispatch ticket sent to ${sites.find(s => s.siteId === alert.siteId)?.manager || 'Site Manager'}.`);
  };

  // --- CSV EXPORT UTILS ---
  const handleExportLeaderboardCSV = () => {
    const rows = [['Rank', 'Location', 'Output (tons)', 'Total Spend (₦)', 'Landed Cost / Ton (₦)']];
    
    const sorted = [...sites].sort((a,b) => {
      const cptA = a.output > 0 ? a.totalCost / a.output : 0;
      const cptB = b.output > 0 ? b.totalCost / b.output : 0;
      return cptB - cptA;
    });

    sorted.forEach((s, idx) => {
      const cpt = s.output > 0 ? s.totalCost / s.output : 0;
      rows.push([
        (idx + 1).toString(),
        s.siteName,
        s.output.toString(),
        s.totalCost.toString(),
        Math.round(cpt).toString()
      ]);
    });

    const csvContent = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benuli_landed_cost_leaderboard.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('success', 'CSV Leaderboard Exported', 'Landed cost table downloaded.');
  };

  const handleExportExpensesCSV = () => {
    const rows = [['Date', 'Department', 'Description', 'Payee / Supplier', 'Amount (₦)', 'Receipt Slip Attached']];
    expenses.forEach(e => {
      rows.push([
        e.date,
        e.dept,
        e.desc,
        e.supplier,
        e.amount.toString(),
        e.receipt ? 'TRUE' : 'FALSE'
      ]);
    });

    const csvContent = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benuli_expenses_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('success', 'CSV Ledger Exported', 'Complete expenditures downloaded.');
  };

  const handleExportTxCSV = () => {
    const rows = [['ID', 'Silo Location', 'Material Source', 'Action Type', 'Tonnage quantity (kg)', 'Timestamp', 'Operator', 'Value (₦)']];
    transactions.forEach(t => {
      rows.push([
        t.id,
        t.siteName,
        t.itemName,
        t.type === 'add' ? 'Intake' : 'Deduction',
        t.quantity.toString(),
        t.timestamp,
        t.operator,
        t.cost ? t.cost.toString() : '0'
      ]);
    });

    const csvContent = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benuli_inventory_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('success', 'CSV Inventory Exported', 'Stock ledger records downloaded.');
  };

  // --- AUTOMATIC LIVE METRIC LOG SIMULATION (Full-Stack Feel) ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        // Trigger a random simulation event!
        const rSite = sites[Math.floor(Math.random() * sites.length)];
        const rItem = items[Math.floor(Math.random() * items.length)];
        const rQty = Math.floor(Math.random() * 8000) + 1000;
        
        triggerToast(
          'info', 
          `Real-time Inflow Recorded`, 
          `Auto-Log: ${rQty.toLocaleString()}kg of ${rItem.name} received at ${rSite.siteName} Mill floor.`
        );

        // Update site stock
        setSites(prev => 
          prev.map(s => {
            if (s.siteId === rSite.siteId) {
              const currentStockVal = s.stocks[rItem.id] || 0;
              const newStocks = { ...s.stocks, [rItem.id]: currentStockVal + rQty };
              const newFeed = [
                { type: 'intake', title: `Intake — Auto Replenishment`, sub: `${rQty.toLocaleString()}kg received via procurement`, time: '1 min ago' },
                ...s.feed
              ];
              return {
                ...s,
                stocks: newStocks,
                feed: newFeed,
                totalCost: s.totalCost + (rQty * rItem.costPerKg)
              };
            }
            return s;
          })
        );

        // Clear active alert if it falls above safety limit
        setAlerts(prev => prev.filter(a => !(a.siteId === rSite.siteId && a.itemId === rItem.id)));
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [sites, items, alerts]);

  // Unified global inventory statistics for calculation
  const totalValuation = useMemo(() => {
    let sum = 0;
    sites.forEach(s => {
      Object.entries(s.stocks).forEach(([itemId, qty]) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
          sum += (qty as number) * item.costPerKg;
        }
      });
    });
    return sum;
  }, [sites, items]);

  const totalNetworkTons = useMemo(() => {
    let sum = 0;
    sites.forEach(s => {
      Object.values(s.stocks).forEach(qty => {
        sum += (qty as number);
      });
    });
    return sum / 1000; // to metric tons
  }, [sites]);

  if (isBooting) {
    return (
      <div id="boot" onClick={() => setIsBooting(false)} className="fixed inset-0 z-50 bg-[#0D0F0C] flex items-center justify-center flex-col gap-6 cursor-pointer">
        <div className="flex flex-col items-center gap-4 text-center">
          <svg className="boot-mark w-20 h-20 text-maize animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 9 L12 3 L17 9 V19 A2 2 0 0 1 15 21 H9 A2 2 0 0 1 7 19 Z"/>
            <line x1="7" y1="13" x2="17" y2="13"/>
          </svg>
          <div className="boot-word text-2xl font-bold tracking-widest text-[#F3F1E7]">BENULI</div>
          <div className="boot-tag text-[10px] tracking-[0.15em] text-[#686A5C] uppercase font-bold">Feed Production Intelligence</div>
          <div className="boot-bar w-28 h-0.5 bg-[#2A2F23] rounded-full overflow-hidden mt-1 relative">
            <div className="absolute top-0 bottom-0 left-0 w-2/5 bg-maize rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div id="login" className="flex items-center justify-center min-h-screen text-ink relative">
        <div className="login-field"></div>
        <div className="login-grain"></div>
        <div className="login-wrap w-full max-w-[880px] px-6 relative z-10">
          <div className="login-mark flex items-center gap-3 justify-center mb-8">
            <svg className="w-9 h-9 text-maize" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 9 L12 3 L17 9 V19 A2 2 0 0 1 15 21 H9 A2 2 0 0 1 7 19 Z"/>
              <line x1="7" y1="13" x2="17" y2="13"/>
            </svg>
            <strong className="text-xl tracking-tight text-white">BENULI</strong>
          </div>
          <div className="login-head text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Who's checking the numbers today?</h1>
            <p className="text-ink-dim text-sm">Pick a role to step into the demo workspace.</p>
          </div>
          <div className="role-grid grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[700px] mx-auto">
            <button className="role-card group text-left cursor-pointer" onClick={() => { setIsLoggedIn(true); handleRoleSwitch('md'); }}>
              <div className="ricon">
                <LayoutGrid className="w-5 h-5 text-maize" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-ink mb-1 group-hover:text-maize transition-colors">Managing Director</h3>
                <p className="text-xs text-ink-dim leading-relaxed">All four sites, one cost-per-ton view. Spot the bleed before month-end.</p>
              </div>
              <span className="renter flex items-center gap-1.5 mt-2 font-semibold text-xs text-maize">
                Enter as MD <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button className="role-card group text-left cursor-pointer" onClick={() => { setIsLoggedIn(true); handleRoleSwitch('site'); }}>
              <div className="ricon">
                <Warehouse className="w-5 h-5 text-maize" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-ink mb-1 group-hover:text-maize transition-colors">Site Manager</h3>
                <p className="text-xs text-ink-dim leading-relaxed">Run Ibadan. Log intake, track waste, hit budget — without the spreadsheet.</p>
              </div>
              <span className="renter flex items-center gap-1.5 mt-2 font-semibold text-xs text-maize">
                Enter as Site Manager <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
          <div className="login-foot text-center mt-10 text-[11px] text-ink-faint">Demo data shown · No account needed</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. TOP GLOBAL RUNTIME STATUS BAR */}
      <header className="border-b border-line bg-surface-2/80 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Sign */}
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-maize to-husk flex items-center justify-center text-maize-ink text-base font-black shadow-md border border-maize/20">
            B
          </span>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
              <span>BENULI FARMS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-good animate-ping" />
            </h1>
            <p className="text-[10px] text-ink-faint tracking-wider uppercase font-bold">Mill Command Centre</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          {/* Active Network Stream */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-good font-bold bg-good-dim/30 border border-good/20 px-2.5 py-1 rounded-full">
            <Wifi className="w-3 h-3 text-good" />
            <span>HQ CHANNEL LIVE</span>
          </div>

          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface-3 hover:bg-surface border border-line text-ink-dim hover:text-ink transition-colors"
            title="Toggle theme appearance"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-maize" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button className="p-2 rounded-xl bg-surface-3 hover:bg-surface border border-line text-ink-dim hover:text-ink transition-colors">
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {alerts.length}
                </span>
              )}
            </button>
          </div>

          {/* User profile with role dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="flex items-center gap-1.5 p-1 px-2.5 rounded-xl bg-surface-3 hover:bg-surface border border-line text-xs font-semibold text-ink-dim hover:text-white transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-maize flex items-center justify-center text-maize-ink font-bold text-xs shadow">
                {currentRole === 'md' ? 'MD' : 'SM'}
              </div>
              <span className="hidden md:inline">{currentRole === 'md' ? 'Director Folake' : 'Manager Tunde'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-surface-3 border border-line rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
                <div className="px-3.5 py-2.5 border-b border-line mb-1">
                  <div className="text-[10px] text-ink-faint font-bold uppercase tracking-wider">Operational Identity</div>
                  <div className="font-bold text-xs text-ink mt-0.5">{currentRole === 'md' ? 'Folake Alabi (HQ)' : 'Tunde Akinola (Ibadan)'}</div>
                </div>
                <button 
                  onClick={() => handleRoleSwitch('md')}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    currentRole === 'md' ? 'bg-maize text-maize-ink' : 'text-ink-dim hover:bg-surface-2'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Managing Director</span>
                </button>
                <button 
                  onClick={() => handleRoleSwitch('site')}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    currentRole === 'site' ? 'bg-maize text-maize-ink' : 'text-ink-dim hover:bg-surface-2'
                  }`}
                >
                  <Warehouse className="w-4 h-4" />
                  <span>Site Manager</span>
                </button>
                <div className="h-px bg-line my-1" />
                <button 
                  onClick={() => { setIsProfileOpen(false); setActiveView('profile'); }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-ink-dim hover:bg-surface-2 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>System Settings</span>
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); setIsLoggedIn(false); }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger-dim/30 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Switch Role (Demo)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:flex flex-col justify-between w-60 bg-surface border-r border-line p-4 space-y-6">
          <div className="space-y-6">
            <div className="px-3">
              <span className="block text-[10px] font-bold text-ink-faint uppercase tracking-widest font-mono">Workspace Nav</span>
            </div>

            <nav className="space-y-1">
              {/* If MD role, let them access MD Dashboard */}
              {currentRole === 'md' && (
                <button 
                  onClick={() => setActiveView('md')}
                  data-active={activeView === 'md'}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-dim hover:text-white hover:bg-surface-2 transition-all group data-[active=true]:bg-maize data-[active=true]:text-maize-ink"
                >
                  <LayoutGrid className="w-4 h-4 group-hover:scale-105" />
                  <span>Executive Overview</span>
                </button>
              )}

              {/* If Site Manager role, let them access Site Dashboard */}
              {currentRole === 'site' && (
                <button 
                  onClick={() => setActiveView('site')}
                  data-active={activeView === 'site'}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-dim hover:text-white hover:bg-surface-2 transition-all group data-[active=true]:bg-maize data-[active=true]:text-maize-ink"
                >
                  <LayoutGrid className="w-4 h-4 group-hover:scale-105" />
                  <span>Silo Manager Panel</span>
                </button>
              )}

              {/* Central Inventory Dashboard (THE REQUESTED TAB!) */}
              <button 
                onClick={() => setActiveView('inventory')}
                data-active={activeView === 'inventory'}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-dim hover:text-white hover:bg-surface-2 transition-all group data-[active=true]:bg-maize data-[active=true]:text-maize-ink"
              >
                <Warehouse className="w-4 h-4 group-hover:scale-105" />
                <span>Inventory Tracking</span>
                {alerts.length > 0 && (
                  <span className="ml-auto w-2 h-2 bg-danger rounded-full animate-pulse" />
                )}
              </button>

              {/* Expenses View */}
              <button 
                onClick={() => setActiveView('expenses')}
                data-active={activeView === 'expenses'}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-dim hover:text-white hover:bg-surface-2 transition-all group data-[active=true]:bg-maize data-[active=true]:text-maize-ink"
              >
                <Receipt className="w-4 h-4 group-hover:scale-105" />
                <span>Expenses Ledger</span>
              </button>

              {/* Intelligence Reports */}
              <button 
                onClick={() => setActiveView('reports')}
                data-active={activeView === 'reports'}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-dim hover:text-white hover:bg-surface-2 transition-all group data-[active=true]:bg-maize data-[active=true]:text-maize-ink"
              >
                <FileText className="w-4 h-4 group-hover:scale-105" />
                <span>Reports & Ranks</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-line pt-4 space-y-3.5">
            <div className="flex items-center gap-2.5 px-3">
              <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center font-bold text-xs text-ink-dim border border-line">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-ink truncate">{currentRole === 'md' ? 'Folake Alabi' : 'Tunde Akinola'}</div>
                <div className="text-[10px] text-ink-faint uppercase font-bold tracking-wide mt-0.5">{currentRole === 'md' ? 'MD HQ' : 'Site Manager'}</div>
              </div>
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-ink-dim hover:text-white hover:bg-surface-2 border border-line-soft transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-danger" />
              <span>Switch role (demo)</span>
            </button>
          </div>
        </aside>

        {/* WORKSPACE CENTRAL STAGE */}
        <main className="flex-1 p-4 lg:p-7 max-w-7xl mx-auto w-full pb-20 lg:pb-7 overflow-y-auto">
          
          {/* MD EXECUTIVE VIEW */}
          {activeView === 'md' && (
            <MDDashboard 
              sites={sites} 
              items={items} 
              companyTarget={60000} 
              onSelectSite={handleSelectSite}
              onOpenAddSite={() => setIsAddSiteOpen(true)}
              onExportLeaderboardCSV={handleExportLeaderboardCSV}
              triggerToast={triggerToast}
            />
          )}

          {/* SITE MANAGER VIEW */}
          {activeView === 'site' && (
            <SiteDashboard 
              site={sites.find(s => s.siteId === selectedSiteId) || sites[0]}
              items={items}
              onOpenIntake={() => setIsAddStockOpen(true)}
              onOpenCollect={() => setIsCollectStockOpen(true)}
            />
          )}

          {/* INVENTORY TRACKING COMMAND VIEW (THE INTEGRATED INVENTORY TAB!) */}
          {activeView === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">Inventory Tracking Hub</h2>
                  <p className="text-xs text-ink-dim mt-0.5">Aggregate stock tracking, safety matrices, and transactional ledger logs.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsNewItemOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    <Sprout className="w-3.5 h-3.5 text-maize" />
                    <span>Catalog Material</span>
                  </button>
                  <button 
                    onClick={handleExportTxCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Dynamic KPI row of network inventory assets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-ink-faint text-[10px] font-bold uppercase tracking-wider">Global Inventory Valuation</span>
                  <span className="text-xl font-mono font-bold text-good mt-1">₦{totalValuation.toLocaleString()}</span>
                  <span className="text-[9px] text-ink-faint font-mono mt-1">Landed at cost indexes</span>
                </div>
                <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-ink-faint text-[10px] font-bold uppercase tracking-wider">Total Physical Network Tons</span>
                  <span className="text-xl font-mono font-bold text-ink mt-1">{totalNetworkTons.toFixed(1)} Metric Tons</span>
                  <span className="text-[9px] text-ink-faint font-mono mt-1">Sum across 4 silos</span>
                </div>
                <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-ink-faint text-[10px] font-bold uppercase tracking-wider">Silos Breaching Safety Limit</span>
                  <span className={`text-xl font-mono font-bold mt-1 ${alerts.length > 0 ? 'text-danger' : 'text-good'}`}>{alerts.length} Silo Alerts</span>
                  <span className="text-[9px] text-ink-faint font-mono mt-1">Breaches safety bounds</span>
                </div>
                <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-ink-faint text-[10px] font-bold uppercase tracking-wider">Catalogued Feed Ingredients</span>
                  <span className="text-xl font-mono font-bold text-ink mt-1">{items.length} Materials</span>
                  <span className="text-[9px] text-ink-faint font-mono mt-1">Global nutritional codes</span>
                </div>
              </div>

              {/* Split row: Alert Hub and Priority Checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Low stock alerts hub */}
                <div className="lg:col-span-2">
                  <AlertHub 
                    alerts={alerts} 
                    onResolve={handleResolveAlert} 
                    onNotify={handleNotifyManager} 
                  />
                </div>

                {/* 2. Priority restock order checklist */}
                <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-ink">HQ Procurement Checklist</h3>
                      <p className="text-xs text-ink-dim">Urgent steps to stabilize network stock depletion levels</p>
                    </div>

                    <div className="space-y-2">
                      {alerts.length === 0 ? (
                        <div className="border border-good/20 bg-good-dim/10 text-good p-4 rounded-xl text-center text-xs flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>All silos secure above limits!</span>
                        </div>
                      ) : (
                        alerts.map(a => (
                          <div key={a.id} className="flex items-start gap-2.5 p-2 bg-surface-2 border border-line rounded-xl text-xs">
                            <input 
                              type="checkbox" 
                              className="rounded text-maize focus:ring-maize mt-0.5"
                              onChange={() => handleResolveAlert(a.id)}
                            />
                            <div>
                              <span className="font-bold text-ink-dim block">Replenish {a.itemName} at {a.siteName}</span>
                              <span className="text-[10px] text-ink-faint font-mono">Current: {a.currentStock.toLocaleString()}kg vs Limit: {a.minThreshold.toLocaleString()}kg</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-ink-faint mt-4 font-mono">
                    Checkboxes auto-dispatch replenishment flows and update balances.
                  </div>
                </div>
              </div>

              {/* Cross-Site Stock Density Matrix */}
              <MultiSiteSiloMatrix 
                items={items} 
                siteInventories={sites} 
                onSelectSite={handleSelectSite}
              />

              {/* Real-Time Transaction Ledger */}
              <TransactionLedger 
                transactions={transactions} 
                onExportCSV={handleExportTxCSV} 
              />
            </div>
          )}

          {/* EXPENSES LEDGER VIEW */}
          {activeView === 'expenses' && (
            <ExpensesView 
              expenses={expenses}
              onUpdateExpenses={setExpenses}
              triggerToast={triggerToast}
              onExportExpensesCSV={handleExportExpensesCSV}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            />
          )}

          {/* REPORTS & INTEL VIEW */}
          {activeView === 'reports' && (
            <ReportsView 
              sites={sites}
              companyTarget={60000}
              onExportLeaderboardCSV={handleExportLeaderboardCSV}
              triggerToast={triggerToast}
            />
          )}

          {/* PROFILE & SYSTEM SETTINGS VIEW */}
          {activeView === 'profile' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">System Settings</h2>
                <p className="text-xs text-ink-dim mt-0.5">Control visual parameters, override operational credentials, and debug thresholds.</p>
              </div>

              <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg space-y-6">
                {/* 1. Theme and Role switcher */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-ink">Appearance & Identity Options</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Theme box */}
                    <div className="bg-surface-2 border border-line p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-ink">Dark appearance mode</span>
                        <span className="block text-[10px] text-ink-faint mt-0.5">Toggle interface aesthetics</span>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={`w-11 h-6 rounded-full transition-colors relative border ${
                          theme === 'dark' ? 'bg-maize border-maize' : 'bg-surface-3 border-line'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                          theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Role switcher box */}
                    <div className="bg-surface-2 border border-line p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-ink">Operating role switcher</span>
                        <span className="block text-[10px] text-ink-faint mt-0.5">HQ Director vs. Ibadan Manager</span>
                      </div>
                      <button 
                        onClick={() => handleRoleSwitch(currentRole === 'md' ? 'site' : 'md')}
                        className="px-3 py-1.5 bg-surface-3 hover:bg-surface border border-line rounded-lg text-[10px] font-bold uppercase tracking-wider text-ink-dim hover:text-white"
                      >
                        Swap
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Mock API Connection telemetry block */}
                <div className="space-y-3 pt-4 border-t border-line">
                  <h3 className="font-bold text-sm text-ink">Mock API Connection Limits</h3>
                  <div className="bg-surface-2 border border-line p-4 rounded-xl space-y-2.5">
                    <p className="text-xs text-ink-dim leading-relaxed">
                      The Mill Command Center is currently in <b>Prototype demonstration mode</b>. Data storage and synchronizations are managed on-device via standard <code>localStorage</code> buffers.
                    </p>
                    <div className="flex flex-wrap gap-2.5 pt-1.5">
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to clear local storage? This resets all stock updates and custom sites.')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="px-3.5 py-1.5 bg-danger-dim/30 hover:bg-danger text-danger hover:text-white border border-danger/20 rounded-xl text-xs font-bold transition-all"
                      >
                        Clear Storage & Reset Database
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION RAIL */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-2/95 border-t border-line p-2.5 flex justify-around items-center backdrop-blur-md">
        {/* If MD, show MD layout option. Else show site layout option */}
        {currentRole === 'md' ? (
          <button 
            onClick={() => setActiveView('md')}
            className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-all ${
              activeView === 'md' ? 'text-maize font-bold' : 'text-ink-faint'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Overview</span>
          </button>
        ) : (
          <button 
            onClick={() => setActiveView('site')}
            className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-all ${
              activeView === 'site' ? 'text-maize font-bold' : 'text-ink-faint'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>My Mill</span>
          </button>
        )}

        {/* Central Inventory Dashboard */}
        <button 
          onClick={() => setActiveView('inventory')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-all ${
            activeView === 'inventory' ? 'text-maize font-bold' : 'text-ink-faint'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Stocks</span>
        </button>

        {/* Expenses */}
        <button 
          onClick={() => setActiveView('expenses')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-all ${
            activeView === 'expenses' ? 'text-maize font-bold' : 'text-ink-faint'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses</span>
        </button>

        {/* Reports */}
        <button 
          onClick={() => setActiveView('reports')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-all ${
            activeView === 'reports' ? 'text-maize font-bold' : 'text-ink-faint'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </button>
      </nav>

      {/* 4. DIALOG MODAL CONTROLLER */}
      <Modals 
        items={items}
        sites={sites}
        selectedSiteId={selectedSiteId}
        triggerToast={triggerToast}

        isAddStockOpen={isAddStockOpen}
        onCloseAddStock={() => setIsAddStockOpen(false)}
        onAddStockSubmit={handleAddStockSubmit}

        isCollectStockOpen={isCollectStockOpen}
        onCloseCollectStock={() => setIsCollectStockOpen(false)}
        onCollectStockSubmit={handleCollectStockSubmit}

        isNewItemOpen={isNewItemOpen}
        onCloseNewItem={() => setIsNewItemOpen(false)}
        onNewItemSubmit={handleNewItemSubmit}

        isAddExpenseOpen={isAddExpenseOpen}
        onCloseAddExpense={() => setIsAddExpenseOpen(false)}
        onAddExpenseSubmit={handleAddExpenseSubmit}

        isAddProductionOpen={isAddProductionOpen}
        onCloseAddProduction={() => setIsAddProductionOpen(false)}
        onAddProductionSubmit={handleAddProductionSubmit}

        isAddSiteOpen={isAddSiteOpen}
        onCloseAddSite={() => setIsAddSiteOpen(false)}
        onAddSiteSubmit={handleAddSiteSubmit}
      />

      {/* 4.5 FLOATING SPEED DIAL QUICK ACTIONS BUTTON (FAB) */}
      {isLoggedIn && (
        <div className="fixed bottom-24 lg:bottom-8 right-6 z-50 flex flex-col items-end gap-3.5">
          {/* Backdrop Overlay when active */}
          {isFabOpen && (
            <div 
              onClick={() => setIsFabOpen(false)} 
              className="fixed inset-0 z-40 bg-[#0D0F0C]/60 backdrop-blur-sm cursor-pointer"
            />
          )}

          {/* Speed Dial Menu Items */}
          {isFabOpen && (
            <div className="flex flex-col items-end gap-2.5 z-50 animate-scale-in">
              {/* Log Expense Choice */}
              <button
                onClick={() => {
                  setIsAddExpenseOpen(true);
                  setIsFabOpen(false);
                }}
                className="flex items-center gap-3 bg-surface-3 border border-line hover:border-maize/50 hover:bg-surface-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all group cursor-pointer"
              >
                <span className="text-ink-dim group-hover:text-white transition-colors">Log expense</span>
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-maize group-hover:scale-105 transition-transform">
                  <Receipt className="w-4 h-4" />
                </div>
              </button>

              {/* Log Production Choice */}
              <button
                onClick={() => {
                  setIsAddProductionOpen(true);
                  setIsFabOpen(false);
                }}
                className="flex items-center gap-3 bg-surface-3 border border-line hover:border-maize/50 hover:bg-surface-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all group cursor-pointer"
              >
                <span className="text-ink-dim group-hover:text-white transition-colors">Log production</span>
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-maize group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
              </button>

              {/* Log Intake Choice */}
              <button
                onClick={() => {
                  setIsAddStockOpen(true);
                  setIsFabOpen(false);
                }}
                className="flex items-center gap-3 bg-surface-3 border border-line hover:border-maize/50 hover:bg-surface-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all group cursor-pointer"
              >
                <span className="text-ink-dim group-hover:text-white transition-colors">Log intake</span>
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-maize group-hover:scale-105 transition-transform">
                  <Warehouse className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {/* Main FAB Trigger Button */}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-50 cursor-pointer ${
              isFabOpen 
                ? 'bg-maize text-maize-ink rotate-45 scale-105' 
                : 'bg-maize text-maize-ink hover:scale-105 hover:rotate-90'
            }`}
          >
            {isFabOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </button>
        </div>
      )}

      {/* 5. FLOATING LIVE TOAST POPUPS NOTIFICATION HUD */}
      <div className="fixed bottom-20 lg:bottom-5 right-5 space-y-2.5 z-50 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const colors = 
            t.type === 'success' ? 'bg-good-dim/95 text-good border-good/20' : 
            t.type === 'warn' ? 'bg-warn-dim/95 text-warn border-warn/20' : 
            t.type === 'danger' ? 'bg-danger-dim/95 text-danger border-danger/20' : 
            'bg-surface-3/95 text-white border-line';

          return (
            <div 
              key={t.id}
              className={`p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 pointer-events-auto transition-transform animate-scale-in ${colors}`}
            >
              {t.type === 'success' && <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {t.type === 'warn' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {t.type === 'danger' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {t.type === 'info' && <Wifi className="w-4 h-4 mt-0.5 flex-shrink-0" />}

              <div className="text-xs">
                <strong className="block font-bold">{t.title}</strong>
                {t.desc && <span className="block mt-1 font-semibold opacity-90">{t.desc}</span>}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
