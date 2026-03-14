import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../store/slices/authSlice';
import { clearAnalytics } from '../../store/slices/analyticsSlice';
import { clearTransactions } from '../../store/slices/transactionSlice';
import { useNavigate } from 'react-router-dom';

const defaultMenuItems = [
  { icon: FiHome, label: 'Overview', path: '/dashboard' },
  {
    icon: FiDollarSign,
    label: 'Transactions',
    path: '/dashboard/transactions',
  },
  { icon: FiPieChart, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: HiOutlineSparkles, label: 'AI Assistant', path: '/dashboard/ai-assistant' },
  { icon: FiSettings, label: 'Settings', path: '/dashboard/settings' },
];

const Sidebar = ({ isOpen, menuItems = defaultMenuItems }) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(clearUser());
    dispatch(clearAnalytics())
    dispatch(clearTransactions());
    window.localStorage.removeItem('trackitToken');
    window.localStorage.removeItem('trackitUser');
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className='fixed left-0 top-4 z-50 rounded-xl bg-slate-900/90 p-2 text-white shadow-lg backdrop-blur-sm lg:hidden'>
        {isMobileOpen ? (
          <FiX className='h-6 w-6' />
        ) : (
          <FiMenu className='h-6 w-6' />
        )}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden'
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isOpen ? 240 : 80 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className='fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-sm dark:border-trackit-border/60 dark:bg-slate-900/95 lg:flex'>
        {/* Navigation */}
        <nav className='flex-1 space-y-1 overflow-y-auto px-2 py-4'>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className='relative block'
                title={!isOpen ? item.label : ''}>
                <motion.div
                  whileHover={{ x: isOpen ? 4 : 0 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}>
                  <item.icon className='h-5 w-5 flex-shrink-0' />
                  <AnimatePresence mode='wait'>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className='overflow-hidden whitespace-nowrap'>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId='activeTab'
                    className='absolute left-0 top-0 h-full w-1 rounded-r-full bg-emerald-500'
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className='border-t border-slate-200/60 p-2 dark:border-trackit-border/60'>
          <motion.button
            whileHover={{ x: isOpen ? 4 : 0 }}
            onClick={handleSignOut}
            className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
            title={!isOpen ? 'Sign Out' : ''}>
            <FiLogOut className='h-5 w-5 flex-shrink-0' />
            <AnimatePresence mode='wait'>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className='overflow-hidden whitespace-nowrap'>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-sm dark:border-trackit-border/60 dark:bg-slate-900/95 lg:hidden'>
            {/* Logo */}
            <div className='flex h-16 items-center gap-3 border-b border-slate-200/60 px-6 dark:border-trackit-border/60'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trackit-accent to-emerald-500'>
                <FiChevronRight className='h-5 w-5 text-white' />
              </div>
              <h1 className='text-lg font-bold text-slate-900 dark:text-slate-50'>
                TrackIt
              </h1>
            </div>

            {/* Navigation */}
            <nav className='flex-1 space-y-1 overflow-y-auto px-3 py-4'>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className='relative block'>
                    <div
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                      }`}>
                      <item.icon className='h-5 w-5' />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <div className='absolute left-0 top-0 h-full w-1 rounded-r-full bg-emerald-500' />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className='border-t border-slate-200/60 p-3 dark:border-trackit-border/60'>
              <button
                onClick={handleSignOut}
                className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'>
                <FiLogOut className='h-5 w-5' />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
