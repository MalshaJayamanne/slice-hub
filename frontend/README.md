<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# 🍔 Food Ordering System – Slice Hub

A modern **E-Commerce Food Ordering Web Application** built using **React and Vite**.

This project is part of a **MERN Stack Food Delivery Platform** that supports multiple user roles including **Customer, Seller (Restaurant Owner), and Admin**.

The system allows customers to browse restaurants, order food, and track orders while enabling sellers and administrators to manage menus, orders, and platform operations.

---

# 🚀 Tech Stack

Frontend technologies used in this project:

- React.js
- Vite
- JavaScript (ES6+)
- CSS
- React Router (for navigation)
- Axios (for API requests)
- Redux Toolkit (for state management – optional)

---

# 👥 User Roles

The system supports three main user roles:

## Customer
- Browse restaurants
- View food menus
- Add food to cart
- Place orders
- Track orders
- Manage profile

## Seller (Restaurant Owner)
- Manage restaurant menu
- Add / edit / delete food items
- View incoming orders
- Update order status
- View sales analytics

## Admin
- Manage users
- Approve restaurants
- Monitor orders
- Manage platform promotions
- View system analytics

---

# 📂 Project Structure

```
food-ordering-system
│
├── public
│
├── src
│   ├── components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── FoodCard.jsx
│   │   ├── RestaurantCard.jsx
│   │   ├── StarRating.jsx
│   │   └── Footer.jsx
│   │
│   ├── pages
│   │   ├── Home.jsx
│   │   ├── RestaurantMenu.jsx
│   │   ├── FoodDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SellerDashboard.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── constants.js
│
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the repository

```
git clone https://github.com/MalshaJayamanne/slice-hub.git
```

## 2. Navigate to the project folder

```
cd slice-hub
```

## 3. Install dependencies

```
npm install
```

## 4. Run the development server

```
npm run dev
```

The application will start on:

```
http://localhost:5173
```

---

# 📱 Features (Planned)

- Restaurant listing
- Food menu browsing
- Cart management
- Secure checkout
- Order tracking
- Seller dashboard
- Admin management panel
- Multi-user authentication
- Responsive design

---

# 🔮 Future Development

Upcoming features:

- Backend API using **Node.js + Express**
- Database integration with **MongoDB**
- Authentication using **JWT**
- Payment gateway integration
- Order notifications
- Real-time order tracking

---

# 🤝 Collaboration

This project is developed collaboratively.

Team members can contribute by:

1. Creating a new branch
2. Implementing new features
3. Submitting pull requests

Example workflow:

```
git checkout -b new-feature
git add .
git commit -m "Added new feature"
git push origin new-feature
```

---


>>>>>>> eecdfa422f2cad9e3ef5632443cdaff5d3416040
