import React from 'react';
import { ArrowDown, AlertTriangle, Check, Layers, Eye } from 'lucide-react';
import { InventoryItem, SiteInventory } from '../types';

interface MultiSiteSiloMatrixProps {
  items: InventoryItem[];
  siteInventories: SiteInventory[];
  onSelectSite: (siteId: string) => void;
}

export const MultiSiteSiloMatrix: React.FC<MultiSiteSiloMatrixProps> = ({
  items,
  siteInventories,
  onSelectSite
}) => {
  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-maize/10 text-maize p-2 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-ink">Cross-Site Stock Density Matrix</h3>
            <p className="text-xs text-ink-dim">Compare all material stockpiles across all geographical mill terminals</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-good" />
            <span className="text-ink-faint">Safe (&gt;100% of threshold)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-danger" />
            <span className="text-ink-faint">Low Stock (alert active)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-line text-xs font-bold text-ink-faint uppercase tracking-wider">
              <th className="py-3 px-4">Site Location</th>
              {items.map(item => (
                <th key={item.id} className="py-3 px-4 text-center">
                  <div>{item.name}</div>
                  <div className="text-[10px] text-ink-faint lowercase font-normal">
                    thr: {item.minThreshold.toLocaleString()}kg
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-right">Total (kg)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {siteInventories.map(site => {
              const totalWeight = Object.values(site.stocks).reduce((a, b) => (a as number) + (b as number), 0);
              
              return (
                <tr
                  key={site.siteId}
                  className="border-b border-line hover:bg-surface-2 transition-colors duration-150"
                >
                  <td className="py-4 px-4 font-semibold text-sm text-ink">
                    <div>{site.siteName}</div>
                    <div className="text-xs text-ink-faint font-normal">{site.manager}</div>
                  </td>
                  
                  {items.map(item => {
                    const currentStock = site.stocks[item.id] || 0;
                    const isLow = currentStock < item.minThreshold;
                    const ratio = Math.min(100, (currentStock / item.minThreshold) * 100);

                    return (
                      <td key={item.id} className="py-4 px-3 text-center">
                        <div className="inline-flex flex-col items-center justify-center min-w-[100px]">
                          <span
                            className={`font-mono text-xs font-bold px-2 py-1 rounded-md ${
                              isLow
                                ? 'bg-danger/10 text-danger border border-danger/20'
                                : 'bg-good/10 text-good border border-good/20'
                            }`}
                          >
                            {currentStock.toLocaleString()} kg
                          </span>
                          
                          {/* Mini visual indicator */}
                          <div className="w-16 h-1 bg-surface-3 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLow ? 'bg-danger animate-pulse' : 'bg-good'}`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>

                          <span className="flex items-center gap-0.5 text-[9px] text-ink-faint mt-1 uppercase font-mono">
                            {isLow ? (
                              <span className="text-danger flex items-center gap-0.5 font-semibold">
                                <AlertTriangle className="w-2.5 h-2.5" /> Low
                              </span>
                            ) : (
                              <span className="text-good flex items-center gap-0.5 font-semibold">
                                <Check className="w-2.5 h-2.5" /> Safe
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-4 px-4 text-right font-mono text-xs font-semibold text-ink-dim">
                    {totalWeight.toLocaleString()} kg
                  </td>

                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onSelectSite(site.siteId)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-3 hover:bg-line text-ink-dim hover:text-ink text-xs rounded-lg transition-all border border-line font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
