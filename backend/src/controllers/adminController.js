
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
