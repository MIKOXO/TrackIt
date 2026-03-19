import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    contentHash: {
      type: String,
      required: true,
      trim: true,
    },
    tokensUsed: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Chat',
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    summaryHash: {
      type: String,
      trim: true,
      default: '',
    },
    tokensUsed: {
      type: Number,
      min: 0,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
