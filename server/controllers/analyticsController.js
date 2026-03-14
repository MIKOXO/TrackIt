import Transaction from '../models/Transaction.js';

const clampInt = (value, { min, max, fallback }) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const formatMonthLabel = (monthKey) => {
  // monthKey: YYYY-MM
  const [y, m] = monthKey.split('-').map((v) => Number.parseInt(v, 10));
  const date = new Date(y, (m || 1) - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
};

export const getAnalytics = async (req, res, next) => {
  try {
    const months = clampInt(req.query.months, { min: 1, max: 24, fallback: 6 });
    const days = clampInt(req.query.days, { min: 7, max: 60, fallback: 14 });

    const now = new Date();
    const rangeEnd = now;
    // Include the current month + (months - 1) prior months.
    const rangeStart = startOfMonth(addMonths(now, -(months - 1)));

    const dailyEnd = now;
    const dailyStart = new Date(now);
    dailyStart.setDate(dailyStart.getDate() - (days - 1));
    dailyStart.setHours(0, 0, 0, 0);

    const monthlyPipeline = [
      { $match: { user: req.user.id, date: { $gte: rangeStart, $lte: rangeEnd } } },
      {
        $group: {
          _id: {
            monthKey: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.monthKey',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          monthKey: '$_id',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
        },
      },
      { $sort: { monthKey: 1 } },
    ];

    const categoriesPipeline = [
      { $match: { user: req.user.id, type: 'expense', date: { $gte: rangeStart, $lte: rangeEnd } } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $project: { _id: 0, category: '$_id', amount: 1 } },
      { $sort: { amount: -1 } },
      { $limit: 8 },
    ];

    const dailyPipeline = [
      { $match: { user: req.user.id, date: { $gte: dailyStart, $lte: dailyEnd } } },
      {
        $group: {
          _id: {
            dayKey: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.dayKey',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          dayKey: '$_id',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
        },
      },
      { $sort: { dayKey: 1 } },
    ];

    const [monthlyRaw, categories, daily] = await Promise.all([
      Transaction.aggregate(monthlyPipeline),
      Transaction.aggregate(categoriesPipeline),
      Transaction.aggregate(dailyPipeline),
    ]);

    // Ensure we return continuous months so charts don't "gap" on empty months.
    const monthIndex = new Map(monthlyRaw.map((row) => [row.monthKey, row]));
    const monthly = [];
    const cursor = startOfMonth(rangeStart);
    while (cursor <= rangeEnd) {
      const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      const row = monthIndex.get(monthKey) ?? { monthKey, income: 0, expense: 0, net: 0 };
      monthly.push({ ...row, monthLabel: formatMonthLabel(monthKey) });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const totals = monthly.reduce(
      (acc, row) => {
        acc.income += row.income;
        acc.expense += row.expense;
        acc.net += row.net;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );

    res.json({
      range: {
        months,
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
        days,
        dailyStart: dailyStart.toISOString(),
        dailyEnd: dailyEnd.toISOString(),
      },
      totals,
      monthly,
      categories,
      daily,
    });
  } catch (error) {
    next(error);
  }
};

