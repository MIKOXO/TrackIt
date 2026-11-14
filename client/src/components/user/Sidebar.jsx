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
  FiChevronLeft,
  FiChevronUp,
} from 'react-icons/fi';
import { HiOutlineSparkles, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import { clearUser } from '../../store/slices/authSlice';
import { clearAnalytics } from '../../store/slices/analyticsSlice';
import { clearTransactions } from '../../store/slices/transactionSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService.js';

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

const Sidebar = ({ isOpen, menuItems = defaultMenuItems, onToggle, logoHref = '/dashboard' }) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth)
  const theme = useSelector((state) => state.theme.mode)
  const isDark = theme === 'dark'

  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const avatar = (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white transition group-hover:shadow-lg group-hover:shadow-emerald-500/40">
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  )

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    try {
      await logout();
    } catch {
      // Continue clearing state even if the request fails.
    }
    dispatch(clearUser());
    dispatch(clearAnalytics())
    dispatch(clearTransactions());
    navigate('/', { replace: true });
  };

  const renderMenuActions = () => (
    <>
      <button
        onClick={() => dispatch(toggleTheme())}
        className='flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/50'>
        {isDark ? <HiOutlineSun className='h-5 w-5 text-slate-400' /> : <HiOutlineMoon className='h-5 w-5 text-slate-400' />}
        <span className='flex-1 text-left'>{isDark ? 'Light mode' : 'Dark mode'}</span>
        <span className={`relative h-5 w-9 flex-shrink-0 rounded-full transition ${isDark ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isDark ? 'left-[18px]' : 'left-0.5'}`} />
        </span>
      </button>
      <button
        onClick={handleSignOut}
        className='flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'>
        <FiLogOut className='h-5 w-5' />
        Sign Out
      </button>
    </>
  );

  const renderProfileFooter = (expanded) => (
    <div className='relative border-t border-slate-200/60 p-2 dark:border-trackit-border/60'>
      {expanded && (
        <AnimatePresence>
          {isProfileMenuOpen && (
            <>
              <button aria-hidden tabIndex={-1} className='fixed inset-0 z-40 cursor-default' onClick={() => setIsProfileMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className='relative z-50 overflow-hidden'>
                <div className='mb-1 rounded-2xl border border-slate-200/80 p-2 dark:border-trackit-border/80'>
                  {renderMenuActions()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <button
        onClick={() => setIsProfileMenuOpen((value) => !value)}
        className={`group relative z-50 flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800/50 ${expanded ? '' : 'justify-center px-0'}`}
        aria-label='Account menu'
        aria-expanded={isProfileMenuOpen}
        title={!expanded ? 'Account' : undefined}>
        {avatar}
        {expanded && (
          <>
            <span className='min-w-0 flex-1 text-left leading-tight'>
              <span className='block truncate text-sm font-medium text-slate-900 dark:text-slate-100'>{user?.name}</span>
              <span className='block truncate text-xs text-slate-500 dark:text-slate-400'>{user?.email}</span>
            </span>
            <FiChevronUp className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isProfileMenuOpen ? '' : 'rotate-180'}`} />
          </>
        )}
      </button>

      {!expanded && (
        <AnimatePresence>
          {isProfileMenuOpen && (
            <>
              <button aria-hidden tabIndex={-1} className='fixed inset-0 z-40 cursor-default' onClick={() => setIsProfileMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className='absolute bottom-0 left-full z-50 ml-2 w-60 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 dark:border-trackit-border/80 dark:bg-slate-900'>
                <div className='border-b border-slate-200/60 px-4 py-3 dark:border-trackit-border/60'>
                  <p className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>{user?.name}</p>
                  <p className='truncate text-xs text-slate-500 dark:text-slate-400'>{user?.email}</p>
                </div>
                <div className='p-2'>{renderMenuActions()}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-3 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/90 text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-emerald-400 lg:hidden focus-visible:outline-none focus-visible:ring focus-visible:ring-emerald-300/60 backdrop-blur-sm"
      >
        {isMobileOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMenu className="h-6 w-6" />
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
        className='fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-sm dark:border-trackit-border/60 dark:bg-slate-900/95 lg:flex'>
        {/* Header - Logo & Collapse Toggle */}
        <div className={`flex flex-shrink-0 items-center gap-2 border-b border-slate-200/60 px-3 py-6 dark:border-trackit-border/60 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && (
            <Link to={logoHref} className='flex items-center'>
              <span className='text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50'>
                Track<span className='text-trackit-accent'>It.</span>
              </span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800/50"
            aria-label="Toggle sidebar"
          >
            <FiChevronLeft className={`h-5 w-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

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

        {/* Profile */}
        {renderProfileFooter(isOpen)}
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
            <div className='flex h-16 items-center border-b border-slate-200/60 px-6 dark:border-trackit-border/60'>
              <h1 className='text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50'>
                Track<span className='text-trackit-accent'>It.</span>
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

            {/* Profile */}
            {renderProfileFooter(true)}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
