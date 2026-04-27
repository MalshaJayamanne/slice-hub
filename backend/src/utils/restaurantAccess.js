import { createHttpError } from "./validation.js";

export const getOwnerIdString = (
  ownerSource,
  missingMessage = "Resource owner details are missing."
) => {
  const ownerId =
    ownerSource &&
    typeof ownerSource === "object" &&
    ownerSource !== null &&
    "ownerId" in ownerSource
      ? ownerSource.ownerId
      : ownerSource;

  if (!ownerId) {
    throw createHttpError(missingMessage, 500);
  }

  return typeof ownerId === "object" && ownerId !== null && "_id" in ownerId
    ? ownerId._id.toString()
    : ownerId.toString();
};

export const ensureOwnerAccess = (ownerSource, user, forbiddenMessage) => {
  if (user.role === "admin") {
    return;
  }

  if (getOwnerIdString(ownerSource) !== user._id.toString()) {
    throw createHttpError(forbiddenMessage, 403);
  }
};

export const ensureRestaurantVisible = (
  restaurant,
  user,
  notFoundMessage = "Restaurant not found."
) => {
  if (restaurant.status === "approved") {
    return;
  }

  if (!user) {
    throw createHttpError(notFoundMessage, 404);
  }

  if (user.role === "admin") {
    return;
  }

  if (getOwnerIdString(restaurant) === user._id.toString()) {
    return;
  }

  throw createHttpError(notFoundMessage, 404);
};

export const buildRestaurantVisibilityFilter = (user) => {
  if (!user || user.role === "customer") {
    return { status: "approved" };
  }

  if (user.role === "seller") {
    return {
      $or: [{ status: "approved" }, { ownerId: user._id }],
    };
  }

  return {};
};
