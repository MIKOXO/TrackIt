import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiX } from 'react-icons/fi';
import LoadingIndicator from '../ui/LoadingIndicator.jsx';
import { getPrimaryButtonClass } from '../ui/buttonStyles.js';
import { useToast } from '../ui/ToastProvider.jsx';

const INCOME_CATEGORIES = ['Salary', 'Freelance'];
const EXPENSE_CATEGORIES = [
  'Investments',
  'Groceries',
  'Dining Out',
  'Entertainment',
  'Subscriptions',
  'Rent',
  'Utilities',
  'Transportation',
  'Health',
  'Education',
  'Gifts',
];

const getToday = () => new Date().toISOString().split('T')[0];

const getDefaultForm = () => (({
  amount: '',
  type: 'expense',
  category: EXPENSE_CATEGORIES[0],
  date: getToday(),
  description: '',
}));

const STANDARD_INPUT_CLASSES =
  'mt-1 w-full rounded-xl border border-slate-200/60 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-50 placeholder-slate-400 shadow-sm shadow-black/40 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-emerald-400';

const getFormInputClass = (extra = '') => `${STANDARD_INPUT_CLASSES} ${extra}`.trim();

const TRANSACTION_BUTTON_BASE =
  'rounded-xl border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

const getTransactionButtonClass = (isActive) =>
  `${TRANSACTION_BUTTON_BASE} ${
    isActive
      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-400/70 dark:bg-emerald-500/20 dark:text-emerald-100'
      : 'border-slate-200/60 bg-slate-50/70 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800/50'
  }`;

const CATEGORY_DROPDOWN_BUTTON = getFormInputClass('flex items-center justify-between');

const getCategoryButtonClass = (isActive) =>
  `${CATEGORY_DROPDOWN_BUTTON} ${
    isActive ? 'border-emerald-400 ring-2 ring-emerald-500/20' : ''
  }`;

const CATEGORY_OPTION_BASE =
  'w-full cursor-pointer px-4 py-2 text-left text-sm transition focus:outline-none';

const CATEGORY_OPTION_ACTIVE =
  'text-slate-900 bg-emerald-200/60 dark:text-slate-50 dark:bg-emerald-500/20';

const CATEGORY_OPTION_INACTIVE =
  'text-slate-50 hover:bg-white/10 dark:hover:bg-white/10';

const AddTransactionModal = ({ isOpen, onClose, onCreate, isSubmitting }) => {
  const [formData, setFormData] = useState(getDefaultForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast } = useToast();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const categoryOptions = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!fieldErrors.amount) return undefined;

    const timerId = setTimeout(() => {
      setFieldErrors((prev) => {
        const { amount, ...rest } = prev;
        return rest;
      });
    }, 4000);

    return () => clearTimeout(timerId);
  }, [fieldErrors.amount]);

  useEffect(() => {
    if (!isCategoryOpen) return undefined;

    const handlePointerDown = (event) => {
      if (categoryDropdownRef.current?.contains(event.target)) return;
      setIsCategoryOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isCategoryOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsCategoryOpen(false);
      return;
    }
    setFormData(getDefaultForm());
    setFieldErrors({});
    setIsCategoryOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validateForm = () => {
    const errors = {};
    const amountValue = Number.parseFloat(formData.amount);

    if (!formData.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    }

    if (!formData.type) {
      errors.type = 'Select income or expense.';
    }

    if (!formData.category || !formData.category.trim()) {
      errors.category = 'Please pick a category.';
    }

    if (!formData.date) {
      errors.date = 'Provide a transaction date.';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = {
      amount: Number.parseFloat(formData.amount),
      type: formData.type,
      category: formData.category.trim(),
      date: formData.date,
      description: formData.description.trim() || undefined,
    };

    try {
      await onCreate(payload);
      showToast('Transaction saved', { type: 'success' });
      onClose();
    } catch {
      /* parent handles toast and field state */
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-42 bg-gradient-to-br from-slate-950/65 via-slate-900/40 to-slate-950/40 backdrop-blur-sm"
          />
          <motion.div
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-44 h-screen w-full max-w-md overflow-y-auto border-l border-slate-200/50 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/95 sm:max-w-sm pt-[72px]"
          >
            <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-4 dark:border-slate-700/50 dark:from-slate-800/50 dark:to-slate-900/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">New transaction</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">Capture expense or income</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200/50 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
                  aria-label="Close sidebar"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Amount</label>
                <input
                  inputMode="decimal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                  className={getFormInputClass('text-base font-semibold')}
                  aria-invalid={Boolean(fieldErrors.amount)}
                />
                {fieldErrors.amount && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{fieldErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Transaction type</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {['income', 'expense'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={getTransactionButtonClass(formData.type === value)}
                      onClick={() => {
                        const newCategories = value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                        setFormData((prev) => ({ ...prev, type: value, category: newCategories[0] }));
                      }}
                      aria-pressed={formData.type === value}
                    >
                      {value === 'income' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </div>
                {fieldErrors.type && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{fieldErrors.type}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      className={getCategoryButtonClass(isCategoryOpen)}
                      onClick={() => setIsCategoryOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isCategoryOpen}
                    >
                      <span className="truncate font-semibold">{formData.category}</span>
                      <FiChevronDown
                        className={`h-4 w-4 transition ${isCategoryOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isCategoryOpen && (
                      <div
                        role="listbox"
                        aria-label="Transaction categories"
                        className="absolute left-0 right-0 top-full z-10 mt-2 max-h-56 overflow-auto rounded-2xl border border-slate-800/80 bg-slate-950 shadow-2xl shadow-black/60"
                      >
                        {categoryOptions.map((category) => (
                          <button
                            key={category}
                            type="button"
                            role="option"
                            aria-selected={formData.category === category}
                            className={`${CATEGORY_OPTION_BASE} ${
                              formData.category === category
                                ? CATEGORY_OPTION_ACTIVE
                                : CATEGORY_OPTION_INACTIVE
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, category }));
                              setIsCategoryOpen(false);
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {fieldErrors.category && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{fieldErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                    className={getFormInputClass('text-sm')}
                    aria-invalid={Boolean(fieldErrors.date)}
                  />
                  {fieldErrors.date && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{fieldErrors.date}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description <span className="text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows="2"
                  maxLength="256"
                  placeholder="Add a short note"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  className={getFormInputClass('text-sm')}
                />
              </div>
            </form>

            <div className="sticky bottom-0 border-t border-slate-200/50 bg-slate-50/50 px-5 py-3 dark:border-slate-700/50 dark:bg-slate-800/30">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={getPrimaryButtonClass(isSubmitting)}
              >
                {isSubmitting && (
                  <span className="mr-3">
                    <LoadingIndicator />
                  </span>
                )}
                Save transaction
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
