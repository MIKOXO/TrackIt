const FIELD_BY_CODE = {
  EMAIL_NOT_VERIFIED: 'email',
  USER_EXISTS: 'email',
  EMAIL_ALREADY_IN_USE: 'email',
  OTP_INVALID: 'code',
  OTP_EXPIRED: 'code',
  OTP_COOLDOWN: 'code',
  OTP_RATE_LIMITED: 'code',
  PASSWORD_WEAK: 'password',
};

const normalizeField = (field) => ({ newPassword: 'password' })[field] ?? field;

const resolveAuthField = (error) => {
  const data = error?.response?.data ?? error ?? {};
  if (data?.field) {
    return normalizeField(data.field);
  }
  const code = data?.code ?? null;
  if (FIELD_BY_CODE[code]) {
    return FIELD_BY_CODE[code];
  }
  const message = String(data?.message ?? error?.message ?? '').toLowerCase();
  if (/invalid email or password|invalid credentials|wrong email or password/.test(message)) {
    return null;
  }
  if (/password|weak|strength|symbol/.test(message)) {
    return 'password';
  }
  if (/confirm|match/.test(message)) {
    return 'confirmPassword';
  }
  if (/email|user|exist|already/.test(message)) {
    return 'email';
  }
  return null;
};

export const mapAuthError = (error, fallback) => {
  const data = error?.response?.data ?? error ?? {};
  const message = data?.message || error?.message || fallback;
  const status = data?.status ?? error?.response?.status ?? error?.status ?? null;
  const field = status === 429 || data?.code === 'OTP_MAX_ATTEMPTS' ? null : resolveAuthField(error);
  const retryAfter = data?.retryAfter ?? error?.retryAfter ?? null;
  const attemptsRemaining = data?.attemptsRemaining ?? error?.attemptsRemaining ?? null;

  return {
    scope: field ? 'field' : 'form',
    field,
    message,
    code: data?.code ?? error?.code ?? null,
    status,
    retryAfter,
    attemptsRemaining,
  };
};

export const getRetryAfterSeconds = (error, fallback = 0) => {
  const data = error?.response?.data ?? error ?? {};
  const raw = Number(
    data?.retryAfter ?? error?.retryAfter ?? error?.response?.headers?.['retry-after'] ?? fallback,
  );
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }
  return Math.ceil(raw);
};
