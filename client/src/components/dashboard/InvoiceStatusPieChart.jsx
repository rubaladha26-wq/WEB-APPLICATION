import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  Paid: '#10b981', // emerald-500
  Pending: '#3b82f6', // blue-500
  'Partially Paid': '#f59e0b', // amber-500
  Overdue: '#ef4444', // rose-500
  Draft: '#94a3b8', // slate-400
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg border border-slate-800 text-xs">
        <p className="font-bold flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS[data.name] || '#64748b' }}
          />
          {data.name}: {data.value} invoices
        </p>
      </div>
    );
  }
  return null;
};

const InvoiceStatusPieChart = ({ stats = {} }) => {
  const chartData = [
    { name: 'Paid', value: stats.Paid?.count || 0 },
    { name: 'Pending', value: (stats.Pending?.count || 0) + (stats.Sent?.count || 0) },
    { name: 'Partially Paid', value: stats['Partially Paid']?.count || 0 },
    { name: 'Overdue', value: stats.Overdue?.count || 0 },
    { name: 'Draft', value: stats.Draft?.count || 0 },
  ].filter((item) => item.value > 0);

  const totalInvoices = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Invoice Status Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Breakdown of all {totalInvoices} active invoices
        </p>
      </div>

      <div className="h-48 w-full my-3 relative flex items-center justify-center">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[entry.name] || '#64748b'}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalInvoices}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Invoices
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No invoices generated yet.
          </div>
        )}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[entry.name] }}
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white ml-2">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceStatusPieChart;

