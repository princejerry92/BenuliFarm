import React, { useState, useMemo } from 'react';
import { Search, Download, Upload, Check, FileText, Plus } from 'lucide-react';
import { Expense } from '../data';

interface ExpensesViewProps {
  expenses: Expense[];
  onUpdateExpenses: (updater: (prev: Expense[]) => Expense[]) => void;
  triggerToast: (type: 'success' | 'warn' | 'danger' | 'info', title: string, desc?: string) => void;
  onExportExpensesCSV: () => void;
  onOpenAddExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onUpdateExpenses,
  triggerToast,
  onExportExpensesCSV,
  onOpenAddExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Extract unique departments for chips
  const depts = useMemo(() => {
    return ['all', ...Array.from(new Set(expenses.map(e => e.dept)))];
  }, [expenses]);

  // Filtering
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = 
        e.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.dept.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = selectedDept === 'all' || e.dept === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [expenses, searchTerm, selectedDept]);

  // Inline editing handler
  const handleEditCell = (idx: number, field: 'desc' | 'amount', value: string) => {
    const updatedValue = field === 'amount' ? Number(value) || 0 : value;
    
    onUpdateExpenses(prev => 
      prev.map((exp, i) => {
        if (i === idx) {
          return {
            ...exp,
            [field]: updatedValue
          };
        }
        return exp;
      })
    );

    triggerToast('success', 'Cell Saved', `Updated cell ${field === 'amount' ? 'Amount' : 'Description'} dynamically.`);
  };

  // CSV Import Parser
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(l => l.trim());
      let added = 0;

      const parsedExpenses: Expense[] = [];

      lines.slice(1).forEach(line => {
        const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cells.length >= 5) {
          parsedExpenses.push({
            date: cells[0] || 'Today',
            dept: cells[1] || 'Other',
            desc: cells[2] || 'Imported expense',
            supplier: cells[3] || '—',
            amount: Number(cells[4]) || 0,
            receipt: cells[5] ? cells[5].toLowerCase() === 'true' : false
          });
          added++;
        }
      });

      if (added > 0) {
        onUpdateExpenses(prev => [...parsedExpenses, ...prev]);
        triggerToast('success', 'Import Complete', `${added} rows added successfully from ${file.name}`);
      } else {
        triggerToast('danger', 'Import Failed', 'No valid rows found. Formats must follow: Date,Department,Description,Supplier,Amount');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">Expenses Ledger</h2>
          <p className="text-xs text-ink-dim mt-0.5">Every operational naira out the door, by department and date.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-maize text-maize-ink hover:bg-opacity-95 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleCsvImport} 
            />
          </label>
          <button 
            onClick={onExportExpensesCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-line rounded-xl text-xs text-ink focus:border-maize outline-none focus:bg-surface-3 transition-colors"
            />
          </div>

          {/* Department Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 flex-1">
            {depts.map(d => (
              <button 
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedDept === d 
                    ? 'bg-maize border-maize text-maize-ink shadow-sm'
                    : 'bg-surface-2 border-line text-ink-dim hover:text-ink hover:border-ink-faint'
                }`}
              >
                {d === 'all' ? 'All Depts' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto pt-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-ink-faint text-xs flex flex-col items-center gap-3">
              <span>No matching expense records found.</span>
              <button 
                type="button" 
                onClick={onOpenAddExpense}
                className="px-4 py-2 bg-surface-2 border border-line rounded-xl text-ink font-bold hover:bg-surface-3 hover:text-white transition-all cursor-pointer"
              >
                Log New Operating Expense
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-semibold min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Description (Click to Edit)</th>
                  <th className="py-2.5 px-3">Payee / Supplier</th>
                  <th className="py-2.5 px-3 text-right">Amount (₦)</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e, idx) => (
                  <tr key={idx} className="border-b border-line hover:bg-surface-2 transition-colors">
                    <td className="py-3 px-3 text-ink-faint font-mono whitespace-nowrap">{e.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider bg-surface-3 text-ink-dim border border-line">
                        {e.dept}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <input 
                        type="text" 
                        value={e.desc}
                        onChange={(evt) => handleEditCell(idx, 'desc', evt.target.value)}
                        className="bg-transparent border border-transparent hover:border-line hover:bg-surface-2 focus:bg-surface-3 focus:border-maize px-2 py-1 rounded w-full outline-none text-ink font-bold text-xs"
                      />
                    </td>
                    <td className="py-3 px-3 text-ink-faint">{e.supplier}</td>
                    <td className="py-2 px-3 text-right">
                      <input 
                        type="number" 
                        value={e.amount}
                        onChange={(evt) => handleEditCell(idx, 'amount', evt.target.value)}
                        className="bg-transparent border border-transparent hover:border-line hover:bg-surface-2 focus:bg-surface-3 focus:border-maize px-2 py-1 rounded w-24 text-right outline-none font-mono font-bold text-ink"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      {e.receipt ? (
                        <span className="inline-flex text-good justify-center bg-good-dim/30 p-1 rounded">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-ink-faint font-normal">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
