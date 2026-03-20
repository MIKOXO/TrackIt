import crypto from 'crypto';
import mongoose from 'mongoose';
import Groq from 'groq-sdk';
import Transaction from '../models/Transaction.js';
import ChatHistory from '../models/ChatHistory.js';

const MODEL_NAME = 'llama-3.1-8b-instant';
const DEFAULT_CONVERSATION_TITLE = 'Chat';

const deriveConversationTitle = (text = '') => {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return ''
  }
  const MAX_LENGTH = 40;
  if (normalized.length <= MAX_LENGTH) {
    return normalized
  }
  return `${normalized.slice(0, MAX_LENGTH).trim()}…`
}

const formatCurrency = (value, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return `${value.toFixed(2)} ${currency}`;
  }
};

const buildTransactionSummary = (transactions, currency) => {
  if (!transactions.length) {
    return {
      text: 'No transactions were found yet.',
    };
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};
  let earliestDate = transactions[0].date;
  let latestDate = transactions[0].date;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;
    if (!earliestDate || transaction.date < earliestDate) {
      earliestDate = transaction.date;
    }
    if (!latestDate || transaction.date > latestDate) {
      latestDate = transaction.date;
    }

    if (transaction.type === 'income') {
      totalIncome += amount;
    } else if (transaction.type === 'expense') {
      totalExpense += amount;
      const key = transaction.category?.trim() || 'Uncategorized';
      categoryTotals[key] = (categoryTotals[key] || 0) + amount;
    }
  });

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, value]) => `${category} (${formatCurrency(value, currency)})`);

  const summaryLines = [];
  summaryLines.push(`Transactions analyzed: ${transactions.length}.`);
  if (totalIncome > 0) {
    summaryLines.push(`Total income: ${formatCurrency(totalIncome, currency)}.`);
  }
  if (totalExpense > 0) {
    summaryLines.push(`Total expenses: ${formatCurrency(totalExpense, currency)}.`);
  }
  summaryLines.push(`Net change: ${formatCurrency(totalIncome - totalExpense, currency)}.`);
  if (topCategories.length) {
    summaryLines.push(`Top spending categories: ${topCategories.join(', ')}.`);
  }
  if (earliestDate && latestDate) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    summaryLines.push(
      `Data covers ${formatter.format(new Date(earliestDate))} through ${formatter.format(
        new Date(latestDate)
      )}.`
    );
  }

  return {
    text: summaryLines.join(' '),
    totals: {
      income: totalIncome,
      expense: totalExpense,
    },
  };
};

const hashText = (text = '') =>
  crypto.createHash('sha256').update(text, 'utf8').digest('hex');

const buildMessageRecord = ({ role, content, tokensUsed = 0 }) => ({
  role,
  content: content.trim(),
  contentHash: hashText(content),
  tokensUsed: Math.max(0, tokensUsed),
});

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required.');
  }
  return new Groq({ apiKey });
};

const serializeConversation = (conversation) => {
  const lastMessage = conversation.messages?.length
    ? conversation.messages[conversation.messages.length - 1]
    : null;
  return {
    id: conversation._id.toString(),
    title: conversation.title,
    summary: conversation.summary || null,
    active: conversation.active,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
    messageCount: conversation.messages?.length ?? 0,
    lastMessage: lastMessage ? lastMessage.content : null,
  };
};

const ensureConversation = async (userId, conversationId, title, initialMessage) => {
  if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
    const existing = await ChatHistory.findOne({ _id: conversationId, user: userId });
    if (existing) {
      return existing;
    }
  }

  await ChatHistory.updateMany({ user: userId }, { $set: { active: false } });
  const conversation = await ChatHistory.create({
    user: userId,
    model: MODEL_NAME,
    title: (
      title?.trim() ||
      deriveConversationTitle(initialMessage) ||
      DEFAULT_CONVERSATION_TITLE
    ),
  });
  return conversation;
};

export const createConversation = async (req, res, next) => {
  const title = (req.body?.title || DEFAULT_CONVERSATION_TITLE).trim();
  try {
    await ChatHistory.updateMany({ user: req.user.id }, { $set: { active: false } });
    const conversation = await ChatHistory.create({
      user: req.user.id,
      model: MODEL_NAME,
      title,
    });
    res.status(201).json(serializeConversation(conversation));
  } catch (error) {
    next({
      status: 500,
      message: error.message || 'Unable to create a new conversation right now.',
    });
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await ChatHistory.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    const activeConversation = conversations.find((conv) => conv.active);
    const initialConversationId =
      activeConversation?._id?.toString() ?? conversations[0]?._id?.toString() ?? null;
    res.status(200).json({
      conversations: conversations.map(serializeConversation),
      initialConversationId,
    });
  } catch (error) {
    next({
      status: 500,
      message: error.message || 'Unable to load assistant conversations right now.',
    });
  }
};

