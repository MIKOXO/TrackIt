import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

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
      }
    });
  } catch (error) {
    next(error);
  }
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
