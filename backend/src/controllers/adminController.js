
import bcrypt from "bcryptjs";

import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import {
  createHttpError,
  findEnumValue,
  normalizeStringValue,
  validateObjectId,
} from "../utils/validation.js";

const ORDER_STATUSES = ["Pending", "Preparing", "Delivered"];
const RESTAURANT_STATUSES = ["pending", "approved", "rejected"];
const USER_ROLES = ["customer", "seller", "admin"];
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 6;

const buildUserResponse = (user, restaurantCounts) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  profileImage: user.profileImage,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  metrics: {
    ownedRestaurantCount: restaurantCounts.get(user._id.toString()) || 0,
  },
});

const buildRestaurantOwner = (owner) => {
  if (!owner || typeof owner !== "object" || !("_id" in owner)) {
    return null;
  }

  return {
    _id: owner._id,
    name: owner.name,
    email: owner.email,
    role: owner.role,
  };
};

const buildRestaurantResponse = (restaurant, metricsMap) => {
  const metrics = metricsMap.get(restaurant._id.toString()) || {
    totalOrders: 0,
    totalRevenue: 0,
  };

  return {
    _id: restaurant._id,
    name: restaurant.name,
    description: restaurant.description,
    category: restaurant.category,
    image: restaurant.image,
    status: restaurant.status,
    createdAt: restaurant.createdAt,
    updatedAt: restaurant.updatedAt,
    owner: buildRestaurantOwner(restaurant.ownerId),
    metrics,
  };
};

const buildOrderResponse = (order) => {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        food:
          item.food && typeof item.food === "object" && "_id" in item.food
            ? {
                _id: item.food._id,
                name: item.food.name,
              }
            : null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    : [];

  return {
    _id: order._id,
    status: order.status,
    totalAmount: order.totalAmount,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer:
      order.customer && typeof order.customer === "object"
        ? {
            _id: order.customer._id,
            name: order.customer.name,
            email: order.customer.email,
          }
        : null,
    restaurant:
      order.restaurant && typeof order.restaurant === "object"
        ? {
            _id: order.restaurant._id,
            name: order.restaurant.name,
            status: order.restaurant.status,
            owner: buildRestaurantOwner(order.restaurant.ownerId),
          }
        : null,
    items,
    metrics: {
      itemCount: items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    },
  };
};

const getRestaurantMetricsMap = async (restaurantIds) => {
  if (!restaurantIds.length) {
    return new Map();
  }

  const metrics = await Order.aggregate([
    {
      $match: {
        restaurant: { $in: restaurantIds },
      },
    },
    {
      $group: {
        _id: "$restaurant",
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  return new Map(
    metrics.map((metric) => [
      metric._id.toString(),
      {
        totalOrders: metric.totalOrders,
        totalRevenue: metric.totalRevenue,
      },
    ])
  );
};

const validateAdminUserPayload = (
  { name, email, password, role, phone, address, profileImage, isActive },
  isPartial = false
) => {
  if (!isPartial || name !== undefined) {
    if (!normalizeStringValue(name)) {
      throw createHttpError("Name is required.", 400);
    }
  }

  if (!isPartial || email !== undefined) {
    const normalizedEmail = normalizeStringValue(email).toLowerCase();

    if (!normalizedEmail) {
      throw createHttpError("Email is required.", 400);
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      throw createHttpError("Please provide a valid email address.", 400);
    }
  }

  if (!isPartial || password !== undefined) {
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      throw createHttpError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        400
      );
    }
  }

  if (role !== undefined && !findEnumValue(role, USER_ROLES)) {
    throw createHttpError("Invalid role.", 400);
  }

  if (phone !== undefined && typeof phone !== "string") {
    throw createHttpError("Phone must be a string.", 400);
  }

  if (address !== undefined && typeof address !== "string") {
    throw createHttpError("Address must be a string.", 400);
  }

  if (profileImage !== undefined && typeof profileImage !== "string") {
    throw createHttpError("Profile image must be a string.", 400);
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    throw createHttpError("isActive must be true or false.", 400);
  }
};

const buildSingleUserResponse = async (user) => {
  const ownedRestaurantCount = await Restaurant.countDocuments({ ownerId: user._id });

  return buildUserResponse(
    user,
    new Map([[user._id.toString(), ownedRestaurantCount]])
  );
};

const ensureAdminUserMutationAllowed = async (
  targetUser,
  { actingUserId, deleting = false, nextRole, nextIsActive }
) => {
  const isSelf = targetUser._id.toString() === actingUserId.toString();
  const resolvedRole = nextRole || targetUser.role;
  const resolvedIsActive =
    nextIsActive === undefined ? targetUser.isActive : nextIsActive;

  if (isSelf && deleting) {
    throw createHttpError("You cannot delete your own account.", 400);
  }

  if (isSelf && resolvedRole !== targetUser.role) {
    throw createHttpError("You cannot change your own admin role.", 400);
  }

  if (isSelf && resolvedIsActive === false) {
    throw createHttpError("You cannot deactivate your own account.", 400);
  }

  const ownedRestaurantCount = await Restaurant.countDocuments({
    ownerId: targetUser._id,
  });

  if (
    ownedRestaurantCount > 0 &&
    ["seller", "admin"].includes(targetUser.role) &&
    !["seller", "admin"].includes(resolvedRole)
  ) {
    throw createHttpError(
      "This user still owns restaurants and cannot be changed to a customer.",
      400
    );
  }

  const isRemovingAdminRole =
    targetUser.role === "admin" && resolvedRole !== "admin";
  const isDeactivatingAdmin =
    targetUser.role === "admin" &&
    targetUser.isActive &&
    resolvedIsActive === false;

  if (deleting || isRemovingAdminRole) {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      throw createHttpError("At least one admin account must remain.", 400);
    }
  }

  if (isDeactivatingAdmin) {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      isActive: true,
    });

    if (activeAdminCount <= 1) {
      throw createHttpError("At least one active admin account must remain.", 400);
    }
  }

  if (deleting) {
    if (ownedRestaurantCount > 0) {
      throw createHttpError(
        "User cannot be deleted while they still own restaurants.",
        400
      );
    }

    const hasOrders = await Order.exists({ customer: targetUser._id });

    if (hasOrders) {
      throw createHttpError(
        "User cannot be deleted after placing orders.",
        400
      );
    }
  }
};

