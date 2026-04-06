# Slice Hub

Slice Hub is a MERN-style food ordering project with separate `frontend` and `backend` apps. The platform is planned to support three user roles:

- Customer
- Seller
- Admin

The current repository includes:

- A React + Vite frontend scaffold
- A Node.js + Express backend foundation
- MongoDB connection setup with Mongoose
- Authentication foundation with register/login, password hashing, JWT, and auth middleware
- Project requirements in [SRS.md](./SRS.md)

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- Axios
- Redux Toolkit

### Backend

- Node.js
- Express.js
- MongoDB Atlas / MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken

## Project Structure

```text
slice-hub/
|-- backend/
|   |-- .env
|   |-- .env.example
|   |-- .gitignore
|   |-- package.json
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- config/
|       |   `-- db.js
|       |-- controllers/
|       |   `-- authController.js
|       |-- middleware/
|       |   |-- authMiddleware.js
|       |   |-- errorMiddleware.js
|       |   `-- roleMiddleware.js
|       |-- models/
|       |   |-- Food.js
|       |   |-- Order.js
|       |   |-- Restaurant.js
|       |   `-- User.js
|       `-- routes/
|           |-- adminRoutes.js
|           |-- authRoutes.js
|           |-- foodRoutes.js
|           |-- orderRoutes.js
|           `-- restaurantRoutes.js
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   |-- public/
|   `-- src/
|       |-- assets/
|       |-- components/
|       |-- pages/
|       |-- routes/
|       |-- App.jsx
|       |-- constants.js
|       |-- index.css
|       `-- main.jsx
|-- README.md
|-- SRS.md
`-- Split work.md
```

## Environment Variables

Backend environment variables live in `backend/.env`.

Required values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

Use [backend/.env.example](./backend/.env.example) as the template.

## Install Commands

Run these commands from the project root:

```powershell
cd frontend
npm install
```

```powershell
cd backend
npm install
```

## Run Commands

### Run Frontend

```powershell
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### Run Backend

```powershell
cd backend
npm run dev
```

If you want to run without nodemon:

```powershell
cd backend
npm start
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Full Project Run Order

Open two terminals.

Terminal 1:

```powershell
cd c:\Projects\slice-hub\backend
npm run dev
```

Terminal 2:

```powershell
cd c:\Projects\slice-hub\frontend
npm run dev
```

Then open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000/api/health
```

## Available Backend Auth APIs

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Example body:

```json
{
  "name": "Kavindu",
  "email": "kavindu@example.com",
  "password": "12345678",
  "role": "customer"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Example body:

```json
{
  "email": "kavindu@example.com",
  "password": "12345678"
}
```

## Current Status

Implemented now:

- Backend project structure
- Express server setup
- MongoDB connection setup
- Environment variable setup
- `User` model
- Auth register/login routes
- Password hashing with bcrypt
- JWT generation
- Auth middleware
- Role-check middleware

Still in progress:

- Restaurant APIs
- Food APIs
- Order APIs
- Frontend integration of all backend features

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

## Documentation

- Requirements: [SRS.md](./SRS.md)
- Task split: [Split work.md](./Split%20work.md)

## Notes

- Do not commit `backend/.env`
- Rotate exposed database credentials if they were shared publicly
- Update this README as new APIs and frontend pages are completed
