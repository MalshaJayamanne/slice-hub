import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "slicehub-cart";

const CartContext = createContext(null);

const readStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return {
        restaurantId: null,
        restaurantName: "",
        items: [],
      };
    }

    const parsedCart = JSON.parse(storedCart);

    return {
      restaurantId: parsedCart?.restaurantId || null,
      restaurantName: parsedCart?.restaurantName || "",
      items: Array.isArray(parsedCart?.items) ? parsedCart.items : [],
    };
  } catch (_error) {
    return {
      restaurantId: null,
      restaurantName: "",
      items: [],
    };
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (food, quantity = 1) => {
    const normalizedQuantity = Number(quantity);

    if (!food?._id) {
      return {
        success: false,
        message: "Unable to add this item to the cart.",
      };
    }

    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
      return {
        success: false,
        message: "Please choose a valid quantity.",
      };
    }

    const restaurantId =
      food?.restaurant?._id || food?.restaurant || food?.restaurantId || null;
    const restaurantName = food?.restaurant?.name || food?.restaurantName || "";

    if (!restaurantId) {
      return {
        success: false,
        message: "This item is missing restaurant details.",
      };
    }

    let result = {
      success: true,
      message: `${food.name} added to cart.`,
    };

    setCart((currentCart) => {
      if (
        currentCart.restaurantId &&
        currentCart.restaurantId !== restaurantId &&
        currentCart.items.length > 0
      ) {
        result = {
          success: false,
          message: `Your cart already contains items from ${currentCart.restaurantName || "another restaurant"}. Clear it before adding items from a new restaurant.`,
        };

        return currentCart;
      }

      const existingItem = currentCart.items.find((item) => item.foodId === food._id);

      if (existingItem) {
        result = {
          success: true,
          message: `${food.name} quantity updated in cart.`,
        };

        return {
          ...currentCart,
          restaurantId,
          restaurantName,
          items: currentCart.items.map((item) =>
            item.foodId === food._id
              ? { ...item, quantity: item.quantity + normalizedQuantity }
              : item
          ),
        };
      }

      return {
        restaurantId,
        restaurantName,
        items: [
          ...currentCart.items,
          {
            foodId: food._id,
            name: food.name,
            price: Number(food.price) || 0,
            image: food.image || "",
            quantity: normalizedQuantity,
          },
        ],
      };
    });

    return result;
  };

  const removeItem = (foodId) => {
    setCart((currentCart) => {
      const nextItems = currentCart.items.filter((item) => item.foodId !== foodId);

      if (nextItems.length === 0) {
        return {
          restaurantId: null,
          restaurantName: "",
          items: [],
        };
      }

      return {
        ...currentCart,
        items: nextItems,
      };
    });
  };

  const updateQuantity = (foodId, quantity) => {
    const normalizedQuantity = Number(quantity);

    if (!Number.isInteger(normalizedQuantity)) {
      return;
    }

    if (normalizedQuantity <= 0) {
      removeItem(foodId);
      return;
    }

    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.map((item) =>
        item.foodId === foodId ? { ...item, quantity: normalizedQuantity } : item
      ),
    }));
  };

  const clearCart = () => {
    setCart({
      restaurantId: null,
      restaurantName: "",
      items: [],
    });
  };

  const value = useMemo(() => {
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      cart,
      cartItems: cart.items,
      cartRestaurantId: cart.restaurantId,
      cartRestaurantName: cart.restaurantName,
      cartCount: itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
};
