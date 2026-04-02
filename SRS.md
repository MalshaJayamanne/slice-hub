# Software Requirements Specification (SRS)

## Slice Hub - Food Ordering Web Application (Planned MERN Stack)

Version: 1.0  
Date: 2026-04-02  
Project Repository: `c:\Projects\slice-hub`

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the requirements for **Slice Hub**, a food ordering web application intended to be built with the MERN stack. The system is designed to support three primary user roles:

- Customer
- Seller (restaurant owner/operator)
- Admin

This document is intended for developers, project supervisors, testers, and stakeholders. It describes the business goals, scope, features, interfaces, constraints, and quality requirements for the project.

### 1.2 Project Background

Slice Hub is being developed as a portfolio-level full-stack web system. The target product allows customers to browse restaurants and menu items, manage a cart, place food orders, and track order progress. It also provides operational tools for sellers to manage menus and orders, and for administrators to monitor and control the platform.

### 1.3 Scope

The target system will:

- Provide a web platform for restaurant discovery and food ordering
- Support authentication and authorization for multiple user roles
- Allow customers to browse restaurants, view menus, add items to cart, and place orders
- Allow sellers to manage menus and incoming orders
- Allow admins to manage users, restaurants, and platform-level activity
- Support future integration with payments, real-time tracking, and AI-powered assistance

### 1.4 Current Repository Status

This SRS is based on the current repository contents as of **2026-04-02**.

Observed implementation status:

- Frontend exists as a React + Vite project
- `App.jsx` currently renders only a minimal heading
- Most pages and components are scaffolded as empty placeholder files
- Frontend dependencies include `react-router-dom`, `axios`, `@reduxjs/toolkit`, and `react-redux`
- A backend directory exists but currently contains no source files
- The README describes the intended multi-role food ordering platform, including customer, seller, and admin capabilities

Therefore, this SRS covers:

- The **intended full MERN product**
- The **baseline currently present in the repository**
- The **planned modules implied by the existing project structure**

### 1.5 Definitions and Acronyms

- SRS: Software Requirements Specification
- MERN: MongoDB, Express.js, React, Node.js
- Customer: End user who browses food and places orders
- Seller: Restaurant owner or operator managing menu items and orders
- Admin: Platform administrator with system-wide control
- Cart: Temporary collection of selected menu items before checkout
- Order: A confirmed purchase request created by a customer
- JWT: JSON Web Token used for authentication
- REST API: HTTP-based service interface between frontend and backend

## 2. Overall Description

### 2.1 Product Perspective

Slice Hub is a web-based client-server application.

- The frontend is a React single-page application
- The backend will expose REST APIs using Node.js and Express.js
- MongoDB will store persistent business data
- Users access the system through modern web browsers

At present, the repository contains only the frontend scaffold and no implemented backend logic.

### 2.2 Product Goals

- Deliver a clean and scalable food ordering platform
- Demonstrate real-world full-stack architecture for portfolio use
- Support role-based workflows across customer, seller, and admin users
- Provide a foundation that can later support payments, real-time updates, and AI features

### 2.3 User Classes and Characteristics

#### Customer

- Registers and logs into the platform
- Browses restaurants and food menus
- Adds items to cart and places orders
- Tracks and reviews order history

#### Seller

- Manages one or more restaurant menus
- Adds, edits, and removes food items
- Receives and updates order statuses
- Monitors basic sales and order activity

#### Admin

- Oversees the full platform
- Manages users and restaurants
- Reviews orders and platform activity
- Handles approvals, moderation, and operational control

### 2.4 Operating Environment

#### Client

- Web browsers: Chrome, Edge, Firefox, Safari
- Responsive UI for desktop and mobile devices

#### Server

- Node.js runtime
- Express.js web framework

#### Database

- MongoDB database server

#### Development Tools

- Vite
- ESLint
- Git and GitHub

### 2.5 Design and Implementation Constraints

