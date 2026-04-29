import mongoose from "mongoose";

export const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const normalizeStringValue = (value) =>
  typeof value === "string" ? value.trim() : "";

export const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(`Invalid ${fieldName}.`, 400);
  }
};

export const findEnumValue = (value, allowedValues) => {
  const normalizedValue = normalizeStringValue(value).toLowerCase();

  if (!normalizedValue) {
    return "";
  }

  return (
    allowedValues.find(
      (allowedValue) => allowedValue.toLowerCase() === normalizedValue
    ) || ""
  );
};

export const requireEnumValue = (value, allowedValues, fieldName) => {
  const enumValue = findEnumValue(value, allowedValues);

  if (!enumValue) {
    throw createHttpError(`Invalid ${fieldName}.`, 400);
  }

  return enumValue;
};
