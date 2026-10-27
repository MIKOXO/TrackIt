import crypto from 'crypto';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from './emailService.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const readPositiveInt = (name, fallback) => {
  const parsed = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

const getOtpSecret = () => {
  const secret = process.env.OTP_HMAC_SECRET;
  if (!secret) {
    throw new Error('OTP_HMAC_SECRET must be defined.');
  }
  return secret;
};

export const assertOtpConfiguration = () => {
  getOtpSecret();
};

const createOtpError = ({ status, code, message, retryAfter, attemptsRemaining }) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (retryAfter !== undefined) {
    error.retryAfter = retryAfter;
  }
  if (attemptsRemaining !== undefined) {
    error.attemptsRemaining = attemptsRemaining;
  }
  return error;
};

const hashOtpCode = (code) =>
  crypto.createHmac('sha256', getOtpSecret()).update(String(code), 'utf8').digest('hex');

const hashesMatch = (left, right) => {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const generateOtpCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

export const issueOtp = async ({ email, purpose }) => {
  const normalizedEmail = normalizeEmail(email);
  const now = new Date();
  const cooldownMs = readPositiveInt('OTP_RESEND_COOLDOWN_SECONDS', 60) * 1000;
  const maxAttempts = readPositiveInt('OTP_MAX_ATTEMPTS', 5);
  const maxSendsPerHour = readPositiveInt('OTP_MAX_SENDS_PER_HOUR', 5);

  const existing = await Otp.findOne({ email: normalizedEmail, purpose });

  if (existing?.lastSentAt) {
    const elapsed = now.getTime() - new Date(existing.lastSentAt).getTime();
    if (elapsed < cooldownMs) {
      const retryAfter = Math.max(1, Math.ceil((cooldownMs - elapsed) / 1000));
      throw createOtpError({
        status: 429,
        code: 'OTP_COOLDOWN',
        message: `Please wait ${retryAfter} seconds before requesting another code.`,
        retryAfter,
      });
    }
  }

  let sendCount = 1;
  let windowStartedAt = now;

  if (existing) {
    const windowStart = new Date(existing.windowStartedAt || existing.lastSentAt);
    const windowAge = now.getTime() - windowStart.getTime();
    if (windowAge < HOUR_MS) {
      if (existing.sendCount >= maxSendsPerHour) {
        throw createOtpError({
          status: 429,
          code: 'OTP_RATE_LIMITED',
          message: 'Too many verification codes requested. Please try again later.',
        });
      }
      sendCount = existing.sendCount + 1;
      windowStartedAt = windowStart;
    }
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  const otp = await Otp.findOneAndUpdate(
    { email: normalizedEmail, purpose },
    {
      $set: {
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
        sendCount,
        windowStartedAt,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  try {
    await sendOtpEmail({ to: normalizedEmail, code, purpose });
  } catch (error) {
    await Otp.deleteOne({ _id: otp._id, codeHash }).catch(() => {});
    throw error;
  }

  return {
    expiresAt,
    attemptsRemaining: maxAttempts,
  };
};

export const consumeOtp = async ({ email, purpose, code }) => {
  const normalizedEmail = normalizeEmail(email);
  const maxAttempts = readPositiveInt('OTP_MAX_ATTEMPTS', 5);
  const otp = await Otp.findOne({ email: normalizedEmail, purpose }).select('+codeHash');

  if (!otp) {
    throw createOtpError({
      status: 400,
      code: 'OTP_INVALID',
      message: 'That verification code is invalid. Request a new code and try again.',
    });
  }

  if (new Date(otp.expiresAt).getTime() <= Date.now()) {
    await otp.deleteOne();
    throw createOtpError({
      status: 400,
      code: 'OTP_EXPIRED',
      message: 'That verification code has expired. Request a new code and try again.',
    });
  }

  if (otp.attempts >= maxAttempts) {
    await otp.deleteOne();
    throw createOtpError({
      status: 429,
      code: 'OTP_MAX_ATTEMPTS',
      message: 'Too many incorrect attempts. Request a new code and try again.',
    });
  }

  const matches = hashesMatch(hashOtpCode(code), otp.codeHash);
  if (!matches) {
    otp.attempts += 1;
    if (otp.attempts >= maxAttempts) {
      await otp.deleteOne();
      throw createOtpError({
        status: 429,
        code: 'OTP_MAX_ATTEMPTS',
        message: 'Too many incorrect attempts. Request a new code and try again.',
        attemptsRemaining: 0,
      });
    }
    const attemptsRemaining = maxAttempts - otp.attempts;
    await otp.save();
    throw createOtpError({
      status: 400,
      code: 'OTP_INVALID',
      message: `That verification code is incorrect. ${attemptsRemaining} attempt${
        attemptsRemaining === 1 ? '' : 's'
      } remaining.`,
      attemptsRemaining,
    });
  }

  await otp.deleteOne();
  return true;
};

export { normalizeEmail };
