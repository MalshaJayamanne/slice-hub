
import { createHttpError } from "../utils/validation.js";

export const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(createHttpError("Not authorized. Please log in first.", 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      createHttpError("Forbidden. You do not have access to this resource.", 403)
    );
  }

  next();
};