- The intended architecture must remain within the MERN stack
- The current product target is web-only
- Initial release should use REST APIs rather than GraphQL
- Authentication should be JWT-based
- Passwords must be hashed, not stored in plain text
- The project is being developed incrementally, feature by feature

### 2.6 Assumptions and Dependencies

- Users have internet access and a modern browser
- Sellers maintain menu and order data accurately
- Admins perform moderation and management tasks manually
- MongoDB and backend hosting will be available in later phases
- Frontend-backend integration depends on backend APIs that are not yet implemented in the current repository

## 3. System Features

### 3.1 Authentication and Authorization

The system shall provide secure registration, login, and role-based access control.

Functional requirements:

- FR-01: Users shall be able to register with name, email, and password
- FR-02: Users shall be able to log in using email and password
- FR-03: The system shall hash passwords using a secure algorithm such as bcrypt
- FR-04: The system shall issue JWTs after successful authentication
- FR-05: The system shall restrict route and API access based on user role
- FR-06: The system shall support at least three roles: customer, seller, and admin
- FR-07: The system shall allow authenticated users to log out

### 3.2 Restaurant Discovery

The system shall allow customers to browse available restaurants.

Functional requirements:

- FR-08: The system shall display a list of restaurants
- FR-09: Users shall be able to view basic restaurant information
- FR-10: Users shall be able to search restaurants by name
- FR-11: Users shall be able to filter restaurants by category or cuisine
- FR-12: The system shall support restaurant approval visibility rules managed by admins

### 3.3 Menu and Food Management

The system shall support viewing and management of food items.

Functional requirements:

- FR-13: Customers shall be able to view a restaurant's menu
- FR-14: Customers shall be able to view food item details
- FR-15: Sellers shall be able to add food items
- FR-16: Sellers shall be able to edit food items
- FR-17: Sellers shall be able to delete food items
- FR-18: Each food item shall include at least name, price, category, image, and availability status
- FR-19: The system shall support menu categorization
- FR-20: Users shall be able to search food items where applicable

### 3.4 Cart Management

The system shall support shopping cart behavior for customers.

Functional requirements:

- FR-21: Customers shall be able to add menu items to cart
- FR-22: Customers shall be able to change item quantities in cart
- FR-23: Customers shall be able to remove items from cart
- FR-24: The system shall calculate subtotal, fees if any, and total price
- FR-25: Cart contents shall persist for the active user session

### 3.5 Checkout and Ordering

The system shall support order placement from cart contents.

Functional requirements:

- FR-26: Customers shall be able to proceed to checkout
- FR-27: The system shall capture delivery and contact details
- FR-28: The system shall validate order data before submission
- FR-29: The system shall create an order record in the database
- FR-30: The system shall store ordered items, total amount, timestamps, and status
- FR-31: The system shall confirm successful order placement to the customer

### 3.6 Order Tracking and History

The system shall allow customers and sellers to monitor order progress.

Functional requirements:

- FR-32: Customers shall be able to view order history
- FR-33: Customers shall be able to view the current status of each order
- FR-34: Sellers shall be able to view incoming orders for their restaurant
- FR-35: Sellers shall be able to update order status
- FR-36: Admins shall be able to view all platform orders
- FR-37: Supported order statuses shall include at minimum `Pending`, `Preparing`, and `Delivered`
- FR-38: The system should support additional statuses such as `Cancelled` in later phases

### 3.7 Seller Dashboard

The system shall provide seller-facing operational views.

Functional requirements:

- FR-39: Sellers shall have access to a dashboard
- FR-40: Sellers shall be able to view their menu items
- FR-41: Sellers shall be able to review active and past orders
- FR-42: Sellers shall be able to update order statuses through the UI
- FR-43: The system should provide summary statistics such as total orders or revenue in later iterations

### 3.8 Admin Dashboard

The system shall provide platform management features for admins.

Functional requirements:

