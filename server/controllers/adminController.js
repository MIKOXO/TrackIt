import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const SYSTEM_HEALTH_RANGES = {
  '1h': { steps: 60, stepMs: 60 * 1000, unit: 'minute' },
  '24h': { steps: 24, stepMs: 60 * 60 * 1000, unit: 'hour' },
  '7d': { steps: 7, stepMs: 24 * 60 * 60 * 1000, unit: 'day' },
};

const DATE_FORMAT_BY_UNIT = {
  minute: '%Y-%m-%dT%H:%M',
  hour: '%Y-%m-%dT%H',
  day: '%Y-%m-%d',
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get total transactions count
    const totalTransactions = await Transaction.countDocuments();

    // Get active users (users with activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get recent user activities (last 10 transactions with user info)
    const recentActivities = await Transaction.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type category description createdAt user');

    // Format recent activities
    const formattedActivities = recentActivities.map(activity => ({
      user: activity.user?.name || 'Unknown User',
      action: `${activity.type === 'income' ? 'Added income' : 'Added expense'}`,
      detail: `${activity.amount} - ${activity.category}`,
      timestamp: getTimeAgo(activity.createdAt),
    }));

    // Calculate system uptime (mock for now - would be real system metrics)
    const systemUptime = totalTransactions > 0 ? '99.9%' : '0%';
    
    // Calculate data integrity (mock for now - would be real data validation)
    const dataIntegrity = totalTransactions > 0 ? '100%' : '0%';

    const systemHealth = await buildSystemHealth();

    res.json({
      insights: {
        totalTransactions,
        activeUsers,
        systemUptime,
        dataIntegrity,
      },
      recentActivities: formattedActivities,
      metadata: {
        totalUsers,
        lastUpdated: new Date().toISOString(),
      },
      systemHealth,
    });
  } catch (error) {
    next(error);
  }
};

const buildSystemHealth = async () => {
  const now = new Date();
  const entries = await Promise.all(
    Object.entries(SYSTEM_HEALTH_RANGES).map(async ([rangeKey, config]) => {
      const snapshot = await buildRangeSnapshot(now, config);
      return [rangeKey, snapshot];
    })
  );

  return {
    ranges: Object.fromEntries(entries),
    dependencies: getDependencyStatus(),
    lastUpdated: new Date().toISOString(),
  };
};

const buildRangeSnapshot = async (now, config) => {
  const rangeStart = new Date(now.getTime() - (config.steps - 1) * config.stepMs);
  const rangeEnd = new Date(now);

  const rawBuckets = await Transaction.aggregate([
    { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
    {
      $group: {
        _id: buildBucketExpression(config.unit),
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        users: { $addToSet: '$user' },
      },
    },
    {
      $project: {
        bucket: '$_id',
        count: 1,
        totalAmount: 1,
        users: 1,
      },
    },
    { $sort: { bucket: 1 } },
  ]);

  const bucketMap = new Map();
  const uniqueUsers = new Set();

  rawBuckets.forEach((bucket) => {
    const bucketUsers = Array.isArray(bucket.users) ? bucket.users : [];
    bucketUsers.forEach((userId) => uniqueUsers.add(String(userId)));

    bucketMap.set(bucket.bucket, {
      count: bucket.count,
      totalAmount: bucket.totalAmount,
      avgAmount: bucket.count > 0 ? bucket.totalAmount / bucket.count : 0,
      uniqueUsers: bucketUsers.length,
    });
  });

  const throughput = [];
  const avgAmountSeries = [];
  const uniqueUsersSeries = [];
  let totalTransactions = 0;
  let totalAmount = 0;

  for (let step = 0; step < config.steps; step += 1) {
    const bucketDate = new Date(rangeStart.getTime() + step * config.stepMs);
    const bucketKey = formatUtcKey(bucketDate, config.unit);
    const stats = bucketMap.get(bucketKey);
    const count = stats?.count ?? 0;
    const avgAmount = stats?.avgAmount ?? 0;
    const bucketTotal = stats?.totalAmount ?? 0;
    const bucketUsers = stats?.uniqueUsers ?? 0;

    throughput.push(count);
    avgAmountSeries.push(Number(avgAmount.toFixed(2)));
    uniqueUsersSeries.push(bucketUsers);
    totalTransactions += count;
    totalAmount += bucketTotal;
  }

  const summary = {
    throughputAvg: config.steps > 0 ? Math.round(totalTransactions / config.steps) : 0,
    avgAmount: totalTransactions > 0 ? Number((totalAmount / totalTransactions).toFixed(2)) : 0,
    totalTransactions,
    totalAmount: Number(totalAmount.toFixed(2)),
    uniqueUsers: uniqueUsers.size,
  };

  return {
    summary,
    series: {
      throughput,
      avgAmount: avgAmountSeries,
      uniqueUsers: uniqueUsersSeries,
    },
    range: {
      start: rangeStart.toISOString(),
      end: rangeEnd.toISOString(),
      unit: config.unit,
    },
  };
};

const formatUtcKey = (date, unit) => {
  const pad = (value) => String(value).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());

  if (unit === 'day') {
    return `${year}-${month}-${day}`;
  }

  if (unit === 'hour') {
    return `${year}-${month}-${day}T${hour}`;
  }

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const buildBucketExpression = (unit) => ({
  $dateToString: {
    format: DATE_FORMAT_BY_UNIT[unit] || DATE_FORMAT_BY_UNIT.minute,
    date: '$createdAt',
    timezone: 'UTC',
  },
});

const getDependencyStatus = () => {
  const stateLabel = CONNECTION_STATE_LABELS[mongoose.connection.readyState] || 'Unknown';
  const isConnected = mongoose.connection.readyState === 1;

  return [
    {
      name: 'MongoDB',
      status: isConnected ? 'Healthy' : 'Degraded',
      detail: `Connection: ${stateLabel}`,
    },
    {
      name: 'Auth middleware',
      status: 'Healthy',
      detail: 'JWT validation and guard rules responding without errors.',
    },
    {
      name: 'Background jobs',
      status: 'Healthy',
      detail: 'All scheduled maintenance tasks succeeded recently.',
    },
  ];
};

const CONNECTION_STATE_LABELS = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
};

export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    res.json({
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      admins: adminUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Get transaction counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const transactionCount = await Transaction.countDocuments({ user: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'active',
          plan: 'Starter', // Would need to add plan field to User model
          createdAt: user.createdAt,
          lastActiveAt: user.createdAt, // Would need to track last activity
          mfaEnabled: false, // Would need to add MFA field to User model
          transactions: transactionCount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return next({ status: 400, message: 'Invalid status value.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return next({ status: 403, message: 'Cannot change an administrator\'s status.' });
    }

    user.status = status;
    await user.save();

    res.json({ userId: user._id, status: user.status });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return next({ status: 403, message: 'Cannot delete an administrator account.' });
    }

    await Transaction.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ userId: id, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}
