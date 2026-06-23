import React from 'react';
import { 
  AlertTriangle, Check, Layers, Target, Coins, TrendingUp, 
  Trash2, User, Clock, Activity, ArrowRight, Plus 
} from 'lucide-react';
import { Site } from '../data';
import { InventoryItem } from '../types';

interface SiteDashboardProps {
  site: Site;
  items: InventoryItem[];
  onOpenIntake: () => void;
  onOpenCollect: () => void;
}

export const SiteDashboard: React.FC<SiteDashboardProps> = ({
  site,
  items,
  onOpenIntake,
  onOpenCollect
}) => {
  const currentCpt = site.output > 0 ? site.totalCost / site.output : 0;
  const isCptSafe = currentCpt <= site.target;
  
  // Progress calculations
  const outputPct = site.outputTarget > 0 ? (site.output / site.outputTarget) * 100 : 0;
  const burnPct = site.budget > 0 ? (site.totalCost / site.budget) * 100 : 0;

  // Donut chart config
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Render recent site activities matching the site ID
  const iconFor = (type: string) => {
    switch (type) {
      case 'intake': return '🚚';
      case 'production': return '🏭';
      case 'expense': return '🧾';
      case 'flag': return '🚨';
      default: return '🔔';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">{site.siteName} Mill</h2>
          <p className="text-xs text-ink-dim mt-0.5">{site.manager} · <span className="font-mono">June 2026</span></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onOpenCollect}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-husk/10 to-husk/5 text-husk border border-husk/20 hover:bg-husk/20 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <span>Deduct stock</span>
          </button>
          <button 
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-good/10 to-good/5 text-good border border-good/20 hover:bg-good/20 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log intake</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost per ton card */}
        <div className={`bg-surface border border-line rounded-2xl p-5 flex flex-col justify-between shadow-md hover:border-ink-faint transition-colors`}>
          <div>
            <div className="flex items-center gap-1.5 text-ink-faint text-[10px] font-bold uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5 text-maize" />
              <span>My cost / ton</span>
            </div>
            <div className={`text-2xl font-mono font-bold ${isCptSafe ? 'text-good' : 'text-danger'}`}>
              ₦{Math.round(currentCpt).toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-ink-faint mt-3 font-mono leading-relaxed pt-2 border-t border-line-soft">
            Target: Under ₦{site.target.toLocaleString()} · Prev: ₦{site.lastMonth.toLocaleString()}
          </div>
        </div>

        {/* Output vs target with progress ring */}
        <div className="bg-surface border border-line rounded-2xl p-5 flex items-center gap-4 shadow-md">
          <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center">
            {/* SVG circle ring */}
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={strokeWidth} />
              <circle 
                cx={size/2} 
                cy={size/2} 
                r={radius} 
                fill="none" 
                stroke={outputPct >= 100 ? 'var(--good)' : 'var(--maize)'} 
                strokeWidth={strokeWidth} 
                strokeDasharray={`${(Math.min(100, outputPct) / 100) * circumference} ${circumference}`} 
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute font-mono font-bold text-xs text-ink">{Math.round(outputPct)}%</div>
          </div>
          <div>
            <div className="text-ink-faint text-[10px] font-bold uppercase tracking-wider">Output vs target</div>
            <div className="text-base font-bold text-ink font-mono mt-0.5">{site.output} / {site.outputTarget}t</div>
            <div className="text-[10px] text-ink-dim mt-0.5">tons produced this month</div>
          </div>
        </div>

        {/* Budget burn rate progress bar */}
        <div className="bg-surface border border-line rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="text-ink-faint text-[10px] font-bold uppercase tracking-wider mb-2">Budget Burn Rate</div>
            <div className="text-2xl font-mono font-bold text-white">{burnPct.toFixed(1)}%</div>
            
            {/* Progress Bar */}
            <div className="bg-surface-3 h-2 w-full rounded-full overflow-hidden border border-line mt-2.5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  burnPct > 90 ? 'bg-danger' : burnPct > 75 ? 'bg-warn' : 'bg-good'
                }`}
                style={{ width: `${Math.min(100, burnPct)}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-ink-faint font-mono mt-2 pt-1">
            ₦{(site.totalCost / 1000000).toFixed(1)}M of ₦{(site.budget / 1000000).toFixed(1)}M
          </div>
        </div>

        {/* Top cost driver */}
        <div className="bg-surface border border-line rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-1.5 text-ink-faint text-[10px] font-bold uppercase tracking-wider mb-2">
              <Coins className="w-3.5 h-3.5 text-violet" />
              <span>Top Cost Driver</span>
            </div>
            <div className="text-2xl font-mono font-bold text-ink">{site.topDriver || 'Maize'}</div>
          </div>
          <div className="text-[10px] text-ink-faint mt-3 font-mono leading-relaxed pt-2 border-t border-line-soft">
            Accounting for {site.topDriverPct}% of total spend
          </div>
        </div>
      </div>

      {/* CHARTS SPLIT: MATERIALS DONUT & DEPARTMENT BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Raw Material (Donut Chart) */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-base text-ink">Cost by Raw Material</h3>
            <p className="text-xs text-ink-dim">Value allocation of the total spend this month</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={strokeWidth} />
                {(() => {
                  let accumulatedOffset = 0;
                  return site.materials.map((m, idx) => {
                    const ratio = m.pct / 100;
                    const strokeDash = ratio * circumference;
                    const strokeOffset = accumulatedOffset;
                    accumulatedOffset += strokeDash;

                    const mColor = m.color.startsWith('var(') ? m.color : 'var(--maize)';

                    return (
                      <circle 
                        key={m.name}
                        cx={size/2} 
                        cy={size/2} 
                        r={radius} 
                        fill="none" 
                        stroke={mColor} 
                        strokeWidth={strokeWidth} 
                        strokeDasharray={`${strokeDash} ${circumference - strokeDash}`} 
                        strokeDashoffset={-strokeOffset}
                        strokeLinecap="butt"
                        className="transition-all duration-1000"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center">
                <div className="font-mono font-bold text-lg text-ink">{site.topDriverPct}%</div>
                <div className="text-[8px] text-ink-faint uppercase font-bold tracking-wider">{site.topDriver}</div>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex-1 space-y-2.5 w-full">
              {site.materials.map((m) => {
                const mColor = m.color.startsWith('var(') ? m.color : 'var(--maize)';
                return (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: mColor }} />
                      <span className="text-ink font-medium">{m.name}</span>
                    </div>
                    <div className="text-right font-mono text-ink-dim">
                      <span className="font-bold text-ink">₦{(m.value / 1000).toLocaleString()}k</span>
                      <span className="text-[10px] text-ink-faint ml-1.5">({m.pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cost by Department (Bar Chart) */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-base text-ink">Cost by Department</h3>
            <p className="text-xs text-ink-dim">Where the operating naira is dispatched</p>
          </div>

          {(() => {
            const maxVal = Math.max(...site.departments.map(d => d.value)) || 1;
            const colors = ['var(--maize)', 'var(--husk)', 'var(--teal)', 'var(--violet)', 'var(--ink-faint)'];

            return (
              <div className="space-y-3.5 pt-2">
                {site.departments.map((d, idx) => {
                  const pct = (d.value / maxVal) * 100;
                  return (
                    <div key={d.name} className="flex items-center gap-4 text-xs">
                      <div className="w-[110px] font-semibold text-ink truncate" title={d.name}>
                        {d.name}
                      </div>
                      <div className="flex-1 bg-surface-3 h-3 rounded-full overflow-hidden border border-line">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${pct}%`, 
                            backgroundColor: colors[idx % colors.length]
                          }} 
                        />
                      </div>
                      <div className="w-[70px] text-right font-mono font-bold text-ink-dim">
                        ₦{(d.value / 1000).toLocaleString()}k
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* TOP SUPPLIERS & OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Suppliers Table */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-bold text-base text-ink">Top Site Suppliers</h3>
            <p className="text-xs text-ink-dim">Procurement spend metrics for current period</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-line text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                  <th className="py-2 px-3">Supplier Name</th>
                  <th className="py-2 px-3 text-right">Spend</th>
                  <th className="py-2 px-3 text-right">Avg ₦ / kg</th>
                  <th className="py-2 px-3">Last Inflow</th>
                </tr>
              </thead>
              <tbody>
                {site.suppliers.map((sup) => (
                  <tr key={sup.name} className="border-b border-line hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 text-ink font-bold">{sup.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink">₦{sup.spend.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-dim">₦{sup.avgKg}</td>
                    <td className="py-2.5 px-3 text-ink-faint font-normal">{sup.lastDelivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg space-y-4">
          <div className="mb-2">
            <h3 className="font-bold text-base text-ink">Operational Ratios</h3>
            <p className="text-xs text-ink-dim">Quality and downtime indicators</p>
          </div>

          {/* Waste & Variance */}
          <div className="bg-surface-2 border border-line p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink-dim flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5 text-danger" /> Waste & variance
              </span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                site.waste <= site.wasteTarget ? 'bg-good-dim text-good' : 'bg-danger-dim text-danger'
              }`}>
                {site.waste}%
              </span>
            </div>
            <div className="bg-surface-3 h-2 w-full rounded-full overflow-hidden border border-line">
              <div 
                className={`h-full rounded-full ${
                  site.waste <= site.wasteTarget ? 'bg-good' : 'bg-danger'
                }`}
                style={{ width: `${Math.min(100, (site.waste / 8) * 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-ink-faint font-mono">Operations Target: Under {site.wasteTarget}% limit</div>
          </div>

          {/* Labor Efficiency */}
          <div className="bg-surface-2 border border-line p-3.5 rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-ink-dim flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-maize" /> Labor efficiency
              </span>
              <span className="block text-[10px] text-ink-faint mt-0.5">tons / worker / day</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-lg text-ink">{site.laborEff} t</span>
            </div>
          </div>

          {/* Machine Downtime */}
          <div className="bg-surface-2 border border-line p-3.5 rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-ink-dim flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal" /> Machine downtime
              </span>
              <span className="block text-[10px] text-ink-faint mt-0.5">this calendar period</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-lg text-ink">{site.downtime}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT SITE ACTIVITY FEED */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
        <div className="mb-4">
          <h3 className="font-bold text-base text-ink">Recent Site Activity</h3>
          <p className="text-xs text-ink-dim">Real-time log entries synced from mill floors</p>
        </div>

        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {site.feed.length === 0 ? (
            <div className="text-center py-6 text-xs text-ink-faint">
              No entries logged for this site.
            </div>
          ) : (
            site.feed.map((f, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 text-xs pb-3 border-b border-line-soft last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className="text-lg bg-surface-2 p-1.5 rounded-lg border border-line w-8 h-8 flex items-center justify-center">
                    {iconFor(f.type)}
                  </span>
                  <div>
                    <div className="font-bold text-ink">{f.title}</div>
                    <div className="text-ink-faint mt-0.5">{f.sub}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-ink-faint whitespace-nowrap">
                  {f.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
