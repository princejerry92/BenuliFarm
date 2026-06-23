import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Mail, Send, Sparkles } from 'lucide-react';
import { LowStockAlert } from '../types';

interface AlertHubProps {
  alerts: LowStockAlert[];
  onResolve: (alertId: string) => void;
  onNotify: (alertId: string) => void;
}

export const AlertHub: React.FC<AlertHubProps> = ({ alerts, onResolve, onNotify }) => {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  const handleNotify = (id: string) => {
    onNotify(id);
    setNotifiedIds(prev => [...prev, id]);
    setTimeout(() => {
      setNotifiedIds(prev => prev.filter(x => x !== id));
    }, 4000);
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-danger/10 text-danger p-2 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-ink">Urgent Restock Needed</h3>
            <p className="text-xs text-ink-dim">Items below safe operation threshold across the network</p>
          </div>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 bg-danger/10 text-danger rounded-full border border-danger/20 font-bold animate-pulse">
          {activeAlerts.length} Alerts Active
        </span>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-surface-2 rounded-xl border border-dashed border-line">
          <div className="bg-good/10 text-good p-3 rounded-full mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-ink">All Silos Safe</h4>
          <p className="text-xs text-ink-faint max-w-xs mt-1">
            Every site currently maintains stock levels above their minimum safety thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {activeAlerts.map(alert => {
            const deficit = alert.minThreshold - alert.currentStock;
            const deficitPercentage = ((deficit / alert.minThreshold) * 100).toFixed(0);
            const isNotified = notifiedIds.includes(alert.id);

            return (
              <div
                key={alert.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-2 hover:bg-surface-3 transition-colors border border-line rounded-xl gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger mt-1.5 flex-shrink-0 animate-ping" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-ink">{alert.itemName}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-line text-ink-dim rounded">
                        {alert.siteName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 mt-1 text-xs">
                      <div>
                        <span className="text-ink-faint">Current Stock:</span>{' '}
                        <span className="font-mono font-semibold text-danger">
                          {alert.currentStock.toLocaleString()} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-faint">Threshold:</span>{' '}
                        <span className="font-mono text-ink-dim">
                          {alert.minThreshold.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-ink-dim mt-1">
                      Deficit:{' '}
                      <span className="font-mono text-danger font-semibold">
                        {deficit.toLocaleString()} kg ({deficitPercentage}% low)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleNotify(alert.id)}
                    disabled={isNotified}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isNotified
                        ? 'bg-good/20 text-good border border-good/20'
                        : 'bg-surface-3 hover:bg-line text-ink-dim hover:text-ink border border-line'
                    }`}
                  >
                    {isNotified ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-good" />
                        <span>Email Sent!</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Notify Manager</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onResolve(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-maize text-maize-ink hover:bg-opacity-90 transition-all border border-transparent shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Restock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
