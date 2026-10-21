// validate({ body, query, params }) – replaces each part with its parsed (coerced, stripped) value.
export const validate = (schemas) => (req, _res, next) => {
  try {
    for (const part of ["params", "query", "body"]) {
      if (schemas[part]) req[part] = schemas[part].parse(req[part]);
    }
    next();
  } catch (err) {
    next(err);
  }
};
