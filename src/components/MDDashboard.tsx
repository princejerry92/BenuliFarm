import React, { useState } from 'react';
import { 
  AlertTriangle, Check, ArrowUp, ArrowDown, SlidersHorizontal, 
  Layers, Target, Coins, TrendingUp, Info, ArrowRight, Eye, Download 
} from 'lucide-react';
import { Site } from '../data';
import { InventoryItem } from '../types';

interface MDDashboardProps {
  sites: Site[];
  items: InventoryItem[];
  companyTarget: number;
  onSelectSite: (siteId: string) => void;
  onOpenAddSite: () => void;
  onExportLeaderboardCSV: () => void;
  triggerToast: (type: 'success' | 'warn' | 'danger' | 'info', title: string, desc?: string) => void;
}

export const MDDashboard: React.FC<MDDashboardProps> = ({
  sites,
  items,
  companyTarget,
  onSelectSite,
  onOpenAddSite,
  onExportLeaderboardCSV,
  triggerToast
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'bubble' | 'suppliers' | 'dept' | 'trend'>('bubble');
  const [lbSortAsc, setLbSortAsc] = useState(true);
  const [hoverTooltip, setHoverTooltip] = useState<{ show: boolean; x: number; y: number; title: string; desc: string } | null>(null);

  // --- COMPUTE AGGREGATES ---
  const totalOutput = sites.reduce((sum, s) => sum + s.output, 0);
  const totalCost = sites.reduce((sum, s) => sum + s.totalCost, 0);
  const avgCpt = totalOutput > 0 ? totalCost / totalOutput : 0;
  const grossMargin = 31.4;

  // Sorting
  const sortedSites = [...sites].sort((a, b) => {
    const cptA = a.output > 0 ? a.totalCost / a.output : 0;
    const cptB = b.output > 0 ? b.totalCost / b.output : 0;
    return lbSortAsc ? cptB - cptA : cptA - cptB; // Worst first by default (descending cost)
  });

  const worstSite = [...sites].sort((a, b) => {
    const cptA = a.output > 0 ? a.totalCost / a.output : 0;
    const cptB = b.output > 0 ? b.totalCost / b.output : 0;
    return cptB - cptA;
  })[0];

  const bestSite = [...sites].sort((a, b) => {
    const cptA = a.output > 0 ? a.totalCost / a.output : 0;
    const cptB = b.output > 0 ? b.totalCost / b.output : 0;
    return cptA - cptB;
  })[0];

  const worstCpt = worstSite && worstSite.output > 0 ? worstSite.totalCost / worstSite.output : 0;
  const bestCpt = bestSite && bestSite.output > 0 ? bestSite.totalCost / bestSite.output : 0;

  // Status for Avg Cost Per Ton
  const statusOf = (val: number) => {
    if (val <= companyTarget) return 'good';
    if (val <= 70000) return 'warn';
    return 'danger';
  };

  const statusLabel = (val: number) => {
    if (val <= companyTarget) return 'On target';
    if (val <= 70000) return 'Watch closely';
    return 'Over target';
  };

  const status = statusOf(avgCpt);

  const toggleSort = () => {
    setLbSortAsc(prev => !prev);
    triggerToast(
      'info', 
      'Leaderboard Re-sorted', 
      !lbSortAsc ? 'Highest cost/ton first (worst performing)' : 'Lowest cost/ton first (top performing)'
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">Good evening, Folake</h2>
          <p className="text-xs text-ink-dim mt-0.5">All sites · <span className="font-mono">June 2026</span></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onOpenAddSite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-maize" />
            <span>Add site</span>
          </button>
          <button 
            onClick={onExportLeaderboardCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Ticket Header (Jagged Card) */}
        <div className="relative bg-gradient-to-br from-surface-2 to-surface border border-line rounded-lg p-5 pb-7 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6 overflow-hidden ticket-jagged shadow-lg">
          <span className={`absolute top-5 right-5 inline-flex items-center gap-1 px-3 py-1 border-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider ${
            status === 'good' ? 'border-good text-good' : status === 'warn' ? 'border-warn text-warn' : 'border-danger text-danger'
          }`}>
            {statusLabel(avgCpt)}
          </span>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase font-bold">Avg cost / ton — all sites</div>
              <div className="font-mono text-[10px] text-ink-faint mt-0.5">TICKET #CPT-{new Date().getMonth()+1}{new Date().getFullYear()}</div>
            </div>
          </div>
          <div className="font-mono font-bold text-4xl lg:text-5xl tracking-tight text-white my-4 flex items-baseline">
            ₦{Math.round(avgCpt).toLocaleString()}
            <span className="text-xs font-semibold text-ink-faint font-sans ml-1.5">/ ton</span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 pt-1 border-t border-dashed border-line">
            <div>
              <span className="block text-[10px] text-ink-faint uppercase font-mono tracking-wider">vs company target</span>
              <span className={`font-mono text-xs font-bold ${
                status === 'good' ? 'text-good' : status === 'warn' ? 'text-warn' : 'text-danger'
              }`}>₦{companyTarget.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-ink-faint uppercase font-mono tracking-wider">Total output</span>
              <span className="font-mono text-xs font-bold text-ink">{totalOutput.toLocaleString()} tons</span>
            </div>
            <div>
              <span className="block text-[10px] text-ink-faint uppercase font-mono tracking-wider">Total cost of production</span>
              <span className="font-mono text-xs font-bold text-ink">₦{totalCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-ink-faint uppercase font-mono tracking-wider">Gross margin</span>
              <span className="font-mono text-xs font-bold text-good">{grossMargin}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            {worstSite && (
              <div className="flex items-center gap-2 bg-danger-dim/30 border border-danger/20 text-danger rounded-xl px-3 py-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>Needs attention: <b>{worstSite.siteName}</b> · ₦{Math.round(worstCpt).toLocaleString()}/t</span>
              </div>
            )}
            {bestSite && (
              <div className="flex items-center gap-2 bg-good-dim/30 border border-good/20 text-good rounded-xl px-3 py-1.5 text-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Top performer: <b>{bestSite.siteName}</b> · ₦{Math.round(bestCpt).toLocaleString()}/t</span>
              </div>
            )}
          </div>
        </div>

        {/* Aggregate cost card */}
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-ink-faint transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-ink-faint text-[10px] font-bold uppercase tracking-wider mb-2">
              <Coins className="w-3.5 h-3.5 text-maize" />
              <span>Total Cost of Production</span>
            </div>
            <div className="text-xl font-mono font-bold text-ink">₦{(totalCost / 1000000).toFixed(1)}M</div>
          </div>
          <div className="text-[10px] text-ink-faint mt-2 flex items-center gap-1 font-mono">
            <span className="text-danger flex items-center gap-0.5 font-bold">↑ 3.1%</span> vs last month
          </div>
        </div>

        {/* Aggregate output card */}
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-ink-faint transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-ink-faint text-[10px] font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-teal" />
              <span>Total Network Output</span>
            </div>
            <div className="text-xl font-mono font-bold text-ink">{totalOutput.toLocaleString()} t</div>
          </div>
          <div className="text-[10px] text-ink-faint mt-2 flex items-center gap-1 font-mono">
            <span className="text-good flex items-center gap-0.5 font-bold">↓ 1.4%</span> vs last month
          </div>
        </div>

        {/* Margin card */}
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-ink-faint transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-ink-faint text-[10px] font-bold uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5 text-violet" />
              <span>Gross Margin</span>
            </div>
            <div className="text-xl font-mono font-bold text-good">{grossMargin}%</div>
          </div>
          <div className="text-[10px] text-ink-faint mt-2 font-mono">
            Steady vs last month
          </div>
        </div>

        {/* Needs attention card */}
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-danger/30 hover:border transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-danger text-[10px] font-bold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>Needs Attention</span>
            </div>
            <div className="text-base font-bold text-ink truncate">{worstSite?.siteName}</div>
          </div>
          <div className="text-[10px] text-ink-faint mt-2 font-mono leading-tight">
            ₦{Math.round(worstCpt).toLocaleString()}/t · {worstSite?.manager}
          </div>
        </div>

        {/* Best performer card */}
        <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-good/30 hover:border transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-good text-[10px] font-bold uppercase tracking-wider mb-2">
              <Check className="w-3.5 h-3.5" />
              <span>Top Performer</span>
            </div>
            <div className="text-base font-bold text-ink truncate">{bestSite?.siteName}</div>
          </div>
          <div className="text-[10px] text-ink-faint mt-2 font-mono leading-tight">
            ₦{Math.round(bestCpt).toLocaleString()}/t · {bestSite?.manager}
          </div>
        </div>
      </div>

      {/* SITE LEADERBOARD CARD */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="font-bold text-base text-ink">Site Leaderboard</h3>
            <p className="text-xs text-ink-dim">Sorted by landed cost per ton — worst-performing mills on top</p>
          </div>
          <button 
            onClick={toggleSort}
            className="flex items-center gap-1 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-semibold text-ink-dim hover:text-ink rounded-xl transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort Ledger</span>
          </button>
        </div>

        {/* Leaderboard Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Site Location</th>
                <th className="py-2.5 px-3 text-right">Output</th>
                <th className="py-2.5 px-3 text-right">Total Cost</th>
                <th className="py-2.5 px-3 text-center">Cost / Ton</th>
                <th className="py-2.5 px-3 text-center">MoM Delta</th>
                <th className="py-2.5 px-3">Top Supplier</th>
              </tr>
            </thead>
            <tbody>
              {sortedSites.map((s, idx) => {
                const cpt = s.output > 0 ? s.totalCost / s.output : 0;
                const status = statusOf(cpt);
                const rankClass = idx === 0 ? 'bg-danger-dim text-danger' : idx === sortedSites.length - 1 ? 'bg-good-dim text-good' : 'bg-surface-3 text-ink-dim';
                const isUp = s.mom > 0;

                return (
                  <tr 
                    key={s.siteId}
                    onClick={() => onSelectSite(s.siteId)}
                    className="border-b border-line hover:bg-surface-2 transition-colors duration-150 cursor-pointer text-xs font-semibold"
                  >
                    <td className="py-3 px-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${rankClass}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="text-ink font-bold hover:underline">{s.siteName}</span>
                        <span className="block text-[10px] text-ink-faint font-normal">{s.manager}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-ink">
                      {s.output.toLocaleString()} tons
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-ink-dim">
                      ₦{(s.totalCost / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded font-bold font-mono ${
                        status === 'good' ? 'bg-good-dim/30 text-good' : status === 'warn' ? 'bg-warn-dim/30 text-warn' : 'bg-danger-dim/30 text-danger'
                      }`}>
                        ₦{Math.round(cpt).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-0.5 font-mono ${isUp ? 'text-danger' : 'text-good'}`}>
                        {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(s.mom)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-faint font-normal text-[11px] max-w-[150px] truncate" title={s.topSupplier}>
                      {s.topSupplier}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leaderboard Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {sortedSites.map((s, idx) => {
            const cpt = s.output > 0 ? s.totalCost / s.output : 0;
            const status = statusOf(cpt);
            const rankClass = idx === 0 ? 'bg-danger-dim text-danger' : idx === sortedSites.length - 1 ? 'bg-good-dim text-good' : 'bg-surface-3 text-ink-dim';
            const isUp = s.mom > 0;

            return (
              <div 
                key={s.siteId}
                onClick={() => onSelectSite(s.siteId)}
                className="bg-surface-2 border border-line rounded-xl p-4 space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${rankClass}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-ink">{s.siteName}</div>
                      <div className="text-[10px] text-ink-faint">{s.manager}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                    status === 'good' ? 'bg-good-dim/30 text-good' : status === 'warn' ? 'bg-warn-dim/30 text-warn' : 'bg-danger-dim/30 text-danger'
                  }`}>
                    ₦{Math.round(cpt).toLocaleString()}/t
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2.5 border-t border-line">
                  <div>
                    <span className="block text-[9px] text-ink-faint uppercase font-mono">Output</span>
                    <span className="font-mono font-semibold text-ink">{s.output}t</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-ink-faint uppercase font-mono">Total Cost</span>
                    <span className="font-mono font-semibold text-ink-dim">₦{(s.totalCost/1000000).toFixed(1)}M</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-ink-faint uppercase font-mono">MoM</span>
                    <span className={`inline-flex items-center gap-0.5 font-mono font-semibold ${isUp ? 'text-danger' : 'text-good'}`}>
                      {isUp ? '↑' : '↓'}{Math.abs(s.mom)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG CHARTS COMMAND PANEL */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
        <div className="flex border-b border-line mb-5 overflow-x-auto scrollbar-none gap-5">
          <button 
            onClick={() => setActiveChartTab('bubble')}
            className={`py-2 text-xs font-bold border-b-2 transition-all ${
              activeChartTab === 'bubble' ? 'border-maize text-white' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            Cost vs Output
          </button>
          <button 
            onClick={() => setActiveChartTab('suppliers')}
            className={`py-2 text-xs font-bold border-b-2 transition-all ${
              activeChartTab === 'suppliers' ? 'border-maize text-white' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            Top Suppliers
          </button>
          <button 
            onClick={() => setActiveChartTab('dept')}
            className={`py-2 text-xs font-bold border-b-2 transition-all ${
              activeChartTab === 'dept' ? 'border-maize text-white' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            Department Split
          </button>
          <button 
            onClick={() => setActiveChartTab('trend')}
            className={`py-2 text-xs font-bold border-b-2 transition-all ${
              activeChartTab === 'trend' ? 'border-maize text-white' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            12-Month Trend
          </button>
        </div>

        {/* CHART RENDERS */}
        <div>
          {/* 1. Cost vs Output Bubble Chart */}
          {activeChartTab === 'bubble' && (
            <div className="space-y-4">
              <div className="relative overflow-visible w-full max-w-[600px] mx-auto">
                {(() => {
                  const W = 600, H = 320, pad = { l: 54, r: 20, t: 20, b: 40 };
                  const maxOutput = Math.max(...sites.map(s => s.output)) * 1.2 || 1000;
                  const maxCpt = Math.max(...sites.map(s => s.output > 0 ? s.totalCost / s.output : 0)) * 1.15 || 80000;
                  const minCpt = Math.min(...sites.map(s => s.output > 0 ? s.totalCost / s.output : 0)) * 0.85 || 40000;
                  const maxCost = Math.max(...sites.map(s => s.totalCost)) || 50000000;

                  const getX = (v: number) => pad.l + (v / maxOutput) * (W - pad.l - pad.r);
                  const getY = (v: number) => H - pad.b - ((v - minCpt) / (maxCpt - minCpt)) * (H - pad.t - pad.b);
                  const getR = (v: number) => 14 + Math.sqrt(v / maxCost) * 24;

                  const targetY = getY(companyTarget);

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const gy = pad.t + i * (H - pad.t - pad.b) / 4;
                        return (
                          <line key={i} x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="var(--line)" strokeWidth="1" />
                        );
                      })}
                      {/* Target line */}
                      <line x1={pad.l} y1={targetY} x2={W - pad.r} y2={targetY} stroke="var(--warn)" strokeWidth="1.4" strokeDasharray="5,5" />
                      <text x={W - pad.r - 4} y={targetY - 6} textAnchor="end" fontSize="9" fill="var(--warn)" className="font-mono font-semibold">
                        TARGET ₦{companyTarget.toLocaleString()}
                      </text>

                      {/* Axes */}
                      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="var(--line)" strokeWidth="1" />
                      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="var(--line)" strokeWidth="1" />
                      
                      <text x={(W - pad.r + pad.l) / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--ink-faint)" className="font-semibold">
                        Output (tons) →
                      </text>
                      <text x="14" y={(H - pad.b + pad.t) / 2} textAnchor="middle" fontSize="10" fill="var(--ink-faint)" transform={`rotate(-90 14 ${(H - pad.b + pad.t) / 2})`} className="font-semibold">
                        Landed Cost/ton (₦) →
                      </text>

                      {/* Site Bubbles */}
                      {sites.map((s, idx) => {
                        const cpt = s.output > 0 ? s.totalCost / s.output : 0;
                        const statusColor = statusOf(cpt) === 'good' ? 'var(--good)' : statusOf(cpt) === 'warn' ? 'var(--warn)' : 'var(--danger)';
                        const cx = getX(s.output);
                        const cy = getY(cpt);
                        const rad = getR(s.totalCost);

                        return (
                          <g key={s.siteId}>
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={rad} 
                              fill={statusColor} 
                              fillOpacity="0.2" 
                              stroke={statusColor} 
                              strokeWidth="2.2" 
                              className="cursor-pointer hover:fill-opacity-40 transition-all duration-150"
                              onMouseMove={(e) => {
                                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                const x = rect ? e.clientX - rect.left + 15 : e.clientX;
                                const y = rect ? e.clientY - rect.top - 15 : e.clientY;
                                setHoverTooltip({
                                  show: true,
                                  x,
                                  y,
                                  title: `${s.siteName} Mill`,
                                  desc: `₦${Math.round(cpt).toLocaleString()}/ton\nOutput: ${s.output}t\nBudget Burn: ₦${(s.totalCost/1000).toLocaleString()}k`
                                });
                              }}
                              onMouseLeave={() => setHoverTooltip(null)}
                              onClick={() => onSelectSite(s.siteId)}
                            />
                            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--ink)" className="font-mono pointer-events-none">
                              {s.siteName.charAt(0)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}

                {/* React-driven Tooltip inside the chart box */}
                {hoverTooltip && hoverTooltip.show && (
                  <div 
                    className="absolute bg-surface-3 border border-line rounded-lg p-2.5 shadow-xl text-xs z-50 pointer-events-none max-w-[200px]"
                    style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
                  >
                    <strong className="block text-ink mb-0.5">{hoverTooltip.title}</strong>
                    <span className="font-mono text-[11px] text-ink-dim whitespace-pre-line leading-relaxed">{hoverTooltip.desc}</span>
                  </div>
                )}
              </div>
              <p className="text-center text-[10px] text-ink-faint">Bubble size represents relative total spend. Target safety threshold indicated at ₦60,000.</p>
            </div>
          )}

          {/* 2. Top Suppliers Bar Chart */}
          {activeChartTab === 'suppliers' && (
            <div className="space-y-4 max-w-[500px] mx-auto py-2">
              {(() => {
                const globalSuppliers: { [key: string]: number } = {};
                sites.forEach(s => {
                  s.suppliers.forEach(sup => {
                    globalSuppliers[sup.name] = (globalSuppliers[sup.name] || 0) + sup.spend;
                  });
                });

                const sortedSupps = Object.entries(globalSuppliers)
                  .map(([name, spend]) => ({ name, spend }))
                  .sort((a, b) => b.spend - a.spend)
                  .slice(0, 5);

                const maxSpend = Math.max(...sortedSupps.map(s => s.spend)) || 1;

                return (
                  <div className="space-y-4">
                    {sortedSupps.map((sup, idx) => {
                      const pct = (sup.spend / maxSpend) * 100;
                      return (
                        <div key={sup.name} className="flex items-center gap-4 text-xs">
                          <div className="w-[150px] font-medium text-ink truncate" title={sup.name}>
                            {sup.name}
                          </div>
                          <div className="flex-1 bg-surface-3 h-3.5 rounded-full overflow-hidden border border-line">
                            <div 
                              className="bg-maize h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${pct}%`, transitionDelay: `${idx * 100}ms` }} 
                            />
                          </div>
                          <div className="w-[80px] text-right font-mono font-bold text-ink-dim">
                            ₦{(sup.spend / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* 3. Department Split Bar Chart */}
          {activeChartTab === 'dept' && (
            <div className="space-y-4 max-w-[500px] mx-auto py-2">
              {(() => {
                const deptWeights: { [key: string]: number } = {};
                sites.forEach(s => {
                  s.departments.forEach(d => {
                    deptWeights[d.name] = (deptWeights[d.name] || 0) + d.value;
                  });
                });

                const sortedDepts = Object.entries(deptWeights)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a, b) => b.value - a.value);

                const maxVal = Math.max(...sortedDepts.map(d => d.value)) || 1;
                const colors = ['var(--maize)', 'var(--husk)', 'var(--teal)', 'var(--violet)', 'var(--ink-faint)'];

                return (
                  <div className="space-y-4">
                    {sortedDepts.map((d, idx) => {
                      const pct = (d.value / maxVal) * 100;
                      return (
                        <div key={d.name} className="flex items-center gap-4 text-xs">
                          <div className="w-[140px] font-semibold text-ink truncate" title={d.name}>
                            {d.name}
                          </div>
                          <div className="flex-1 bg-surface-3 h-3.5 rounded-full overflow-hidden border border-line">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ 
                                width: `${pct}%`, 
                                backgroundColor: colors[idx % colors.length],
                                transitionDelay: `${idx * 100}ms` 
                              }} 
                            />
                          </div>
                          <div className="w-[80px] text-right font-mono font-bold text-ink-dim">
                            ₦{(d.value / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex flex-wrap gap-4 pt-3 justify-center">
                      {sortedDepts.map((d, idx) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-ink-faint">
                          <span 
                            className="w-2.5 h-2.5 rounded" 
                            style={{ backgroundColor: colors[idx % colors.length] }} 
                          />
                          <span>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 4. 12-Month Trend Line Chart */}
          {activeChartTab === 'trend' && (
            <div className="space-y-2">
              <div className="relative overflow-visible w-full max-w-[600px] mx-auto">
                {(() => {
                  const data = [58200, 59100, 58700, 60400, 61200, 63500, 62100, 63800, 64900, 65300, 67100, 66200];
                  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const W = 600, H = 260, pad = { l: 50, r: 20, t: 20, b: 34 };

                  const maxVal = Math.max(...data, companyTarget) * 1.08;
                  const minVal = Math.min(...data, companyTarget) * 0.9;

                  const getX = (i: number) => pad.l + i * (W - pad.l - pad.r) / (data.length - 1);
                  const getY = (v: number) => H - pad.b - ((v - minVal) / (maxVal - minVal)) * (H - pad.t - pad.b);

                  const targetY = getY(companyTarget);
                  const pathStr = data.map((v, i) => (i === 0 ? 'M' : 'L') + getX(i) + ',' + getY(v)).join(' ');
                  const areaStr = `${pathStr} L${getX(data.length - 1)},${H - pad.b} L${getX(0)},${H - pad.b} Z`;

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--maize)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--maize)" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const gy = pad.t + i * (H - pad.t - pad.b) / 4;
                        return (
                          <line key={i} x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="var(--line)" strokeWidth="1" />
                        );
                      })}

                      {/* Target line */}
                      <line x1={pad.l} y1={targetY} x2={W - pad.r} y2={targetY} stroke="var(--warn)" strokeWidth="1.3" strokeDasharray="5,5" />
                      <text x={pad.l + 6} y={targetY - 6} fontSize="9" fill="var(--warn)" className="font-mono font-semibold">
                        TARGET ₦{companyTarget.toLocaleString()}
                      </text>

                      {/* Gradient Area */}
                      <path d={areaStr} fill="url(#trendGrad)" />

                      {/* Trend Line */}
                      <path 
                        d={pathStr} 
                        fill="none" 
                        stroke="var(--maize)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />

                      {/* Data Point Circles */}
                      {data.map((v, i) => {
                        const cx = getX(i);
                        const cy = getY(v);
                        return (
                          <g key={i}>
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r="4.2" 
                              fill="var(--bg-soft)" 
                              stroke="var(--maize)" 
                              strokeWidth="2" 
                              className="cursor-pointer hover:r-[6.5] transition-all"
                              onMouseMove={(e) => {
                                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                const x = rect ? e.clientX - rect.left + 15 : e.clientX;
                                const y = rect ? e.clientY - rect.top - 15 : e.clientY;
                                setHoverTooltip({
                                  show: true,
                                  x,
                                  y,
                                  title: months[i],
                                  desc: `₦${v.toLocaleString()} / ton`
                                });
                              }}
                              onMouseLeave={() => setHoverTooltip(null)}
                            />
                            {i % 2 === 0 && (
                              <text x={cx} y={H - 10} textAnchor="middle" fontSize="9.5" fill="var(--ink-faint)" className="font-semibold">
                                {months[i]}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}

                {hoverTooltip && hoverTooltip.show && (
                  <div 
                    className="absolute bg-surface-3 border border-line rounded-lg p-2.5 shadow-xl text-xs z-50 pointer-events-none"
                    style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
                  >
                    <strong className="block text-ink mb-0.5">{hoverTooltip.title}</strong>
                    <span className="font-mono text-xs text-ink-dim">{hoverTooltip.desc}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
