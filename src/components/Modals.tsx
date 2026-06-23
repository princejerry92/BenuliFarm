import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, X, Sprout, Layers, Coins, ClipboardList, 
  Target, AlertTriangle, ChevronDown, Check, UploadCloud
} from 'lucide-react';
import { InventoryItem } from '../types';
import { Site, Expense } from '../data';

interface ModalsProps {
  items: InventoryItem[];
  sites: Site[];
  selectedSiteId: string;
  triggerToast: (type: 'success' | 'warn' | 'danger' | 'info', title: string, desc?: string) => void;

  // Add Stock (Intake) Modal
  isAddStockOpen: boolean;
  onCloseAddStock: () => void;
  onAddStockSubmit: (
    itemId: string, 
    quantity: number, 
    operator: string, 
    notes: string,
    supplier?: string,
    unitCost?: number,
    damaged?: number,
    transport?: number,
    invoice?: string
  ) => void;

  // Collect Stock (Consumption) Modal
  isCollectStockOpen: boolean;
  onCloseCollectStock: () => void;
  onCollectStockSubmit: (itemId: string, quantity: number, operator: string, notes: string) => void;

  // New Catalog Item Modal
  isNewItemOpen: boolean;
  onCloseNewItem: () => void;
  onNewItemSubmit: (name: string, category: 'Grain' | 'Protein' | 'Fiber' | 'Additive' | 'Mineral', unit: 'kg' | 'tons', minThreshold: number, costPerKg: number, weightPerBag: number) => void;

  // Add Expense Modal
  isAddExpenseOpen: boolean;
  onCloseAddExpense: () => void;
  onAddExpenseSubmit: (dept: string, desc: string, supplier: string, amount: number, receipt: boolean) => void;

  // Add Production Batch Modal
  isAddProductionOpen: boolean;
  onCloseAddProduction: () => void;
  onAddProductionSubmit: (qty: number, damaged: number, cost: number, product: string, bagWeight?: number) => void;

  // Add Site Modal
  isAddSiteOpen: boolean;
  onCloseAddSite: () => void;
  onAddSiteSubmit: (name: string, manager: string, outputTarget: number, budget: number) => void;
}

const SUPPLIER_LIST = [
  'Premier Feeds Ltd',
  'Coastal Soy Traders',
  'Sahel Grains Co.',
  'Northern Maize Hub',
  'Eastern Agro Supply',
  'Bran & Bag Supplies',
  'AgroChem Additives Ltd',
  'Limestone Direct'
];

