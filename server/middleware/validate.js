const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(' ');
    const error = { status: 400, message };
    const isAuthRoute = req.baseUrl === '/api/auth';
    if (isAuthRoute) {
      const field = result.error.issues.find((issue) => issue.path?.[0])?.path?.[0];
      if (field) error.field = String(field);
    }
    return next(error);
  }

  req.body = result.data;
  next();
};

export default validate;
