const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
  };

  if (typeof err.code === 'string') {
    payload.code = err.code;
  }

  if (err.retryAfter !== undefined) {
    payload.retryAfter = err.retryAfter;
    res.setHeader('Retry-After', String(err.retryAfter));
  }

  if (err.attemptsRemaining !== undefined) {
    payload.attemptsRemaining = err.attemptsRemaining;
  }

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

export default errorHandler;
