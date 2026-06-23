import React, { useState, useEffect } from 'react';
import {
  INITIAL_ITEMS,
  INITIAL_SITE_INVENTORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS
} from './data';
import { InventoryItem, SiteInventory, InventoryTransaction, LowStockAlert } from './types';
import { AlertHub } from './components/AlertHub';
import { MultiSiteSiloMatrix } from './components/MultiSiteSiloMatrix';
import { TransactionLedger } from './components/TransactionLedger';
import {
  AlertTriangle,
  Plus,
  Minus,
  Warehouse,
  Users,
  Layers,
  Sparkles,
  CheckCircle,
  Database,
  ArrowRight,
  TrendingDown,
  FileText,
  Mail,
  Coins,
  Search,
  ChevronDown,
  Activity,
  Globe,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  // --- STATE SYSTEM WITH MOCK API SYNC (LOCAL STORAGE) ---
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('benuli_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [siteInventories, setSiteInventories] = useState<SiteInventory[]>(() => {
    const saved = localStorage.getItem('benuli_site_inventories');
    return saved ? JSON.parse(saved) : INITIAL_SITE_INVENTORIES;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('benuli_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [alerts, setAlerts] = useState<LowStockAlert[]>(() => {
    const saved = localStorage.getItem('benuli_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('benuli_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('benuli_site_inventories', JSON.stringify(siteInventories));
  }, [siteInventories]);

  useEffect(() => {
    localStorage.setItem('benuli_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('benuli_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // --- VIEWPORT & INTERACTIVE NAVIGATION STATES ---
  const [currentRole, setCurrentRole] = useState<'md' | 'site'>('md');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-A');
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'ledger' | 'alerts' | 'items'>('overview');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Interactive Form States
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isCollectStockOpen, setIsCollectStockOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);

  // Form Inputs
  const [addForm, setAddForm] = useState({
    itemId: '',
    quantity: 5000,
    operator: '',
    notes: ''
  });

  const [collectForm, setCollectForm] = useState({
    itemId: '',
    quantity: 2000,
    operator: '',
    notes: ''
  });

  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Grain' as 'Grain' | 'Protein' | 'Fiber' | 'Additive' | 'Mineral',
    unit: 'kg' as 'kg' | 'tons',
    minThreshold: 5000,
    costPerKg: 300,
    weightPerBag: 50
  });

  // UI Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'warn' | 'danger' | 'info'; title: string; desc?: string } | null>(null);

  const triggerToast = (type: 'success' | 'warn' | 'danger' | 'info', title: string, desc?: string) => {
    setToast({ type, title, desc });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // --- DYNAMIC CALCULATIONS ---
  const selectedSite = siteInventories.find(s => s.siteId === selectedSiteId) || siteInventories[0];

  // Total investment value of aggregate inventories
  const totalNetworkStockValue = siteInventories.reduce((sum, site) => {
    return (sum as number) + Object.entries(site.stocks).reduce((siteSum, [itemId, qty]) => {
      const item = items.find(i => i.id === itemId);
      const cost = item ? item.costPerKg : 0;
      return (siteSum as number) + ((qty as number) * cost);
    }, 0);
  }, 0);

  // Total stock tonnage across network
  const totalNetworkStockKg = siteInventories.reduce((sum, site) => {
    return (sum as number) + (Object.values(site.stocks) as number[]).reduce((a, b) => a + b, 0);
  }, 0);

  // Number of active alerts across the network
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;

  // --- HANDLERS: ADD STOCK (INTAKE) ---
  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { itemId, quantity, operator, notes } = addForm;
    if (!itemId || !quantity || !operator) {
      triggerToast('danger', 'Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // 1. Update stock count in target site
    setSiteInventories(prev =>
      prev.map(site => {
        if (site.siteId === selectedSiteId) {
          const currentStock = site.stocks[itemId] || 0;
          return {
            ...site,
            stocks: {
              ...site.stocks,
              [itemId]: currentStock + Number(quantity)
            }
          };
        }
        return site;
      })
    );

    // 2. Generate transaction record
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      siteId: selectedSiteId,
      siteName: selectedSite.siteName,
      itemId,
      itemName: item.name,
      type: 'add',
      quantity: Number(quantity),
      timestamp: new Date().toISOString(),
      operator,
      notes: notes || `Restocked ${Number(quantity).toLocaleString()} kg of ${item.name}`,
      cost: Number(quantity) * item.costPerKg
    };
    setTransactions(prev => [newTx, ...prev]);

    // 3. Resolve any active low stock alerts for this item at this site
    setAlerts(prev =>
      prev.map(alert => {
        if (alert.siteId === selectedSiteId && alert.itemId === itemId && alert.status === 'active') {
          return {
            ...alert,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            currentStock: alert.currentStock + Number(quantity)
          };
        }
        return alert;
      })
    );

    setIsAddStockOpen(false);
    triggerToast(
      'success',
      'Stock Refreshed Successfully',
      `Added ${Number(quantity).toLocaleString()} kg of ${item.name} to ${selectedSite.siteName}`
    );

    // Reset Form
    setAddForm({ itemId: '', quantity: 5000, operator: '', notes: '' });
  };

  // --- HANDLERS: CONSUME STOCK (COLLECTION) ---
  const handleCollectStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { itemId, quantity, operator, notes } = collectForm;
    if (!itemId || !quantity || !operator) {
      triggerToast('danger', 'Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const currentQty = selectedSite.stocks[itemId] || 0;
    if (Number(quantity) > currentQty) {
      triggerToast(
        'danger',
        'Insufficient Inventory',
        `Cannot collect ${Number(quantity).toLocaleString()} kg. Current balance is only ${currentQty.toLocaleString()} kg.`
      );
      return;
    }

    const newQty = currentQty - Number(quantity);

    // 1. Update stock count in target site
    setSiteInventories(prev =>
      prev.map(site => {
        if (site.siteId === selectedSiteId) {
          return {
            ...site,
            stocks: {
              ...site.stocks,
              [itemId]: newQty
            }
          };
        }
        return site;
      })
    );

    // 2. Generate transaction record
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      siteId: selectedSiteId,
      siteName: selectedSite.siteName,
      itemId,
      itemName: item.name,
      type: 'collect',
      quantity: Number(quantity),
      timestamp: new Date().toISOString(),
      operator,
      notes: notes || `Formulation depletion of ${Number(quantity).toLocaleString()} kg of ${item.name}`,
      cost: Number(quantity) * item.costPerKg
    };
    setTransactions(prev => [newTx, ...prev]);

    // 3. Evaluate if stock fell below safety threshold. Trigger Low-Stock Alert if so!
    if (newQty < item.minThreshold) {
      // Check if an active alert already exists for this site/item
      const existingActiveAlert = alerts.find(
        a => a.siteId === selectedSiteId && a.itemId === itemId && a.status === 'active'
      );

      if (!existingActiveAlert) {
        const newAlert: LowStockAlert = {
          id: `alt-${Date.now()}`,
          siteId: selectedSiteId,
          siteName: selectedSite.siteName,
          itemId,
          itemName: item.name,
          currentStock: newQty,
          minThreshold: item.minThreshold,
          timestamp: new Date().toISOString(),
          status: 'active'
        };

        setAlerts(prev => [newAlert, ...prev]);

        // Simulating the direct automated notification to the site manager
        triggerToast(
          'warn',
          `🚨 Low Stock Alert Triggered!`,
          `Alert sent to ${selectedSite.manager} (${item.name} under threshold at ${selectedSite.siteName}).`
        );
      } else {
        // Update current stock in the existing alert
        setAlerts(prev =>
          prev.map(a =>
            a.id === existingActiveAlert.id ? { ...a, currentStock: newQty } : a
          )
        );
        triggerToast(
          'warn',
          'Silo Level Critical',
          `Silo level for ${item.name} dropped further to ${newQty.toLocaleString()} kg.`
        );
      }
    } else {
      triggerToast(
        'success',
        'Stock Collected',
        `Dispatched ${Number(quantity).toLocaleString()} kg of ${item.name} at ${selectedSite.siteName}.`
      );
    }

    setIsCollectStockOpen(false);
    setCollectForm({ itemId: '', quantity: 2000, operator: '', notes: '' });
  };

  // --- HANDLERS: ADD NEW INGREDIENT ITEM TO CATALOG ---
  const handleNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, category, unit, minThreshold, costPerKg, weightPerBag } = newItemForm;
    if (!name || !minThreshold || !costPerKg) {
      triggerToast('danger', 'Incomplete Form', 'Please provide item name, threshold, and cost.');
      return;
    }

    const newId = `item-${Date.now()}`;
    const newItem: InventoryItem = {
      id: newId,
      name,
      category,
      unit,
      minThreshold: Number(minThreshold),
      costPerKg: Number(costPerKg),
      weightPerBag: Number(weightPerBag)
    };

    // Add item to global catalogue
    setItems(prev => [...prev, newItem]);

    // Initialise 0kg stock across all existing terminals
    setSiteInventories(prev =>
      prev.map(site => ({
        ...site,
        stocks: {
          ...site.stocks,
          [newId]: 0
        }
      }))
    );

    // Initialise an immediate low-stock alert since initial balance is 0kg which is < minThreshold
    const newAlerts: LowStockAlert[] = siteInventories.map((site, index) => ({
      id: `alt-${Date.now()}-${index}`,
      siteId: site.siteId,
      siteName: site.siteName,
      itemId: newId,
      itemName: name,
      currentStock: 0,
      minThreshold: Number(minThreshold),
      timestamp: new Date().toISOString(),
      status: 'active'
    }));

    setAlerts(prev => [...newAlerts, ...prev]);

    setIsNewItemOpen(false);
    triggerToast(
      'success',
      'Catalogue Updated',
      `Registered "${name}" (${category}) as a brand new ingredient across all site silos.`
    );

    setNewItemForm({
      name: '',
      category: 'Grain',
      unit: 'kg',
      minThreshold: 5000,
      costPerKg: 300,
      weightPerBag: 50
    });
  };

  // --- HANDLER: QUICK ALERT RESTOCK ---
  const handleQuickAlertRestock = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const item = items.find(i => i.id === alert.itemId);
    if (!item) return;

    // Standard restock amounts: Deficit + 5000kg buffer to bring fully back to safe zone
    const deficit = alert.minThreshold - alert.currentStock;
    const restockQty = Math.ceil((deficit + 5000) / 1000) * 1000;

    // 1. Update stock levels
    setSiteInventories(prev =>
      prev.map(site => {
        if (site.siteId === alert.siteId) {
          const prevStock = site.stocks[alert.itemId] || 0;
          return {
            ...site,
            stocks: {
              ...site.stocks,
              [alert.itemId]: prevStock + restockQty
            }
          };
        }
        return site;
      })
    );

    // 2. Mark alert as resolved
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString(), currentStock: a.currentStock + restockQty }
          : a
      )
    );

    // 3. Create ledger audit line
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      siteId: alert.siteId,
      siteName: alert.siteName,
      itemId: alert.itemId,
      itemName: alert.itemName,
      type: 'add',
      quantity: restockQty,
      timestamp: new Date().toISOString(),
      operator: 'Central Procurement Office',
      notes: `Automated threshold resolution purchase - added safety buffer.`,
      cost: restockQty * item.costPerKg
    };
    setTransactions(prev => [newTx, ...prev]);

    triggerToast(
      'success',
      'Urgent Supply Ordered',
      `Dispatched ${restockQty.toLocaleString()} kg of ${alert.itemName} to ${alert.siteName}.`
    );
  };

  // --- HANDLER: EMAIL NOTIFICATION DISPATCH ---
  const handleNotifyManager = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    const targetSite = siteInventories.find(s => s.siteId === alert.siteId);
    if (!targetSite) return;

    triggerToast(
      'info',
      'Email Dispatch Confirmed',
      `Stock alert notice successfully delivered to ${targetSite.manager} at ${targetSite.managerEmail}`
    );
  };

  // --- HANDLER: EXPORT AS CSV ---
  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Terminal,Ingredient,Type,Quantity (kg),Unit Cost (Naira),Total Value (Naira),Operator,Notes\n';
    const rows = transactions.map(tx => {
      const item = items.find(i => i.id === tx.itemId);
      const unitCost = item ? item.costPerKg : 0;
      return `"${tx.id}","${tx.timestamp}","${tx.siteName}","${tx.itemName}","${tx.type}",${tx.quantity},${unitCost},${tx.cost},"${tx.operator}","${(tx.notes || '').replace(/"/g, '""')}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benuli_farms_inventory_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('success', 'Ledger Export Completed', 'benuli_farms_inventory_ledger.csv has been saved.');
  };

  const handleGlobalCleanReset = () => {
    if (confirm('Are you sure you want to restore default demo database inventory and alerts?')) {
      localStorage.removeItem('benuli_items');
      localStorage.removeItem('benuli_site_inventories');
      localStorage.removeItem('benuli_transactions');
      localStorage.removeItem('benuli_alerts');
      setItems(INITIAL_ITEMS);
      setSiteInventories(INITIAL_SITE_INVENTORIES);
      setTransactions(INITIAL_TRANSACTIONS);
      setAlerts(INITIAL_ALERTS);
      triggerToast('info', 'Database Reset', 'Restored initial clean demo metrics.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-maize selection:text-maize-ink font-sans transition-colors duration-300">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-bg-soft/95 backdrop-blur-md border-b border-line px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-maize text-maize-ink p-2 rounded-xl shadow-inner flex items-center justify-center">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight text-ink uppercase">Benuli Farms</h1>
              <span className="text-[10px] bg-surface-3 text-maize px-2 py-0.5 rounded border border-line font-mono font-bold">
                MILL INVENTORY
              </span>
            </div>
            <p className="text-xs text-ink-dim hidden sm:block">Multi-terminal ingredient logistics & safety warning system</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Stats Banner */}
          <div className="hidden md:flex items-center gap-5 bg-surface-2 border border-line rounded-xl px-4 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-good" />
              <span className="text-ink-dim font-medium">Network Stock:</span>
              <span className="font-mono font-bold text-white">{(totalNetworkStockKg / 1000).toFixed(1)} tons</span>
            </div>
            <div className="w-px h-4 bg-line" />
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeAlertsCount > 0 ? 'bg-danger animate-ping' : 'bg-good'}`} />
              <span className="text-ink-dim font-medium">Safe Margins:</span>
              <span className="font-mono font-bold text-white">
                {activeAlertsCount === 0 ? 'All Normal' : `${activeAlertsCount} Low Stock`}
              </span>
            </div>
          </div>

          {/* Clean State Reset */}
          <button
            onClick={handleGlobalCleanReset}
            className="p-2 bg-surface-2 hover:bg-surface-3 text-ink-dim hover:text-ink rounded-lg border border-line text-xs font-semibold flex items-center gap-1 transition-all"
            title="Reset to default clean data"
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Reset DB</span>
          </button>

          {/* Toggle Role Select */}
          <div className="flex bg-surface-2 border border-line rounded-xl p-1 shadow-inner">
            <button
              onClick={() => {
                setCurrentRole('md');
                setActiveTab('overview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'md'
                  ? 'bg-maize text-maize-ink shadow-md'
                  : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>MD Board</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('site');
                setActiveTab('overview');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'site'
                  ? 'bg-maize text-maize-ink shadow-md'
                  : 'text-ink-dim hover:text-ink'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Site Manager</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm w-full">
          <div className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 bg-surface border-line`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              toast.type === 'success' ? 'bg-good/15 text-good' :
              toast.type === 'warn' ? 'bg-warn/15 text-warn' :
              toast.type === 'danger' ? 'bg-danger/15 text-danger' : 'bg-maize/15 text-maize'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink">{toast.title}</h4>
              {toast.desc && <p className="text-xs text-ink-dim mt-1">{toast.desc}</p>}
            </div>
          </div>
        </div>
      )}

      {/* SUB-HEADER TERMINAL CHANGER (Visible in Site Manager Mode) */}
      {currentRole === 'site' && (
        <div className="bg-surface-2 border-b border-line px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-dim font-bold uppercase tracking-wider">Active Terminal:</span>
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="bg-surface-3 text-sm text-maize font-bold border border-line rounded-lg px-3 py-1.5 pr-8 outline-none appearance-none cursor-pointer focus:border-maize transition-all"
              >
                {siteInventories.map(s => (
                  <option key={s.siteId} value={s.siteId}>
                    {s.siteName} — {s.manager}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCollectStockOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-husk/10 text-husk border border-husk/25 hover:bg-husk/20 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Minus className="w-4 h-4" />
              <span>Collect Raw Feedstock</span>
            </button>
            <button
              onClick={() => setIsAddStockOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-good/10 text-good border border-good/25 hover:bg-good/20 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Intake Delivery</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">

        {/* GLOBAL TITLE SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-2/40 border border-line/50 p-6 rounded-2xl">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              {currentRole === 'md' ? 'Central Logistics Command' : `${selectedSite.siteName} Operational Silos`}
            </h2>
            <p className="text-sm text-ink-dim">
              {currentRole === 'md'
                ? 'Aggregate overview of safety buffers across Ibadan, Kano, Aba, and Kaduna terminals'
                : `Active ingredient tracking, mixing logs, and low-stock indicators managed by ${selectedSite.manager}`}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'overview'
                  ? 'bg-maize/10 text-maize border-maize'
                  : 'bg-surface hover:bg-surface-2 text-ink-dim border-line'
              }`}
            >
              Executive Overview
            </button>
            {currentRole === 'md' && (
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  activeTab === 'matrix'
                    ? 'bg-maize/10 text-maize border-maize'
                    : 'bg-surface hover:bg-surface-2 text-ink-dim border-line'
                }`}
              >
                Logistics Matrix
              </button>
            )}
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'ledger'
                  ? 'bg-maize/10 text-maize border-maize'
                  : 'bg-surface hover:bg-surface-2 text-ink-dim border-line'
              }`}
            >
              Logistics Ledger
            </button>
            <button
              onClick={() => setIsNewItemOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-surface-3 hover:bg-line text-ink hover:text-white rounded-xl border border-line transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catalog New Feed</span>
            </button>
          </div>
        </div>

        {/* ----------------- EXECUTIVE OVERVIEW (MD ROLE) ----------------- */}
        {currentRole === 'md' && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface border border-line p-5 rounded-2xl shadow-md">
                <div className="flex items-center justify-between text-ink-faint text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Aggregate Asset Valuation</span>
                  <Coins className="w-4 h-4 text-maize" />
                </div>
                <div className="text-2xl font-mono font-bold text-ink">
                  ₦{totalNetworkStockValue.toLocaleString()}
                </div>
                <div className="text-[10px] text-good font-semibold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-good" /> Real-time weighted market cost
                </div>
              </div>

              <div className="bg-surface border border-line p-5 rounded-2xl shadow-md">
                <div className="flex items-center justify-between text-ink-faint text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Gross Active Stockpile</span>
                  <Layers className="w-4 h-4 text-teal" />
                </div>
                <div className="text-2xl font-mono font-bold text-ink">
                  {totalNetworkStockKg.toLocaleString()} kg
                </div>
                <div className="text-[10px] text-ink-dim mt-1">
                  ~{(totalNetworkStockKg / 1000).toFixed(1)} tons stored across 4 terminals
                </div>
              </div>

              <div className="bg-surface border border-line p-5 rounded-2xl shadow-md">
                <div className="flex items-center justify-between text-ink-faint text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Silo Alerts Raised</span>
                  <AlertTriangle className={`w-4 h-4 ${activeAlertsCount > 0 ? 'text-danger animate-bounce' : 'text-good'}`} />
                </div>
                <div className={`text-2xl font-mono font-bold ${activeAlertsCount > 0 ? 'text-danger' : 'text-good'}`}>
                  {activeAlertsCount} active
                </div>
                <div className="text-[10px] text-ink-dim mt-1">
                  Requires immediate purchase resolution
                </div>
              </div>

              <div className="bg-surface border border-line p-5 rounded-2xl shadow-md">
                <div className="flex items-center justify-between text-ink-faint text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Total Catalogue Items</span>
                  <Database className="w-4 h-4 text-violet" />
                </div>
                <div className="text-2xl font-mono font-bold text-ink">
                  {items.length} materials
                </div>
                <div className="text-[10px] text-ink-dim mt-1">
                  Formulation inputs mapped across network
                </div>
              </div>
            </div>

            {/* Main MD Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1 & 2: Alert Hub & Quick Stock Density Matrix Preview */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Alert Hub Container */}
                <AlertHub
                  alerts={alerts}
                  onResolve={handleQuickAlertRestock}
                  onNotify={handleNotifyManager}
                />

                {/* Shortened Grid Matrix Preview */}
                <MultiSiteSiloMatrix
                  items={items}
                  siteInventories={siteInventories}
                  onSelectSite={(siteId) => {
                    setSelectedSiteId(siteId);
                    setCurrentRole('site');
                    setActiveTab('overview');
                  }}
                />
              </div>

              {/* Column 3: Logistics Analytics Split & Network Summary */}
              <div className="space-y-6">
                
                {/* Category composition chart */}
                <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
                  <h3 className="font-bold text-base text-ink mb-1">Global Inventory Allocation</h3>
                  <p className="text-xs text-ink-dim mb-4">Weight ratio by ingredient nutritional category</p>
                  
                  {/* Compute ratios */}
                  {(() => {
                    const categoryWeights: { [key: string]: number } = {
                      Grain: 0,
                      Protein: 0,
                      Fiber: 0,
                      Additive: 0,
                      Mineral: 0
                    };
                    
                    siteInventories.forEach(site => {
                      Object.entries(site.stocks).forEach(([itemId, qty]) => {
                        const item = items.find(i => i.id === itemId);
                        if (item) {
                          categoryWeights[item.category] += qty as number;
                        }
                      });
                    });

                    const totalSum = (Object.values(categoryWeights) as number[]).reduce((a, b) => a + b, 0) || 1;
                    const colors = {
                      Grain: 'bg-maize',
                      Protein: 'bg-husk',
                      Fiber: 'bg-teal',
                      Additive: 'bg-violet',
                      Mineral: 'bg-ink-faint'
                    };

                    return (
                      <div className="space-y-4">
                        {/* Visual stacked bar */}
                        <div className="h-6 w-full rounded-full overflow-hidden flex bg-surface-3">
                          {Object.entries(categoryWeights).map(([cat, val]) => {
                            const pct = (val / totalSum) * 100;
                            if (pct === 0) return null;
                            return (
                              <div
                                key={cat}
                                className={`${colors[cat as keyof typeof colors]} h-full transition-all`}
                                style={{ width: `${pct}%` }}
                                title={`${cat}: ${pct.toFixed(1)}%`}
                              />
                            );
                          })}
                        </div>

                        {/* Chart Legend with weights */}
                        <div className="space-y-2.5 pt-2">
                          {Object.entries(categoryWeights).map(([cat, val]) => {
                            const pct = (val / totalSum) * 100;
                            return (
                              <div key={cat} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded ${colors[cat as keyof typeof colors]}`} />
                                  <span className="text-ink font-medium">{cat}s</span>
                                </div>
                                <div className="text-right font-mono text-ink-dim">
                                  <span className="font-bold text-ink">{val.toLocaleString()} kg</span>
                                  <span className="text-[10px] text-ink-faint ml-1.5">({pct.toFixed(0)}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Restocking Priority Checklist */}
                <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-danger animate-pulse" />
                    <h3 className="font-bold text-base text-ink">Urgent Restocking Priority</h3>
                  </div>
                  <p className="text-xs text-ink-dim mb-4">
                    List of stock items below threshold sorted by absolute deficit weight
                  </p>

                  {(() => {
                    const activeAlerts = alerts.filter(a => a.status === 'active');
                    const sortedPriorities = activeAlerts
                      .map(alert => {
                        const deficit = alert.minThreshold - alert.currentStock;
                        return { ...alert, deficit };
                      })
                      .sort((a, b) => b.deficit - a.deficit);

                    if (sortedPriorities.length === 0) {
                      return (
                        <div className="text-center py-6 text-xs text-ink-faint border border-line rounded-xl bg-surface-2">
                          No outstanding deficits reported.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {sortedPriorities.slice(0, 4).map(p => (
                          <div key={p.id} className="p-3 bg-surface-2 rounded-xl border border-line flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-xs text-ink">{p.itemName}</div>
                              <div className="text-[10px] text-ink-faint font-mono mt-0.5">{p.siteName}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-xs font-bold text-danger">-{p.deficit.toLocaleString()} kg</div>
                              <button
                                onClick={() => handleQuickAlertRestock(p.id)}
                                className="text-[10px] text-maize hover:underline font-bold mt-0.5"
                              >
                                Quick Order &rarr;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ----------------- MATRIX VIEW (MD ROLE ONLY) ----------------- */}
        {currentRole === 'md' && activeTab === 'matrix' && (
          <MultiSiteSiloMatrix
            items={items}
            siteInventories={siteInventories}
            onSelectSite={(siteId) => {
              setSelectedSiteId(siteId);
              setCurrentRole('site');
              setActiveTab('overview');
            }}
          />
        )}

        {/* ----------------- SITE MANAGER DASHBOARD VIEW ----------------- */}
        {currentRole === 'site' && activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Low stock alerts raised at this specific site */}
            {(() => {
              const localActiveAlerts = alerts.filter(a => a.siteId === selectedSiteId && a.status === 'active');
              if (localActiveAlerts.length === 0) return null;
              
              return (
                <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-danger/20 text-danger p-2 rounded-xl mt-0.5 flex-shrink-0 animate-pulse">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink">Low Stock Warning Raised</h4>
                      <p className="text-xs text-ink-dim max-w-xl mt-0.5">
                        {localActiveAlerts.length} ingredient feedstocks are currently below minimum operations thresholds at this mill. 
                        Procurement department has been pinged, but you can resolve locally immediately.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        localActiveAlerts.forEach(a => handleQuickAlertRestock(a.id));
                      }}
                      className="px-3.5 py-2 bg-danger text-white hover:bg-opacity-90 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Quick restock</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Individual Silo Tracker Progress Bars */}
            <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-maize" />
                  <div>
                    <h3 className="font-bold text-base text-ink">Physical Silo Monitor</h3>
                    <p className="text-xs text-ink-dim">Volume and percent remaining relative to safety line</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCollectStockOpen(true)}
                    className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white text-ink text-xs font-semibold rounded-lg transition-all"
                  >
                    Consume from Stock
                  </button>
                  <button
                    onClick={() => setIsAddStockOpen(true)}
                    className="px-3 py-1.5 bg-maize text-maize-ink hover:bg-opacity-90 text-xs font-bold rounded-lg transition-all"
                  >
                    Log Supply Intake
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map(item => {
                  const currentStock = selectedSite.stocks[item.id] || 0;
                  const isLow = currentStock < item.minThreshold;
                  
                  // Compute safety scale percentage
                  const limit = item.minThreshold * 2; // scale representation bar up to 200% threshold
                  const percentage = Math.min(100, Math.round((currentStock / limit) * 100));
                  const thresholdMarker = Math.round((item.minThreshold / limit) * 100);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isLow
                          ? 'bg-danger/5 border-danger/20 hover:border-danger/40 shadow-inner'
                          : 'bg-surface-2 border-line hover:border-line-soft'
                      }`}
                    >
                      {/* Silo Top Metadata */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-ink-faint">
                            {item.category} Input
                          </span>
                          <h4 className="font-bold text-sm text-ink">{item.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-bold text-base ${isLow ? 'text-danger' : 'text-good'}`}>
                            {currentStock.toLocaleString()} kg
                          </div>
                          <div className="text-[10px] text-ink-faint">
                            Threshold: {item.minThreshold.toLocaleString()} kg
                          </div>
                        </div>
                      </div>

                      {/* Bar Visualization */}
                      <div className="relative h-4 w-full bg-surface-3 rounded-md overflow-hidden border border-line">
                        {/* Threshold mark line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-warn-dim border-l border-dashed border-warn z-10"
                          style={{ left: `${thresholdMarker}%` }}
                          title="Safety Line"
                        />
                        {/* Actual stock bar fill */}
                        <div
                          className={`h-full rounded-l-sm transition-all duration-700 ${
                            isLow ? 'bg-danger animate-pulse' : 'bg-good'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Silo Footer Status */}
                      <div className="flex items-center justify-between text-[10px] mt-2 font-mono">
                        <span className="text-ink-faint">Safety Level: {Math.round(currentStock / item.minThreshold * 100)}%</span>
                        {isLow ? (
                          <span className="text-danger font-bold uppercase animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> RESTOCK IMMEDIATELY
                          </span>
                        ) : (
                          <span className="text-good font-bold uppercase">
                            ✓ Silo Healthy
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Site Specific Charts / Logs split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Site Alert Center */}
              <div className="lg:col-span-2">
                <AlertHub
                  alerts={alerts.filter(a => a.siteId === selectedSiteId)}
                  onResolve={handleQuickAlertRestock}
                  onNotify={handleNotifyManager}
                />
              </div>

              {/* Terminal Inventory Metrics Card */}
              <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-ink mb-1">Terminal Statistics</h3>
                  <p className="text-xs text-ink-dim mb-4">Operations ratios for {selectedSite.siteName}</p>

                  {(() => {
                    const localTotalStock = (Object.values(selectedSite.stocks) as number[]).reduce((a, b) => a + b, 0);
                    const localLowCount = Object.entries(selectedSite.stocks).filter(([itemId, qty]) => {
                      const item = items.find(i => i.id === itemId);
                      return item ? (qty as number) < item.minThreshold : false;
                    }).length;

                    return (
                      <div className="space-y-4 font-mono text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-line">
                          <span className="text-ink-faint">Mill Operator:</span>
                          <span className="font-semibold text-ink">{selectedSite.manager}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-line">
                          <span className="text-ink-faint">Operational Capacity:</span>
                          <span className="font-semibold text-ink">{((localTotalStock as number) / 1000).toFixed(1)} / 50.0 tons</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-line">
                          <span className="text-ink-faint">Critical Alerts Active:</span>
                          <span className={`font-semibold ${localLowCount > 0 ? 'text-danger' : 'text-good'}`}>
                            {localLowCount} silobins
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-ink-faint">Inflow Value:</span>
                          <span className="font-semibold text-ink">
                            ₦{Object.entries(selectedSite.stocks).reduce((sum, [id, val]) => {
                              const it = items.find(x => x.id === id);
                              return (sum as number) + ((val as number) * (it ? it.costPerKg : 0));
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-6 pt-4 border-t border-line text-[11px] text-ink-faint italic leading-relaxed flex items-start gap-1.5">
                  <Activity className="w-4 h-4 text-maize flex-shrink-0 mt-0.5" />
                  <span>Silo logs sync dynamically to local database files. Additions instantly cancel alert dispatch events.</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- AUDITABLE LEDGER VIEW ----------------- */}
        {activeTab === 'ledger' && (
          <TransactionLedger
            transactions={transactions}
            onExportCSV={handleExportCSV}
          />
        )}

      </main>

      {/* ==================== DIALOG MODALS ==================== */}

      {/* 1. ADD STOCK DIALOG (INTAKE) */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <h3 className="font-bold text-lg text-ink mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-good" />
              <span>Log Raw Ingredient Intake</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Increase stockpile balance following supplier deliveries</p>

            <form onSubmit={handleAddStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Target Material
                </label>
                <select
                  value={addForm.itemId}
                  onChange={(e) => setAddForm(prev => ({ ...prev, itemId: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none"
                >
                  <option value="">Select ingredient...</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Unit cost: ₦{i.costPerKg}/kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Supplied Quantity (kg)
                </label>
                <input
                  type="number"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  required
                  min="1"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:border-maize outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Receiving Manager Signature
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tunde Akinola"
                  value={addForm.operator}
                  onChange={(e) => setAddForm(prev => ({ ...prev, operator: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Delivery Notes / Supplier Details
                </label>
                <textarea
                  placeholder="e.g. Purchased from Premier Feeds Ltd. Invoice ID #PF-90412"
                  value={addForm.notes}
                  onChange={(e) => setAddForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none h-20 resize-none"
                />
              </div>

              {/* Dynamic Value Calculation Indicator */}
              {addForm.itemId && addForm.quantity > 0 && (
                <div className="bg-surface-2 border border-line rounded-xl p-3 text-xs font-mono flex justify-between">
                  <span className="text-ink-faint">Est. Cost value:</span>
                  <span className="font-bold text-good">
                    ₦{(addForm.quantity * (items.find(i => i.id === addForm.itemId)?.costPerKg || 0)).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="flex-1 py-2.5 border border-line bg-surface-2 hover:bg-surface-3 rounded-xl text-xs font-semibold text-ink-dim transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-good text-white hover:bg-opacity-90 rounded-xl text-xs font-bold transition-all"
                >
                  Submit Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. COLLECT STOCK DIALOG (CONSUMPTION) */}
      {isCollectStockOpen && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <h3 className="font-bold text-lg text-ink mb-1 flex items-center gap-2">
              <Minus className="w-5 h-5 text-husk" />
              <span>Log Ingredient Dispatch Consumption</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Deduct feedstock quantities deployed for feed mixing batches</p>

            <form onSubmit={handleCollectStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Source Material
                </label>
                <select
                  value={collectForm.itemId}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, itemId: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none"
                >
                  <option value="">Select ingredient...</option>
                  {items.map(i => {
                    const stock = selectedSite.stocks[i.id] || 0;
                    return (
                      <option key={i.id} value={i.id}>
                        {i.name} ({stock.toLocaleString()} kg available)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Quantity Collected (kg)
                </label>
                <input
                  type="number"
                  value={collectForm.quantity}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  required
                  min="1"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:border-maize outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Mixing Operator Signature
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tunde Akinola"
                  value={collectForm.operator}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, operator: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Operational / Formulation Notes
                </label>
                <textarea
                  placeholder="e.g. Deployed for Layer Mash Batch formulation series #409"
                  value={collectForm.notes}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none h-20 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectStockOpen(false)}
                  className="flex-1 py-2.5 border border-line bg-surface-2 hover:bg-surface-3 rounded-xl text-xs font-semibold text-ink-dim transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-husk text-white hover:bg-opacity-90 rounded-xl text-xs font-bold transition-all"
                >
                  Submit Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW CATALOG ITEM DIALOG */}
      {isNewItemOpen && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <h3 className="font-bold text-lg text-ink mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-maize" />
              <span>Catalog New Feed Material</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Add a new compound ingredient category to the global mill index</p>

            <form onSubmit={handleNewItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                  Material Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fish Meal"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                    Nutritional Category
                  </label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-xs text-ink focus:border-maize outline-none"
                  >
                    <option value="Grain">Grain (Energy)</option>
                    <option value="Protein">Protein (Growth)</option>
                    <option value="Fiber">Fiber (Digestion)</option>
                    <option value="Additive">Additive (Health)</option>
                    <option value="Mineral">Mineral (Strength)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                    Safety Threshold (kg)
                  </label>
                  <input
                    type="number"
                    value={newItemForm.minThreshold}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, minThreshold: Number(e.target.value) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:border-maize outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                    Standard Cost (₦/kg)
                  </label>
                  <input
                    type="number"
                    value={newItemForm.costPerKg}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, costPerKg: Number(e.target.value) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:border-maize outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                    Standard Bag Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={newItemForm.weightPerBag}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, weightPerBag: Number(e.target.value) }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:border-maize outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemOpen(false)}
                  className="flex-1 py-2.5 border border-line bg-surface-2 hover:bg-surface-3 rounded-xl text-xs font-semibold text-ink-dim transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-maize text-maize-ink hover:bg-opacity-90 rounded-xl text-xs font-bold transition-all"
                >
                  Create Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