export const getConversation = async (req, res, next) => {
  const { conversationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return next({ status: 404, message: 'Conversation not found.' });
  }

  try {
    const conversation = await ChatHistory.findOne({ _id: conversationId, user: req.user.id });
    if (!conversation) {
      return next({ status: 404, message: 'Conversation not found.' });
    }
    res.status(200).json({
      id: conversation._id.toString(),
      title: conversation.title,
      summary: conversation.summary || null,
      messages: conversation.messages.map((message) => ({
        id: message._id.toString(),
        role: message.role,
        content: message.content,
        timestamp: message.createdAt,
      })),
    });
  } catch (error) {
    next({
      status: 500,
      message: error.message || 'Unable to load the conversation right now.',
    });
  }
};

export const deleteConversation = async (req, res, next) => {
  const { conversationId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return next({ status: 404, message: 'Conversation not found.' });
  }

  try {
    const conversation = await ChatHistory.findOneAndDelete({
      _id: conversationId,
      user: req.user.id,
    });
    if (!conversation) {
      return next({ status: 404, message: 'Conversation not found.' });
    }

    if (conversation.active) {
      const nextConversation = await ChatHistory.findOne({ user: req.user.id }).sort({
        updatedAt: -1,
      });
      if (nextConversation) {
        await ChatHistory.updateMany({ user: req.user.id }, { $set: { active: false } });
        nextConversation.active = true;
        await nextConversation.save();
      }
    }

    const conversations = await ChatHistory.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    const activeConversation = conversations.find((conv) => conv.active);
    const initialConversationId =
      activeConversation?._id?.toString() ?? conversations[0]?._id?.toString() ?? null;

    res.status(200).json({
      conversations: conversations.map(serializeConversation),
      initialConversationId,
    });
  } catch (error) {
    next({
      status: 500,
      message: error.message || 'Unable to delete the conversation right now.',
    });
  }
};

export const askAssistant = async (req, res, next) => {
  const question = (req.body?.question || '').trim();
  const { conversationId, title } = req.body || {};
  if (!question) {
    return next({ status: 400, message: 'A question is required to consult the AI assistant.' });
  }

  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(200);
    const summary = buildTransactionSummary(transactions, req.user.currency);
    const promptMessages = [
      {
        role: 'system',
        content:
          'You are a concise, trustworthy financial assistant. Rely only on the provided dataset and the user question to answer. If the data is limited, say so clearly.',
      },
      {
        role: 'user',
        content: `Financial snapshot: ${summary.text}`,
      },
      {
        role: 'user',
        content: `User question: ${question}`,
      },
    ];

    let conversation = await ensureConversation(req.user.id, conversationId, title, question);
    if (
      (!conversation.title || conversation.title === DEFAULT_CONVERSATION_TITLE) &&
      question
    ) {
      const derivedTitle = deriveConversationTitle(question);
      if (derivedTitle) {
        conversation.title = derivedTitle;
      }
    }
    await ChatHistory.updateMany({ user: req.user.id, _id: { $ne: conversation._id } }, { $set: { active: false } });
    conversation.active = true;

    const groqClient = getGroqClient();
    const response = await groqClient.chat.completions.create({
      model: MODEL_NAME,
      messages: promptMessages,
      temperature: 0.2,
      max_completion_tokens: 600,
    });

    const answer = response?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      throw new Error('Groq did not return a usable response.');
    }

    const tokensUsed = typeof response?.usage?.total_tokens === 'number' ? response.usage.total_tokens : 0;
    const userMessage = buildMessageRecord({ role: 'user', content: question });
    const assistantMessage = buildMessageRecord({ role: 'assistant', content: answer, tokensUsed });

    conversation.messages.push(userMessage, assistantMessage);
    conversation.tokensUsed = (conversation.tokensUsed || 0) + tokensUsed;
    conversation.summary = summary.text;
    conversation.summaryHash = hashText(summary.text);
    conversation.model = MODEL_NAME;
    await conversation.save();

    res.status(200).json({
      answer,
      summary: summary.text,
      conversationId: conversation._id.toString(),
    });
  } catch (error) {
    next({
      status: 500,
      message:
        error.message || 'Unable to generate an AI response right now. Please try again later.',
    });
  }
};
