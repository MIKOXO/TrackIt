import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatCurrency } from '../../utils/currencyUtils.js'

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0)

const ChartCard = ({ title, subtitle, children, right }) => (
  <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex-shrink-0">{right}</div> : null}
    </div>
    {children}
  </div>
)

const ChartTooltip = ({ active, payload, label, isDark, labelFormatter, currency }) => {
  if (!active || !payload?.length) return null
  const bg = isDark ? 'bg-slate-950/95 border-slate-700/60' : 'bg-slate-900/95 border-slate-800/60'
  const fallbackLabel =
    payload?.[0]?.payload?.category ??
    payload?.[0]?.payload?.dayKey ??
    payload?.[0]?.payload?.monthKey ??
    payload?.[0]?.name
  return (
    <div className={`rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm ${bg}`}>
      <div className="text-xs font-semibold text-slate-100">
        {labelFormatter ? labelFormatter(label) : label ?? fallbackLabel}
      </div>
      <div className="mt-2 space-y-1">
        {payload.map((row, index) => {
          const swatch = row.color || row.fill || row.stroke || '#94a3b8'
          const rowLabel = row.name ?? row.dataKey
          const key = `${row.dataKey ?? rowLabel ?? 'series'}-${index}`
          return (
            <div key={key} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2 w-2 rounded-full" style={{ background: swatch }} />
            <span className="capitalize">{rowLabel}</span>
            </span>
            <span className="font-semibold text-slate-100">
              {formatCurrency(row.value, currency)}
            </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const AnalyticsCharts = ({ analytics, isDark, currency }) => {
  const [activeCategory, setActiveCategory] = useState(null)

  const palette = useMemo(
    () => ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1', '#a855f7', '#f97316'],
    []
  )

  const gridStroke = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.08)'
  const axisTick = { fill: isDark ? '#94a3b8' : '#475569', fontSize: 12 }
  const seriesStrokeWidth = 1.5

  const monthly = analytics?.monthly ?? []
  const categories = analytics?.categories ?? []
  const daily = analytics?.daily ?? []

  const hasMonthly = monthly.some((row) => row.income > 0 || row.expense > 0)
  const hasDaily = daily.some((row) => row.income > 0 || row.expense > 0)
  const hasCategories = categories.some((row) => row.amount > 0)

  const categoryTotal = categories.reduce((sum, row) => sum + (row.amount ?? 0), 0)

  const categoryLegend = (
    <div className="flex flex-col gap-2">
      <div className="text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Top categories</div>
      <div className="text-right text-xs text-slate-500 dark:text-slate-400">
        {activeCategory ? `${activeCategory.category}: ${formatCurrency(activeCategory.amount, currency)}` : 'Hover slices'}
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ChartCard title="Last Days" subtitle="Daily net movement (income minus expenses)">
          <div className="h-80">
            {!hasDaily ? (
              <div className="flex h-full items-center justify-center text-slate-600 dark:text-slate-400">
                No daily data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={daily}
                  margin={{ top: 12, right: 12, left: 0, bottom: 12 }}
                  barCategoryGap="40%"
                  barGap={8}
                  maxBarSize={60}
                >
                  <CartesianGrid stroke={gridStroke} vertical={false} strokeWidth={1} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="dayKey"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatCompactNumber} />
                  <Tooltip cursor={false} content={(props) => <ChartTooltip {...props} isDark={isDark} currency={currency} />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[12, 12, 4, 4]} />
                  <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[12, 12, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="lg:col-span-2">
        <ChartCard title="Spending Mix" subtitle="Where your money goes" right={categoryLegend}>
          <div className="h-72">
            {!hasCategories ? (
              <div className="flex h-full items-center justify-center text-slate-600 dark:text-slate-400">
                No category data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip cursor={false} content={(props) => <ChartTooltip {...props} isDark={isDark} currency={currency} />} />
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={2}
                    onMouseLeave={() => setActiveCategory(null)}
                    onMouseEnter={(entry) => setActiveCategory(entry?.payload ?? null)}
                  >
                    {categories.map((_, index) => (
                      <Cell key={index} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {hasCategories ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-3 text-sm dark:border-trackit-border/60 dark:bg-slate-900/50">
              <span className="text-slate-600 dark:text-slate-400">Total (top {categories.length})</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {formatCurrency(categoryTotal, currency)}
              </span>
            </div>
          ) : null}
        </ChartCard>
      </div>

      <div className="lg:col-span-5">
        <ChartCard
          title="Cashflow Trend"
          subtitle="Income vs expenses by month"
          right={
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Net</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {formatCurrency(analytics?.totals?.net ?? 0, currency)}
              </div>
            </div>
          }
        >
          <div className="h-72">
            {!hasMonthly ? (
              <div className="flex h-full items-center justify-center text-slate-600 dark:text-slate-400">
                No monthly data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridStroke} vertical={false} strokeWidth={1} strokeDasharray="4 4" />
                  <XAxis dataKey="monthLabel" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatCompactNumber} />
                  <Tooltip
                    cursor={false}
                    content={(props) => <ChartTooltip {...props} isDark={isDark} currency={currency} />}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#22c55e"
                    fill="url(#incomeFill)"
                    strokeWidth={seriesStrokeWidth}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#ef4444"
                    fill="url(#expenseFill)"
                    strokeWidth={seriesStrokeWidth}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
