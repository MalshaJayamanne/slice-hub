
export const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    const error = new Error("Not authorized. Please log in first.");
    error.statusCode = 401;
    return next(error);
  }

  if (!allowedRoles.includes(req.user.role)) {
    const error = new Error("Forbidden. You do not have access to this resource.");
    error.statusCode = 403;
    return next(error);
  }

  next();
};
