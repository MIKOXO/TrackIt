import Transaction from '../models/Transaction.js';

const VALID_TYPES = ['income', 'expense'];

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseAmount = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;
    const parsedAmount = parseAmount(amount);
    const parsedDate = parseDate(date);

    if (parsedAmount === null || parsedAmount <= 0) {
      return next({ status: 400, message: 'Transaction amount must be a positive number.' });
    }

    if (!VALID_TYPES.includes(type)) {
      return next({ status: 400, message: 'Transaction type must be either income or expense.' });
    }

    if (!category || !category.trim()) {
      return next({ status: 400, message: 'Category is required.' });
    }

    if (!parsedDate) {
      return next({ status: 400, message: 'Provide a valid date for the transaction.' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      amount: parsedAmount,
      type,
      category: category.trim(),
      date: parsedDate,
      description: description?.trim() || undefined,
    });

    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};
