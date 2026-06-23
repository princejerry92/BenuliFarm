import React, { useState } from 'react';
import { 
  FileText, ArrowLeft, Download, Check, AlertTriangle, Target, Truck, BarChart2, ShieldAlert, Award
} from 'lucide-react';
import { Site } from '../data';

interface ReportsViewProps {
  sites: Site[];
  companyTarget: number;
  onExportLeaderboardCSV: () => void;
  triggerToast: (type: 'success' | 'warn' | 'danger' | 'info', title: string, desc?: string) => void;
}

const REPORT_CARDS = [
  { id: 'cpt', icon: Target, title: 'Highest cost/ton by site', desc: 'Ranks every site from worst to best on landed cost per ton.', ready: true },
  { id: 'suppliers', icon: Truck, title: 'Top suppliers by spend', desc: 'Where the procurement naira is actually going, company-wide.', ready: true },
  { id: 'damage', icon: ShieldAlert, title: 'Damage % trend', desc: 'Intake damage and rejection rates over time, by site.', ready: false },
  { id: 'dept', icon: BarChart2, title: 'Department cost breakdown', desc: 'Raw materials vs labor vs transport vs overhead.', ready: false },
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  sites,
  companyTarget,
  onExportLeaderboardCSV,
  triggerToast
}) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  // Status computation for cpt report
  const getCptStatus = (cpt: number) => {
    if (cpt <= companyTarget) return 'good';
    if (cpt <= 70000) return 'warn';
    return 'danger';
  };

  const handleExportSuppliers = () => {
    const rows = [['Supplier Name', 'Spend (₦)']];
    
    // Aggregate suppliers
    const globalSupps: { [key: string]: number } = {};
    sites.forEach(s => {
      s.suppliers.forEach(sup => {
        globalSupps[sup.name] = (globalSupps[sup.name] || 0) + sup.spend;
      });
    });

    Object.entries(globalSupps).forEach(([name, spend]) => {
      rows.push([name, spend.toString()]);
    });

    const csvContent = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benuli_supplier_procurement_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('success', 'Report Exported', 'benuli_supplier_procurement_report.csv downloaded.');
  };

  return (
    <div className="space-y-6">
      {/* 1. REPORT INDEX VIEW */}
      {!activeReport ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">Intelligence Reports</h2>
            <p className="text-xs text-ink-dim mt-0.5">Complex operational questions, answered instantly without spreadsheets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORT_CARDS.map(rc => {
              const Icon = rc.icon;
              return (
                <div 
                  key={rc.id}
                  onClick={() => setActiveReport(rc.id)}
                  className="bg-surface border border-line hover:border-maize rounded-2xl p-5 shadow-md flex items-start gap-4 cursor-pointer transition-colors group"
                >
                  <div className="bg-maize-dim/30 group-hover:bg-maize text-maize group-hover:text-maize-ink p-3 rounded-xl transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-ink group-hover:text-maize transition-colors">{rc.title}</h4>
                    <p className="text-xs text-ink-dim mt-1.5 leading-relaxed">{rc.desc}</p>
                    {!rc.ready && (
                      <span className="inline-block mt-2.5 px-2 py-0.5 bg-surface-2 text-ink-faint rounded text-[9px] uppercase tracking-wider font-mono font-bold">
                        Mock API Connection Required
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. REPORT DETAIL VIEWS */
        <div className="space-y-6 animate-fade-in">
          <button 
            onClick={() => setActiveReport(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-ink-dim hover:text-ink text-xs font-semibold rounded-xl border border-line transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to reports</span>
          </button>

          {/* CPT REPORT DETAIL */}
          {activeReport === 'cpt' && (
            <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
                <div>
                  <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-maize" />
                    <span>Landed Cost / Ton Performance Ranking</span>
                  </h3>
                  <p className="text-xs text-ink-dim mt-0.5">Ranks mill terminals from highest (worst) to lowest (best) operating efficiency.</p>
                </div>
                <button 
                  onClick={onExportLeaderboardCSV}
                  className="flex items-center gap-1 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-semibold text-ink hover:text-white rounded-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Leaderboard CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-line text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Silo Location</th>
                      <th className="py-2.5 px-3 text-right">Tonnage output</th>
                      <th className="py-2.5 px-3 text-right">Spend burn</th>
                      <th className="py-2.5 px-3 text-center">True cost / Ton</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sites].sort((a,b) => {
                      const cptA = a.output > 0 ? a.totalCost / a.output : 0;
                      const cptB = b.output > 0 ? b.totalCost / b.output : 0;
                      return cptB - cptA;
                    }).map((s, idx) => {
                      const cpt = s.output > 0 ? s.totalCost / s.output : 0;
                      const status = getCptStatus(cpt);
                      
                      return (
                        <tr key={s.siteId} className="border-b border-line hover:bg-surface-2 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-ink-faint">{idx + 1}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-ink font-bold">{s.siteName}</span>
                            <span className="block text-[10px] text-ink-faint font-normal">Manager: {s.manager}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-ink">{s.output.toLocaleString()} t</td>
                          <td className="py-3 px-3 text-right font-mono text-ink-dim">₦{s.totalCost.toLocaleString()}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded font-bold font-mono ${
                              status === 'good' ? 'bg-good-dim/30 text-good' : status === 'warn' ? 'bg-warn-dim/30 text-warn' : 'bg-danger-dim/30 text-danger'
                            }`}>
                              ₦{Math.round(cpt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUPPLIERS REPORT DETAIL */}
          {activeReport === 'suppliers' && (
            <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
                <div>
                  <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-teal" />
                    <span>Landed Supplier Procurement Aggregates</span>
                  </h3>
                  <p className="text-xs text-ink-dim mt-0.5">Sum total of purchase values company-wide for the current active period.</p>
                </div>
                <button 
                  onClick={handleExportSuppliers}
                  className="flex items-center gap-1 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-line text-xs font-semibold text-ink hover:text-white rounded-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report CSV</span>
                </button>
              </div>

              {/* Svg horizontal bar layout for supplier spends */}
              {(() => {
                const globalSupps: { [key: string]: number } = {};
                sites.forEach(s => {
                  s.suppliers.forEach(sup => {
                    globalSupps[sup.name] = (globalSupps[sup.name] || 0) + sup.spend;
                  });
                });

                const sortedSupps = Object.entries(globalSupps)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a,b) => b.value - a.value);

                const maxVal = Math.max(...sortedSupps.map(s => s.value)) || 1;

                return (
                  <div className="space-y-4 max-w-xl py-2">
                    {sortedSupps.map((s, idx) => {
                      const pct = (s.value / maxVal) * 100;
                      return (
                        <div key={s.name} className="flex items-center gap-4 text-xs font-semibold">
                          <div className="w-[180px] font-bold text-ink truncate" title={s.name}>
                            {idx + 1}. {s.name}
                          </div>
                          <div className="flex-1 bg-surface-3 h-4 rounded-full overflow-hidden border border-line">
                            <div 
                              className="bg-teal h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%`, transitionDelay: `${idx * 100}ms` }}
                            />
                          </div>
                          <div className="w-[100px] text-right font-mono font-bold text-ink">
                            ₦{s.value.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* NOT WIRED REPORTS EMBED */}
          {['damage', 'dept'].includes(activeReport) && (
            <div className="bg-surface border border-line rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
              <ShieldAlert className="w-12 h-12 text-ink-faint opacity-50 mb-3 animate-pulse" />
              <h4 className="font-bold text-base text-ink mb-1">Live Integration Required</h4>
              <p className="text-xs text-ink-dim max-w-md leading-relaxed">
                This specific dashboard report requires live hardware feed or deep relational DB connection. 
                Connect your real database parameters to enable dynamic chart visualizations for this index.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