- FR-44: Admins shall have access to an admin dashboard
- FR-45: Admins shall be able to view all registered users
- FR-46: Admins shall be able to manage restaurant/seller records
- FR-47: Admins shall be able to review all orders
- FR-48: Admins shall be able to approve or reject restaurants if that workflow is adopted
- FR-49: Admins should be able to view system summaries and analytics

### 3.9 AI Assistant

The frontend contains a placeholder `AIAssistant.jsx` component, indicating a possible future AI feature.

Functional requirements for a future phase:

- FR-50: The system may provide AI-assisted support or recommendations
- FR-51: The AI assistant may help users discover food or navigate the platform
- FR-52: AI-generated content shall be clearly presented as assistance, not as a guaranteed operational decision source

## 4. External Interface Requirements

### 4.1 User Interface Requirements

The user interface shall:

- Provide a responsive layout for desktop and mobile devices
- Offer role-appropriate navigation
- Display clear feedback for loading, success, and error states
- Use accessible form labels and validation messages
- Present restaurant, menu, cart, and order information in a clear and consistent way

Planned primary screens based on current frontend file structure:

- Home
- Restaurant Menu
- Food Details
- Cart
- Checkout
- Order Tracking
- Customer Dashboard
- Seller Dashboard
- Seller Menu
- Seller Orders
- Admin Dashboard
- Admin Restaurants
- Admin Users

### 4.2 Software Interface Requirements

#### Frontend to Backend

- Communication shall occur through REST APIs over HTTP/HTTPS
- JSON shall be used for requests and responses
- Authenticated requests shall include JWT bearer tokens

#### Backend to Database

- The backend shall interact with MongoDB using a suitable ODM such as Mongoose

### 4.3 Communications Interface Requirements

- The application shall operate over standard web protocols
- HTTPS should be used in deployed environments

## 5. Data Requirements

### 5.1 Core Entities

#### User

Minimum fields:

- `_id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Optional fields:

- `phone`
- `address`
- `profileImage`
- `isActive`

#### Restaurant

Minimum fields:

- `_id`
- `name`
- `ownerId`
- `description`
- `category`
- `image`
- `status`
- `createdAt`
- `updatedAt`

#### Food

Minimum fields:

- `_id`
- `restaurantId`
- `name`
- `description`
- `price`
- `category`
- `image`
- `isAvailable`
- `createdAt`
- `updatedAt`

#### Order

Minimum fields:

- `_id`
- `customerId`
- `restaurantId`
- `items[]`
- `totalPrice`
- `status`
- `deliveryAddress`
- `createdAt`
- `updatedAt`

#### Order Item

Minimum fields:

- `foodId`
- `name`
- `price`
- `quantity`
- `lineTotal`

### 5.2 Data Relationships

- One user may place many orders
- One seller may manage one or more restaurants
- One restaurant may contain many food items
- One order belongs to one customer and one restaurant
- One order contains many order items

## 6. Use Cases

### 6.1 Customer Use Cases

- Register account
- Log in
- Browse restaurants
- View menu
- View food details
- Add items to cart
- Remove or update cart items
- Checkout
- Place order
- View order history
- Track order status

### 6.2 Seller Use Cases

- Log in
- Access seller dashboard
- Add food item
- Edit food item
- Delete food item
- View incoming orders
- Update order status

### 6.3 Admin Use Cases

- Log in
- Access admin dashboard
- View and manage users
- View and manage restaurants
- View all orders
- Monitor platform activity

## 7. Typical System Workflows

### 7.1 Place Order Workflow

1. Customer browses restaurants and opens a menu
2. Customer selects food items and adds them to cart
3. Customer reviews cart contents
4. Customer proceeds to checkout
5. Frontend sends order request to backend
6. Backend validates the request and stores the order in MongoDB
7. Backend returns an order confirmation response
8. Frontend displays confirmation and order tracking details

### 7.2 Seller Order Processing Workflow

1. Seller logs into the dashboard
2. Seller views incoming orders
3. Seller opens a specific order
4. Seller updates order status from `Pending` to `Preparing`
5. Seller later updates the status to `Delivered`
6. Customer sees updated status in order tracking

## 8. Non-Functional Requirements

### 8.1 Performance

- NFR-01: Common page interactions should respond within 2 to 3 seconds under normal load
- NFR-02: API responses should be optimized for typical user operations
- NFR-03: The system should support multiple concurrent users without major degradation

### 8.2 Security

- NFR-04: Passwords must be hashed using bcrypt or equivalent
- NFR-05: JWT-based authentication must protect secured routes
- NFR-06: Role-based authorization must protect seller and admin actions
- NFR-07: All inputs must be validated on both client and server sides
- NFR-08: The system should mitigate common web risks such as XSS, injection attacks, and insecure direct object access
- NFR-09: Sensitive secrets must be stored in environment variables

### 8.3 Usability

- NFR-10: The interface shall be simple and understandable for first-time users
- NFR-11: The application shall be responsive across common screen sizes
- NFR-12: Error and success messages shall be clear and actionable

### 8.4 Reliability and Availability

- NFR-13: The deployed system should target at least 99% uptime
- NFR-14: The system shall handle errors gracefully without exposing internal details
- NFR-15: Order data shall remain consistent in the event of recoverable failures

### 8.5 Maintainability

- NFR-16: The codebase should follow modular structure for frontend and backend features
- NFR-17: Components, routes, controllers, and models should be separated clearly
- NFR-18: The project should remain easy to extend with new modules such as payments and notifications

### 8.6 Scalability

- NFR-19: The system should support increased numbers of users, restaurants, and orders
- NFR-20: The architecture should allow future horizontal scaling of backend services

### 8.7 Compatibility

- NFR-21: The frontend shall support major modern browsers
- NFR-22: The system shall remain functional across desktop and mobile layouts

## 9. Validation and Testing Requirements

- Unit testing should cover critical business logic
- API testing should verify request and response behavior
- Integration testing should confirm frontend-backend interaction
- Role-based access paths should be tested for customer, seller, and admin users
- Cart and order calculations should be validated for correctness
- Error handling and invalid input scenarios should be tested

## 10. Project Organization and Delivery Notes

### 10.1 Suggested Development Approach

The repository notes indicate a feature-based development workflow, where team members own features end-to-end rather than splitting strictly by frontend and backend.

Suggested feature areas:

- Authentication
- Restaurant and menu management
- Cart and checkout
- Order lifecycle
- Seller dashboard
- Admin dashboard

### 10.2 Team Roles from Project Notes

- Developer 1: backend-heavy and core logic focus
- Developer 2: frontend-heavy and UX focus

This distribution is organizational guidance only and does not change system requirements.

### 10.3 Git Workflow

Suggested branch model from project notes:

- `main` for stable code
- `dev` for active integration
- feature branches for isolated work

## 11. Future Enhancements

- Online payments through Stripe or similar
- Real-time order updates with Socket.io
- Notification system for customers and sellers
- Recommendation engine
- AI-powered assistant or food suggestions
- Mobile application support
- Ratings and reviews
- Promotions and discount codes

## 12. Risks and Gaps Identified from Current Repository

Based on the current project state:

- The backend has not yet been implemented
- The frontend route structure is planned but not functionally wired
- Most screens are placeholders with no logic
- The README currently contains unresolved merge conflict markers and should be cleaned
- The declared project scope is larger than the currently implemented software baseline

These gaps do not invalidate the project, but they should be tracked during development and planning.

## 13. Conclusion

Slice Hub is intended to become a multi-role food ordering platform built with the MERN stack. The current repository provides an early frontend scaffold and a clear roadmap toward a larger product that includes customer ordering, seller operations, and admin management. This SRS defines that target system in a structured way while also documenting the present implementation baseline so the project can move forward with clearer requirements, delivery priorities, and technical direction.
