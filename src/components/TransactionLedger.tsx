import React, { useState, useMemo } from 'react';
import { History, Search, ArrowUpRight, ArrowDownLeft, FileText, Download, Filter } from 'lucide-react';
import { InventoryTransaction } from '../types';

interface TransactionLedgerProps {
  transactions: InventoryTransaction[];
  onExportCSV: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ transactions, onExportCSV }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'add' | 'collect'>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');

  const uniqueSites = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.siteId))).map(siteId => {
      const tx = transactions.find(t => t.siteId === siteId);
      return { id: siteId, name: tx ? tx.siteName : 'Unknown Site' };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch =
        tx.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.siteName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesSite = siteFilter === 'all' || tx.siteId === siteFilter;

      return matchesSearch && matchesType && matchesSite;
    });
  }, [transactions, searchTerm, typeFilter, siteFilter]);

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-maize/10 text-maize p-2 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-ink">Real-Time Inventory Ledger</h3>
            <p className="text-xs text-ink-dim">Auditable register of stock intake inflows and production depletions</p>
          </div>
        </div>
        <button
          onClick={onExportCSV}
          className="self-start md:self-center inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-ink hover:text-white text-xs font-semibold rounded-lg transition-all border border-line"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Search logs (item, site, notes)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-line rounded-xl text-xs text-ink placeholder-ink-faint focus:border-maize focus:bg-surface-3 outline-none transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${
              typeFilter === 'all' ? 'bg-line text-ink font-semibold' : 'text-ink-faint hover:text-ink'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('add')}
            className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${
              typeFilter === 'add' ? 'bg-good/15 text-good font-semibold' : 'text-ink-faint hover:text-ink'
            }`}
          >
            Intake
          </button>
          <button
            onClick={() => setTypeFilter('collect')}
            className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${
              typeFilter === 'collect' ? 'bg-husk/15 text-husk font-semibold' : 'text-ink-faint hover:text-ink'
            }`}
          >
            Consumption
          </button>
        </div>

        {/* Site Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-surface-2 border border-line rounded-xl text-xs text-ink outline-none appearance-none focus:border-maize focus:bg-surface-3 transition-all"
          >
            <option value="all">All Sites</option>
            {uniqueSites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-ink-faint text-xs">
            No ledger records match the applied criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Terminal</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Feed Ingredient</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Value (₦)</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Operational Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => {
                const isAdd = tx.type === 'add';
                const dateObj = new Date(tx.timestamp);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr
                    key={tx.id}
                    className="border-b border-line hover:bg-surface-2/60 transition-colors text-xs font-medium"
                  >
                    <td className="py-3 px-3 font-mono text-ink-dim whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-ink font-semibold">{tx.siteName}</span>
                    </td>
                    <td className="py-3 px-3">
                      {isAdd ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-good/10 text-good border border-good/20 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Intake</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-husk/10 text-husk border border-husk/20 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Collect</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-ink font-semibold">{tx.itemName}</td>
                    <td className="py-3 px-3 text-right font-mono text-ink">
                      {isAdd ? '+' : '-'}{tx.quantity.toLocaleString()} kg
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-ink-dim">
                      ₦{(tx.cost || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-ink-dim whitespace-nowrap">{tx.operator}</td>
                    <td className="py-3 px-3 text-ink-faint text-xs font-normal max-w-[180px] truncate" title={tx.notes}>
                      {tx.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
