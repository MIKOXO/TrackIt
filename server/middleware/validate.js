const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(' ');
    return next({ status: 400, message });
  }

  req.body = result.data;
  next();
};

export default validate;