export const getDashboardSummary = async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalAdmins,
      activeUsers,
      totalRestaurants,
      pendingRestaurants,
      approvedRestaurants,
      rejectedRestaurants,
      totalOrders,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isActive: true }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ status: "pending" }),
      Restaurant.countDocuments({ status: "approved" }),
      Restaurant.countDocuments({ status: "rejected" }),
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Preparing" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          sellers: totalSellers,
          admins: totalAdmins,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        restaurants: {
          total: totalRestaurants,
          pending: pendingRestaurants,
          approved: approvedRestaurants,
          rejected: rejectedRestaurants,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          preparing: preparingOrders,
          delivered: deliveredOrders,
          totalRevenue: revenueResult[0]?.totalRevenue || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const search = normalizeStringValue(req.query.search);
    const requestedRole = normalizeStringValue(req.query.role) || "all";
    const requestedIsActive = (normalizeStringValue(req.query.isActive) || "all").toLowerCase();
    const role =
      requestedRole.toLowerCase() === "all"
        ? "all"
        : findEnumValue(requestedRole, USER_ROLES);

    if (!role) {
      throw createHttpError("Invalid role.", 400);
    }

    if (!["all", "true", "false"].includes(requestedIsActive)) {
      throw createHttpError("Invalid isActive filter.", 400);
    }

    const filter = {};

    if (role !== "all") {
      filter.role = role;
    }

    if (requestedIsActive !== "all") {
      filter.isActive = requestedIsActive === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 });
    const userIds = users.map((user) => user._id);

    const restaurantCounts = await Restaurant.aggregate([
      {
        $match: {
          ownerId: { $in: userIds },
        },
      },
      {
        $group: {
          _id: "$ownerId",
          ownedRestaurantCount: { $sum: 1 },
        },
      },
    ]);

    const restaurantCountMap = new Map(
      restaurantCounts.map((item) => [item._id.toString(), item.ownedRestaurantCount])
    );

    res.status(200).json({
      success: true,
      filters: {
        search,
        role,
        isActive: requestedIsActive,
      },
      count: users.length,
      users: users.map((user) => buildUserResponse(user, restaurantCountMap)),
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    validateAdminUserPayload(req.body);

    const normalizedName = normalizeStringValue(req.body.name);
    const normalizedEmail = normalizeStringValue(req.body.email).toLowerCase();
    const normalizedRole = findEnumValue(req.body.role, USER_ROLES) || "customer";

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw createHttpError("User already exists with this email.", 409);
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      phone: req.body.phone?.trim() || "",
      address: req.body.address?.trim() || "",
      profileImage: req.body.profileImage?.trim() || "",
      isActive: req.body.isActive ?? true,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: await buildSingleUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, "user id");
    validateAdminUserPayload(req.body, true);

    const user = await User.findById(req.params.id);

    if (!user) {
      throw createHttpError("User not found.", 404);
    }

    const normalizedRole =
      req.body.role !== undefined
        ? findEnumValue(req.body.role, USER_ROLES)
        : user.role;
    const normalizedIsActive =
      req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    await ensureAdminUserMutationAllowed(user, {
      actingUserId: req.user._id,
      nextRole: normalizedRole,
      nextIsActive: normalizedIsActive,
    });

    if (req.body.email !== undefined) {
      const normalizedEmail = normalizeStringValue(req.body.email).toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        throw createHttpError("User already exists with this email.", 409);
      }

      user.email = normalizedEmail;
    }

    if (req.body.name !== undefined) user.name = normalizeStringValue(req.body.name);
    if (req.body.role !== undefined) user.role = normalizedRole;
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();
    if (req.body.address !== undefined) user.address = req.body.address.trim();
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage.trim();
    }
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.password !== undefined) {
      user.passwordHash = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: await buildSingleUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, "user id");

    const user = await User.findById(req.params.id);

    if (!user) {
      throw createHttpError("User not found.", 404);
    }

    await ensureAdminUserMutationAllowed(user, {
      actingUserId: req.user._id,
      deleting: true,
    });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminRestaurants = async (req, res, next) => {
  try {
    const search = normalizeStringValue(req.query.search);
    const requestedStatus = normalizeStringValue(req.query.status) || "all";
    const status =
      requestedStatus.toLowerCase() === "all"
        ? "all"
        : findEnumValue(requestedStatus, RESTAURANT_STATUSES);

    if (!status) {
      throw createHttpError("Invalid restaurant status.", 400);
    }

    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const restaurants = await Restaurant.find(filter)
      .populate("ownerId", "name email role")
      .sort({ createdAt: -1 });

    const metricsMap = await getRestaurantMetricsMap(restaurants.map((restaurant) => restaurant._id));

    res.status(200).json({
      success: true,
      filters: {
        search,
        status,
      },
      count: restaurants.length,
      restaurants: restaurants.map((restaurant) =>
        buildRestaurantResponse(restaurant, metricsMap)
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminRestaurantStatus = async (req, res, next) => {
  try {
    validateObjectId(req.params.id, "restaurant id");

    const requestedStatus = normalizeStringValue(req.body.status);

    if (!requestedStatus) {
      throw createHttpError("Status is required.", 400);
    }

    const status = findEnumValue(requestedStatus, RESTAURANT_STATUSES);

    if (!status) {
      throw createHttpError("Invalid restaurant status.", 400);
    }

    const restaurant = await Restaurant.findById(req.params.id).populate(
      "ownerId",
      "name email role"
    );

    if (!restaurant) {
      throw createHttpError("Restaurant not found.", 404);
    }

    restaurant.status = status;
    await restaurant.save();

    const metricsMap = await getRestaurantMetricsMap([restaurant._id]);

    res.status(200).json({
      success: true,
      message: `Restaurant ${status} successfully.`,
      restaurant: buildRestaurantResponse(restaurant, metricsMap),
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformOrders = async (req, res, next) => {
  try {
    const search = normalizeStringValue(req.query.search);
    const requestedStatus = normalizeStringValue(req.query.status) || "all";
    const restaurantId = normalizeStringValue(req.query.restaurantId);
    const status =
      requestedStatus.toLowerCase() === "all"
        ? "all"
        : findEnumValue(requestedStatus, ORDER_STATUSES);

    if (!status) {
      throw createHttpError("Invalid order status.", 400);
    }

    if (restaurantId) {
      validateObjectId(restaurantId, "restaurant id");
    }

    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    let orders = await Order.find(filter)
      .populate("customer", "name email")
      .populate({
        path: "restaurant",
        select: "name status ownerId",
        populate: {
          path: "ownerId",
          select: "name email role",
        },
      })
      .populate("items.food", "name")
      .sort({ createdAt: -1 });

    if (search) {
      const normalizedSearch = search.toLowerCase();

      orders = orders.filter((order) => {
        const orderId = order._id.toString().toLowerCase();
        const customerName = order.customer?.name?.toLowerCase() || "";
        const customerEmail = order.customer?.email?.toLowerCase() || "";
        const restaurantName = order.restaurant?.name?.toLowerCase() || "";

        return (
          orderId.includes(normalizedSearch) ||
          customerName.includes(normalizedSearch) ||
          customerEmail.includes(normalizedSearch) ||
          restaurantName.includes(normalizedSearch)
        );
      });
    }

    const summary = orders.reduce(
      (accumulator, order) => {
        accumulator.totalOrders += 1;
        accumulator.totalRevenue += Number(order.totalAmount || 0);
        accumulator.statusCounts[order.status] =
          (accumulator.statusCounts[order.status] || 0) + 1;
        return accumulator;
      },
      {
        totalOrders: 0,
        totalRevenue: 0,
        statusCounts: {
          Pending: 0,
          Preparing: 0,
          Delivered: 0,
        },
      }
    );

    res.status(200).json({
      success: true,
      filters: {
        search,
        status,
        restaurantId,
      },
      count: orders.length,
      summary,
      orders: orders.map((order) => buildOrderResponse(order)),
    });
  } catch (error) {
    next(error);
  }
};
