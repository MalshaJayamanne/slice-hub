# 🍕 Slice Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**Slice Hub** is a premium, full-stack MERN ecosystem designed for seamless food discovery, ordering, and management. It features a triple-role architecture (Customer, Seller, Admin) with modern UI/UX, real-time feedback loops, and AI-powered assistance.

---

## ✨ Key Features

### 👤 Customer Experience
- **Smart Discovery**: Browse restaurants with intuitive filtering and high-quality visuals.
- **Dynamic Cart**: Real-time cart management with instant price calculations.
- **Order Tracking**: Live progress monitoring from preparation to delivery.
- **Feedback Loop**: Integrated star-rating and review system for dishes and restaurants.
- **Payment History**: Comprehensive view of all past transactions and invoices.

### 🏪 Seller Management
- **Menu Control**: Full CRUD operations for menu items with availability toggles.
- **Order Command Center**: Manage incoming orders, update statuses, and track sales.
- **Restaurant Profile**: Custom setup for restaurant branding and descriptions.
- **Analytics Overview**: Visual insights into restaurant performance.

### 🛡️ Admin Command Center
- **User Oversight**: Manage customer and seller accounts across the platform.
- **Establishment Control**: Review and moderate restaurant listings.
- **System Monitoring**: Full visibility into platform-wide order flow and activity.
- **Role-Based Security**: Advanced access control for sensitive operations.

### 🤖 Smart & Modern Capabilities
- **AI Assistant**: Integrated AI support to help users navigate and discover food.
- **Glassmorphism UI**: A sleek, futuristic dashboard design with smooth animations.
- **Bento-style Layouts**: Clean, modular information display for maximum clarity.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI & Icons**: Lucide React, Custom CSS (Glassmorphism)
- **Data Fetching**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT (JSON Web Tokens), Bcrypt.js
- **Environment**: Dotenv

---

## 📁 Project Structure

```text
slice-hub/
├── backend/                # Express API
│   ├── src/
│   │   ├── controllers/    # Route controllers (Auth, Food, Order, Review, AI)
│   │   ├── models/         # Mongoose Schemas (User, Food, Restaurant, Order, Review)
│   │   ├── routes/         # API Endpoints
│   │   ├── middleware/     # Auth & Role-based security
│   │   └── config/         # DB & Environment configs
│   └── .env.example        # Environment template
├── frontend/               # React + Vite Client
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Modals, Cards, AI)
│   │   ├── pages/          # Dashboard & Public pages
│   │   ├── store/          # Redux Toolkit slices
│   │   └── assets/         # Static media & styles
│   └── vite.config.js      # Build config
├── README.md               # Project documentation
└── SRS.md                  # Software Requirements Specification
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB
- NPM or Yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MalshaJayamanne/slice-hub.git
   cd slice-hub
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   cp .env.example .env
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

Open two terminals in the root directory:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

---

## 🔑 Environment Variables

Required variables in `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ by [Malsha Jayamanne](https://github.com/MalshaJayamanne)