export const Modals: React.FC<ModalsProps> = ({
  items,
  sites,
  selectedSiteId,
  triggerToast,

  isAddStockOpen,
  onCloseAddStock,
  onAddStockSubmit,

  isCollectStockOpen,
  onCloseCollectStock,
  onCollectStockSubmit,

  isNewItemOpen,
  onCloseNewItem,
  onNewItemSubmit,

  isAddExpenseOpen,
  onCloseAddExpense,
  onAddExpenseSubmit,

  isAddProductionOpen,
  onCloseAddProduction,
  onAddProductionSubmit,

  isAddSiteOpen,
  onCloseAddSite,
  onAddSiteSubmit
}) => {
  const currentSite = sites.find(s => s.siteId === selectedSiteId) || sites[0];

  // --- FORM STATES ---

  // Add Stock (Intake) Form State
  const [addForm, setAddForm] = useState({
    itemId: '',
    quantity: 5000,
    operator: '',
    notes: '',
    supplier: '',
    unitCost: 300,
    damaged: 0,
    transport: 45000,
    invoice: ''
  });

  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Collect Stock Form
  const [collectForm, setCollectForm] = useState({ itemId: '', quantity: 2000, operator: '', notes: '' });
  
  // New Material Form
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Grain' as 'Grain' | 'Protein' | 'Fiber' | 'Additive' | 'Mineral',
    unit: 'kg' as 'kg' | 'tons',
    minThreshold: 5000,
    costPerKg: 300,
    weightPerBag: 50
  });

  // Expense Form
  const [expenseForm, setExpenseForm] = useState({ dept: 'Raw Materials', desc: '', supplier: '', amount: 150000, receipt: true });
  
  // Production Form
  const [prodForm, setProdForm] = useState({ 
    qty: 6000, 
    damaged: 120, 
    cost: 1800000, 
    product: 'Layer Mash',
    bagWeight: 25,
    dept: 'Layer Mash Line'
  });

  // Site Form
  const [siteForm, setSiteForm] = useState({ name: '', manager: '', outputTarget: 600, budget: 35000000 });

  // --- AUTO SYNC DEFAULT UNIT COST FOR MATERIAL ---
  useEffect(() => {
    if (addForm.itemId) {
      const selectedItem = items.find(i => i.id === addForm.itemId);
      if (selectedItem) {
        setAddForm(prev => ({ ...prev, unitCost: selectedItem.costPerKg }));
      }
    }
  }, [addForm.itemId, items]);

  // --- STEPPER HELPERS ---
  const stepAddForm = (key: 'quantity' | 'unitCost' | 'damaged' | 'transport', delta: number) => {
    setAddForm(prev => {
      const val = Math.max(0, (prev[key] || 0) + delta);
      return { ...prev, [key]: val };
    });
  };

  const stepProdForm = (key: 'qty' | 'damaged' | 'cost' | 'bagWeight', delta: number) => {
    setProdForm(prev => {
      const val = Math.max(0, (prev[key] || 0) + delta);
      return { ...prev, [key]: val };
    });
  };

  // --- SUBMIT HANDLERS ---
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.itemId || !addForm.quantity || !addForm.operator) {
      triggerToast('danger', 'Incomplete Form', 'Please provide raw material, quantity and operator signature.');
      return;
    }
    onAddStockSubmit(
      addForm.itemId,
      addForm.quantity,
      addForm.operator,
      addForm.notes,
      addForm.supplier,
      addForm.unitCost,
      addForm.damaged,
      addForm.transport,
      addForm.invoice
    );
    // Reset
    setAddForm({
      itemId: '',
      quantity: 5000,
      operator: '',
      notes: '',
      supplier: '',
      unitCost: 300,
      damaged: 0,
      transport: 45000,
      invoice: ''
    });
    setAttachmentName(null);
  };

  const handleCollectStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectForm.itemId || !collectForm.quantity || !collectForm.operator) {
      triggerToast('danger', 'Incomplete Form', 'Please provide item, quantity and operator.');
      return;
    }
    const currentStock = currentSite.stocks[collectForm.itemId] || 0;
    if (collectForm.quantity > currentStock) {
      triggerToast('danger', 'Insufficient Inventory', `Cannot collect ${collectForm.quantity.toLocaleString()}kg. Only ${currentStock.toLocaleString()}kg in silo.`);
      return;
    }
    onCollectStockSubmit(collectForm.itemId, collectForm.quantity, collectForm.operator, collectForm.notes);
    setCollectForm({ itemId: '', quantity: 2000, operator: '', notes: '' });
  };

  const handleNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name || !newItemForm.minThreshold || !newItemForm.costPerKg) {
      triggerToast('danger', 'Incomplete Form', 'Please fill name, safety threshold, and unit costs.');
      return;
    }
    onNewItemSubmit(
      newItemForm.name,
      newItemForm.category,
      newItemForm.unit,
      newItemForm.minThreshold,
      newItemForm.costPerKg,
      newItemForm.weightPerBag
    );
    setNewItemForm({ name: '', category: 'Grain', unit: 'kg', minThreshold: 5000, costPerKg: 300, weightPerBag: 50 });
  };

  const handleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.desc || !expenseForm.amount) {
      triggerToast('danger', 'Incomplete Form', 'Please fill description and cost amount.');
      return;
    }
    onAddExpenseSubmit(expenseForm.dept, expenseForm.desc, expenseForm.supplier, expenseForm.amount, expenseForm.receipt);
    setExpenseForm({ dept: 'Raw Materials', desc: '', supplier: '', amount: 150000, receipt: true });
    setAttachmentName(null);
  };

  const handleProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.qty || !prodForm.cost) {
      triggerToast('danger', 'Incomplete Form', 'Please specify quantity and batch cost.');
      return;
    }
    onAddProductionSubmit(prodForm.qty, prodForm.damaged, prodForm.cost, prodForm.product, prodForm.bagWeight);
    setProdForm({ qty: 6000, damaged: 120, cost: 1800000, product: 'Layer Mash', bagWeight: 25, dept: 'Layer Mash Line' });
    setAttachmentName(null);
  };

  const handleSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm.name || !siteForm.manager) {
      triggerToast('danger', 'Incomplete Form', 'Please fill site name and manager.');
      return;
    }
    onAddSiteSubmit(siteForm.name, siteForm.manager, siteForm.outputTarget, siteForm.budget);
    setSiteForm({ name: '', manager: '', outputTarget: 600, budget: 35000000 });
  };

  // --- DYNAMIC INTAKE COMPUTATIONS ---
  const netQty = addForm.quantity - addForm.damaged;
  const damagePct = addForm.quantity > 0 ? (addForm.damaged / addForm.quantity) * 100 : 0;
  const materialCost = addForm.quantity * addForm.unitCost;
  const landed = materialCost + addForm.transport;
  const trueCostPerKg = netQty > 0 ? landed / netQty : 0;

  // --- DYNAMIC PRODUCTION COMPUTATIONS ---
  const netProd = prodForm.qty - prodForm.damaged;
  const wastePct = prodForm.qty > 0 ? (prodForm.damaged / prodForm.qty) * 100 : 0;
  const costPerKg = netProd > 0 ? prodForm.cost / netProd : 0;
  const estBags = Math.floor(netProd / prodForm.bagWeight);

  // Filter suppliers list based on search term
  const filteredSuppliers = SUPPLIER_LIST.filter(s => 
    s.toLowerCase().includes(addForm.supplier.toLowerCase())
  );

  return (
    <>
      {/* 1. LOG STOCK INFLOWS MODAL (INTAKE) */}
      {isAddStockOpen && (
        <div className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={onCloseAddStock} className="absolute top-4 right-4 hover:text-white text-ink-faint">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-ink flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-good" />
              <span>Log Material Intake Delivery</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Increases physical silo stocks and records supplier landed metrics.</p>

            <form onSubmit={handleAddStock} className="space-y-4">
              {/* Supplier Search / Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Supplier / Payee</label>
                <div className="flex">
                  <input 
                    type="text"
                    placeholder="Search or enter supplier..."
                    value={addForm.supplier}
                    onChange={(e) => {
                      setAddForm(prev => ({ ...prev, supplier: e.target.value }));
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowSupplierDropdown(prev => !prev)}
                    className="p-2.5 bg-surface-3 border-y border-r border-line rounded-r-xl text-ink-dim hover:text-ink"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {showSupplierDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-surface-3 border border-line rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto p-1.5 space-y-1">
                    {filteredSuppliers.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setAddForm(prev => ({ ...prev, supplier: s }));
                          setShowSupplierDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-surface text-ink hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <div className="text-center p-2 text-xs text-ink-faint">No matches found. Hit enter to use custom name.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Material Chips / Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Raw Material Silo Destination</label>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAddForm(prev => ({ ...prev, itemId: item.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        addForm.itemId === item.id 
                          ? 'bg-maize text-maize-ink border-maize' 
                          : 'bg-surface-2 border-line text-ink-dim hover:border-ink-faint'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Supplied with Custom Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Qty Supplied (kg)</label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => stepAddForm('quantity', -1000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                    <input 
                      type="number" 
                      value={addForm.quantity} 
                      onChange={(e) => setAddForm(prev => ({ ...prev, quantity: Math.max(0, Number(e.target.value)) }))} 
                      required
                      className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                    />
                    <button type="button" onClick={() => stepAddForm('quantity', 1000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Unit Cost (₦/kg)</label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => stepAddForm('unitCost', -10)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                    <input 
                      type="number" 
                      value={addForm.unitCost} 
                      onChange={(e) => setAddForm(prev => ({ ...prev, unitCost: Math.max(0, Number(e.target.value)) }))} 
                      required
                      className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                    />
                    <button type="button" onClick={() => stepAddForm('unitCost', 10)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              {/* Damaged and Transport with Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Qty Damaged / Rejected (kg)</label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => stepAddForm('damaged', -100)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                    <input 
                      type="number" 
                      value={addForm.damaged} 
                      onChange={(e) => setAddForm(prev => ({ ...prev, damaged: Math.max(0, Number(e.target.value)) }))} 
                      className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                    />
                    <button type="button" onClick={() => stepAddForm('damaged', 100)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Transport Cost (₦)</label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => stepAddForm('transport', -5000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                    <input 
                      type="number" 
                      value={addForm.transport} 
                      onChange={(e) => setAddForm(prev => ({ ...prev, transport: Math.max(0, Number(e.target.value)) }))} 
                      className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                    />
                    <button type="button" onClick={() => stepAddForm('transport', 5000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              {/* Signature and Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Invoice #</label>
                  <input 
                    type="text"
                    placeholder="e.g. INV-2026-904"
                    value={addForm.invoice}
                    onChange={(e) => setAddForm(prev => ({ ...prev, invoice: e.target.value }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Mill Operator Signature</label>
                  <input 
                    type="text"
                    placeholder="Your signature name"
                    value={addForm.operator}
                    onChange={(e) => setAddForm(prev => ({ ...prev, operator: e.target.value }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Visual Drag-and-Drop Mock Attachment Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Attach Delivery Waybill or Invoice slip</label>
                <div 
                  onClick={() => setAttachmentName(`waybill_invoice_${Math.floor(Math.random() * 9000) + 1000}.pdf`)}
                  className="border-2 border-dashed border-line hover:border-maize/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-2 transition-colors text-center"
                >
                  <UploadCloud className="w-6 h-6 text-ink-faint mb-1" />
                  {attachmentName ? (
                    <span className="text-xs text-good font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      {attachmentName} Attached
                    </span>
                  ) : (
                    <>
                      <span className="text-[11px] font-bold text-ink">Click to simulate photo waybill upload</span>
                      <span className="text-[9px] text-ink-faint mt-0.5">Supports JPG, PNG, PDF up to 8MB</span>
                    </>
                  )}
                </div>
              </div>

              {/* LIVE FORM COMPUTATION CALCULATOR PANEL */}
              {addForm.itemId && (
                <div className="p-4 bg-surface-2 border border-line rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-ink-dim">
                    <span>Net Weight added to silo:</span>
                    <span className="font-mono font-bold text-white">{netQty.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-ink-dim">
                    <span>Damage / Rejection Rate:</span>
                    <span className={`font-mono font-bold ${damagePct > 5 ? 'text-danger animate-pulse' : 'text-good'}`}>
                      {damagePct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-ink-dim">
                    <span>Raw Material Base Spend:</span>
                    <span className="font-mono font-bold text-white">₦{materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-ink-dim">
                    <span>Total Landed Purchase Value:</span>
                    <span className="font-mono font-bold text-white">₦{landed.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-line border-dashed border-t my-1" />
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-white">Effective Cost / kg:</span>
                    <span className="font-mono text-base text-maize">₦{Math.round(trueCostPerKg).toLocaleString()}/kg</span>
                  </div>

                  {damagePct > 5 && (
                    <div className="flex items-center gap-2 p-2.5 bg-danger-dim/30 border border-danger/20 text-danger rounded-xl text-[10px] font-bold mt-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Intake damage is {damagePct.toFixed(1)}% — above the 5% threshold. An automated supplier warning flag will compile on submission.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={onCloseAddStock} className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold rounded-xl transition-all text-ink-dim hover:text-ink cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-good text-white hover:bg-opacity-95 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer">Log Intake Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DEDUCT STOCK CONSUMPTION MODAL */}
      {isCollectStockOpen && (
        <div className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <button onClick={onCloseCollectStock} className="absolute top-4 right-4 hover:text-white text-ink-faint">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-ink flex items-center gap-2 mb-1">
              <Minus className="w-5 h-5 text-husk" />
              <span>Log Stock formulation Collection</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Deduct raw quantities compiled for mixer formulation lines.</p>

            <form onSubmit={handleCollectStock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Raw Material Source</label>
                <select 
                  value={collectForm.itemId}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, itemId: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none font-semibold text-white"
                >
                  <option value="">Choose item...</option>
                  {items.map(i => {
                    const bal = currentSite.stocks[i.id] || 0;
                    return (
                      <option key={i.id} value={i.id}>{i.name} ({bal.toLocaleString()} kg available)</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Deduction Quantity (kg)</label>
                <input 
                  type="number"
                  value={collectForm.quantity}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, quantity: Math.max(0, Number(e.target.value)) }))}
                  required
                  min="1"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Mixing Operator Signature</label>
                <input 
                  type="text"
                  placeholder="e.g. Tunde Akinola"
                  value={collectForm.operator}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, operator: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Mixing Batch / Formulation Details</label>
                <textarea 
                  placeholder="Mixer line ID or batch targets..."
                  value={collectForm.notes}
                  onChange={(e) => setCollectForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none h-16 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={onCloseCollectStock} className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold rounded-xl transition-all text-ink-dim hover:text-ink cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-husk text-white hover:bg-opacity-95 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer">Deduct Silo Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW INGREDIENT CATALOG MODAL */}
      {isNewItemOpen && (
        <div className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <button onClick={onCloseNewItem} className="absolute top-4 right-4 hover:text-white text-ink-faint">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-ink flex items-center gap-2 mb-1">
              <Sprout className="w-5 h-5 text-maize" />
              <span>Catalog New Feed Material</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Adds a new nutritional category to the global mill database index.</p>

            <form onSubmit={handleNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Material Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Fish Meal"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:border-maize outline-none font-semibold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Nutritional Category</label>
                  <select 
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-xs text-ink focus:border-maize outline-none font-bold text-white"
                  >
                    <option value="Grain">Grain (Energy)</option>
                    <option value="Protein">Protein (Growth)</option>
                    <option value="Fiber">Fiber (Digestion)</option>
                    <option value="Additive">Additive (Health)</option>
                    <option value="Mineral">Mineral (Strength)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Safety Limit (kg)</label>
                  <input 
                    type="number"
                    value={newItemForm.minThreshold}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, minThreshold: Math.max(0, Number(e.target.value)) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Unit Price (₦/kg)</label>
                  <input 
                    type="number"
                    value={newItemForm.costPerKg}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, costPerKg: Math.max(0, Number(e.target.value)) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Standard Bag (kg)</label>
                  <input 
                    type="number"
                    value={newItemForm.weightPerBag}
                    onChange={(e) => setNewItemForm(prev => ({ ...prev, weightPerBag: Math.max(1, Number(e.target.value)) }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={onCloseNewItem} className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold rounded-xl transition-all text-ink-dim hover:text-ink cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-maize text-maize-ink hover:bg-opacity-95 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer">Add to Catalogue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. LOG GENERAL EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <button onClick={onCloseAddExpense} className="absolute top-4 right-4 hover:text-white text-ink-faint">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-ink flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-maize" />
              <span>Log Operating Expense</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Deducts from site budgets and appends lines directly to expenses.</p>

            <form onSubmit={handleExpense} className="space-y-4">
              {/* Department Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Cost Department</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Raw Materials', 'Labor', 'Logistics', 'Utilities', 'Maintenance'].map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setExpenseForm(prev => ({ ...prev, dept }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        expenseForm.dept === dept 
                          ? 'bg-maize text-maize-ink border-maize' 
                          : 'bg-surface-2 border-line text-ink-dim hover:border-ink-faint'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Expense Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Purchase of mixer machine lube"
                  value={expenseForm.desc}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, desc: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-maize outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Vendor Payee</label>
                  <input 
                    type="text"
                    placeholder="Payee name"
                    value={expenseForm.supplier}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-maize outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Total Amount (₦)</label>
                  <input 
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: Math.max(0, Number(e.target.value)) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Proof of Payment Attached</label>
                <div 
                  onClick={() => setAttachmentName(`receipt_slip_${Math.floor(Math.random() * 9000) + 1000}.png`)}
                  className="border-2 border-dashed border-line hover:border-maize/40 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-2 transition-colors text-center"
                >
                  <UploadCloud className="w-5 h-5 text-ink-faint mb-0.5" />
                  {attachmentName ? (
                    <span className="text-[10px] text-good font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {attachmentName} Attached
                    </span>
                  ) : (
                    <span className="text-[10px] text-ink-faint">Click to attach expense paper receipt</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="modalReceipt"
                  checked={expenseForm.receipt}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, receipt: e.target.checked }))}
                  className="rounded text-maize focus:ring-maize w-4 h-4 bg-surface-2 border-line cursor-pointer"
                />
                <label htmlFor="modalReceipt" className="text-xs text-ink-dim cursor-pointer font-bold">Audit and verify receipt matches bank ledger</label>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={onCloseAddExpense} className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold rounded-xl transition-all text-ink-dim hover:text-ink cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-maize text-maize-ink hover:bg-opacity-95 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer">Add Expense Line</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. LOG PRODUCTION BATCH MODAL */}
      {isAddProductionOpen && (
        <div className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <button onClick={onCloseAddProduction} className="absolute top-4 right-4 hover:text-white text-ink-faint">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-ink flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-good" />
              <span>Log Production Batch Output</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Increments operating output stats and records process waste indices.</p>

            <form onSubmit={handleProduction} className="space-y-4">
              {/* Product Department Line Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Production Department Line</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Layer Mash Line', 'Broiler Line', 'Grower Line'].map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setProdForm(prev => ({ ...prev, dept }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        prodForm.dept === dept 
                          ? 'bg-maize text-maize-ink border-maize' 
                          : 'bg-surface-2 border-line text-ink-dim hover:border-ink-faint'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Product Feed Mash Code</label>
                <select 
                  value={prodForm.product}
                  onChange={(e) => setProdForm(prev => ({ ...prev, product: e.target.value }))}
                  className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-xs text-white focus:border-maize outline-none font-bold"
                >
                  <option value="Layer Mash">Layer Mash</option>
                  <option value="Broiler Starter">Broiler Starter</option>
                  <option value="Broiler Finisher">Broiler Finisher</option>
                  <option value="Grower Mash">Grower Mash</option>
                  <option value="Chick Mash">Chick Mash</option>
                </select>
              </div>

              {/* Quantity Produced with Steppers */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Quantity Produced (kg)</label>
                <div className="flex items-center">
                  <button type="button" onClick={() => stepProdForm('qty', -1000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                  <input 
                    type="number" 
                    value={prodForm.qty} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, qty: Math.max(0, Number(e.target.value)) }))} 
                    required
                    className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                  />
                  <button type="button" onClick={() => stepProdForm('qty', 1000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                </div>
              </div>

              {/* Process Waste & Total Batch Cost with Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Process Waste (kg)</label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => stepProdForm('damaged', -50)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                    <input 
                      type="number" 
                      value={prodForm.damaged} 
                      onChange={(e) => setProdForm(prev => ({ ...prev, damaged: Math.max(0, Number(e.target.value)) }))} 
                      className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                    />
                    <button type="button" onClick={() => stepProdForm('damaged', 50)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Weight Per Bag (kg)</label>
                  <div className="flex items-center">
                    <button type="button" onClick={() => stepProdForm('bagWeight', -5)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                    <input 
                      type="number" 
                      value={prodForm.bagWeight} 
                      onChange={(e) => setProdForm(prev => ({ ...prev, bagWeight: Math.max(1, Number(e.target.value)) }))} 
                      className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                    />
                    <button type="button" onClick={() => stepProdForm('bagWeight', 5)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Batch Production Cost (₦)</label>
                <div className="flex items-center">
                  <button type="button" onClick={() => stepProdForm('cost', -100000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-l-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">-</button>
                  <input 
                    type="number" 
                    value={prodForm.cost} 
                    onChange={(e) => setProdForm(prev => ({ ...prev, cost: Math.max(0, Number(e.target.value)) }))} 
                    required
                    className="flex-1 w-full bg-surface-2 border-y border-line text-center text-xs font-mono py-2.5 outline-none focus:border-maize font-bold text-white" 
                  />
                  <button type="button" onClick={() => stepProdForm('cost', 100000)} className="w-10 h-10 flex items-center justify-center bg-surface-3 border border-line rounded-r-xl text-lg font-bold hover:bg-surface hover:text-white cursor-pointer">+</button>
                </div>
              </div>

              {/* LIVE FORM COMPUTATION CALCULATOR PANEL */}
              <div className="p-4 bg-surface-2 border border-line rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-semibold text-ink-dim">
                  <span>Net Output Yield:</span>
                  <span className="font-mono font-bold text-white">{netProd.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-ink-dim">
                  <span>Estimated Finished Bags:</span>
                  <span className="font-mono font-bold text-white">{estBags.toLocaleString()} bags ({prodForm.bagWeight}kg/bag)</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-ink-dim">
                  <span>Process Waste Rate:</span>
                  <span className={`font-mono font-bold ${wastePct > 5 ? 'text-danger animate-pulse' : 'text-good'}`}>
                    {wastePct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-px bg-line border-dashed border-t my-1" />
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-white">Formulation Cost / kg:</span>
                  <span className="font-mono text-base text-maize">₦{Math.round(costPerKg).toLocaleString()}/kg</span>
                </div>

                {wastePct > 5 && (
                  <div className="flex items-center gap-2 p-2.5 bg-danger-dim/30 border border-danger/20 text-danger rounded-xl text-[10px] font-bold mt-2 animate-pulse">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Process waste is {wastePct.toFixed(1)}% — above the 5% threshold. Consider tuning mixer compression ratios.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={onCloseAddProduction} className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold rounded-xl transition-all text-ink-dim hover:text-ink cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-good text-white hover:bg-opacity-95 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer">Submit Production Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ESTABLISH NEW SITE MILL MODAL */}
      {isAddSiteOpen && (
        <div className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            <button onClick={onCloseAddSite} className="absolute top-4 right-4 hover:text-white text-ink-faint">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-ink flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-good" />
              <span>Establish New Mill Terminal</span>
            </h3>
            <p className="text-xs text-ink-dim mb-4">Adds a new operating site to the corporate Benuli Farms network.</p>

            <form onSubmit={handleSite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Site / Terminal Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Kaduna Silo"
                  value={siteForm.name}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-maize outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Mill Manager Signature</label>
                <input 
                  type="text"
                  placeholder="e.g. Yusuf Haruna"
                  value={siteForm.manager}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, manager: e.target.value }))}
                  required
                  className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-maize outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Target Output (tons)</label>
                  <input 
                    type="number"
                    value={siteForm.outputTarget}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, outputTarget: Math.max(0, Number(e.target.value)) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-faint mb-1.5">Operating Budget (₦)</label>
                  <input 
                    type="number"
                    value={siteForm.budget}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, budget: Math.max(0, Number(e.target.value)) }))}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-maize outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={onCloseAddSite} className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold rounded-xl transition-all text-ink-dim hover:text-ink cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-good text-white hover:bg-opacity-95 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer">Establish Mill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
