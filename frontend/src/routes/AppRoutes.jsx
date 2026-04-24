import { Navigate, Route, Routes } from "react-router-dom";

import PageLayout from "../components/PageLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

import RestaurantList from "../pages/RestaurantList";
import RestaurantMenu from "../pages/RestaurantMenu";
import SellerRestaurantForm from "../pages/SellerRestaurantForm";
import AdminRestaurants from "../pages/AdminRestaurants";

import FoodDetails from "../pages/FoodDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderHistory from "../pages/OrderHistory";
import OrderTracking from "../pages/OrderTracking";
import SellerMenu from "../pages/SellerMenu";

function AppRoutes() {

  return (

    <Routes>

      <Route element={<PageLayout />}>

        {/* PUBLIC ROUTES */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PUBLIC RESTAURANT BROWSING */}

        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<RestaurantMenu />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* AUTHENTICATED USER */}

        <Route element={<ProtectedRoute />}>

          <Route path="/dashboard" element={<Dashboard />} />

        </Route>

        <Route element={<ProtectedRoute role="customer" />}>

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderTracking />} />

        </Route>

        {/* SELLER ROUTES */}

        <Route element={<ProtectedRoute role="seller" />}>

          <Route
            path="/seller/restaurant/create"
            element={<SellerRestaurantForm />}
          />

          <Route path="/seller/menu/:id" element={<SellerMenu />} />

          <Route
            path="/seller/restaurant/edit/:id"
            element={<SellerRestaurantForm />}
          />

        </Route>

        {/* ADMIN ROUTES */}

        <Route element={<ProtectedRoute role="admin" />}>

          <Route
            path="/admin/restaurants"
            element={<AdminRestaurants />}
          />

        </Route>

      </Route>

      {/* FALLBACK */}

      <Route path="*" element={<h1>404 Page Not Found</h1>} />

    </Routes>

  );

}

export default AppRoutes;
