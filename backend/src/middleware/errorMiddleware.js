
export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((fieldError) => fieldError.message)
      .filter(Boolean)
      .join(", ") || "Validation failed.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path || "value"}.`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = duplicateField
      ? `${duplicateField} already exists.`
      : "Duplicate value already exists.";
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
