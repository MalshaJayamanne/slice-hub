
### Final split

**Developer 1 (You)**

* Authentication
* Restaurant management
* Customer side core logic
* Cart / checkout backend
* Order tracking

**Developer 2 (Friend)**

* Seller side
* Admin side
* Food management
* Seller order handling
* Admin controls

This fits the project modules in the SRS: authentication, restaurant discovery, menu/food management, cart, checkout, order tracking, seller dashboard, and admin dashboard. 

---

# 5-Week Timeline

# Week 1 — Project setup + authentication foundation

## Goal

Set up the full project structure and make login/register work.

## Developer 1

* Create backend project structure
* Configure Express server
* Connect MongoDB
* Add environment variables
* Create `User` model
* Create auth routes:

  * register
  * login
* Hash passwords with bcrypt
* Generate JWT
* Create auth middleware
* Create role-check middleware
* Test auth APIs with Postman

## Developer 2

* Clean frontend structure
* Set up routing
* Create common layout:

  * navbar
  * footer
  * page container
* Build:

  * login page
  * register page
* Connect auth APIs with Axios
* Store token on login
* Add protected route handling in frontend
* Build basic home page skeleton

## End of Week 1 deliverables

* Frontend and backend folders organized
* MongoDB connected
* Register/login working
* JWT working
* Protected routes working

---

# Week 2 — Restaurant management

## Goal

Complete restaurant module because it is a core entity for customer, seller, and admin flows. 

## Developer 1

* Create `Restaurant` model
* Add restaurant fields:

  * name
  * ownerId
  * description
  * category
  * image
  * status
* Build restaurant APIs:

  * create restaurant
  * get all restaurants
  * get single restaurant
  * update restaurant
  * delete restaurant
* Add search by name
* Add filter by category/cuisine
* Add role protection for seller/admin actions
* If needed, add approval logic

## Developer 2

* Build restaurant UI pages:

  * restaurant list page
  * restaurant details page
  * seller restaurant create/edit page
  * admin restaurant management page
* Connect restaurant APIs
* Show restaurant cards
* Add search bar
* Add filter UI
* Add loading and error states

## End of Week 2 deliverables

* Restaurant CRUD done
* Restaurant list visible on frontend
* Search/filter works
* Seller/admin restaurant pages started or completed

---

# Week 3 — Food management + customer browsing

## Goal

Make menus work fully.

## Developer 1

* Support restaurant-food relationship clearly
* Help finalize API structure used by food module
* Review shared validation rules
* Support any backend dependency needed by food APIs

## Developer 2

* Create `Food` model and food CRUD APIs
* Build seller food management pages:

  * add food
  * edit food
  * delete food
* Build customer menu page
* Build food details page
* Show:

  * name
  * price
  * category
  * image
  * availability
* Add search where applicable
* Connect foods to restaurants properly

## End of Week 3 deliverables

* Seller can manage food items
* Customer can open restaurant and view menu
* Food details page works

---

# Week 4 — Cart + checkout + order creation

## Goal

Make customers able to place orders.

## Developer 1

* Create `Order` model
* Create order item structure
* Build cart/checkout backend logic
* Create place-order API
* Validate order data
* Store:

  * customer
  * restaurant
  * items
  * total
  * delivery address
  * timestamps
  * status
* Create order history API
* Create order tracking API
* Define order statuses:

  * Pending
  * Preparing
  * Delivered
  * optional later: Cancelled 

## Developer 2

* Build cart page
* Add:

  * add item
  * remove item
  * update quantity
* Build checkout page
* Add delivery/contact form
* Connect place-order API
* Build customer order history page
* Build order tracking UI

## End of Week 4 deliverables

* Customer can add items to cart
* Customer can checkout
* Order is saved in database
* Customer can view order history and status

---

# Week 5 — Seller orders + admin + final polish

## Goal

Finish management side and prepare final submission/demo.

## Developer 1

* Help finalize seller order APIs if needed
* Build/update tracking-related backend fixes
* Review security and role access
* Review validation and error handling
* Help integrate final shared logic
* Fix bugs in auth, restaurant, order flow

## Developer 2

* Build seller orders page
* Build seller order status update flow
* Build admin dashboard
* Build admin users page
* Build admin restaurant management page
* Build platform order monitoring page
* Connect admin and seller APIs
* Improve UI consistency

## Both

* Test all roles:

  * customer
  * seller
  * admin
* Fix integration issues
* Add loading states
* Add clear success/error messages
* Clean README
* Prepare screenshots/demo
* Final bug fixing

## End of Week 5 deliverables

* Seller can process orders
* Admin can manage platform basics
* Full end-to-end demo is ready

## Detailed Week 5 execution plan

### Current starting point in this repo

* Customer checkout, order history, and tracking already exist
* `frontend/src/pages/SellerOrders.jsx` is still empty
* `frontend/src/pages/AdminUsers.jsx` is still empty
* `frontend/src/pages/AdminDashboard.jsx` is only a placeholder
* `backend/src/controllers/adminController.js` and `backend/src/routes/adminRoutes.js` are still placeholders
* `frontend/src/api/orderAPI.js` only covers customer order calls
* `frontend/src/routes/AppRoutes.jsx` does not yet expose seller orders, admin dashboard, admin users, or platform order monitoring routes
* `frontend/src/pages/AdminRestaurants.jsx` already exists, but it expects metrics like total orders and revenue that are not clearly provided by the current backend response

### Priority order for Week 5

1. Freeze seller and admin API contract first
2. Complete seller order processing flow
3. Complete admin management pages and backend endpoints
4. Run full cross-role integration testing
5. Polish UX, documentation, and demo assets

### Day 1 - API contract + scaffolding

#### Developer 1

* Review all existing order, restaurant, auth, and role middleware flows
* Finalize the seller order API contract:

  * get seller orders
  * get single seller-accessible order
  * update order status
* Finalize the admin API contract:

  * dashboard summary
  * users list
  * restaurants list/approval support
  * platform order monitoring list
* Confirm exact response shapes so frontend pages do not guess field names
* Add missing backend route/controller scaffolding for admin APIs

#### Developer 2

* Add route placeholders in `AppRoutes.jsx` for:

  * seller orders
  * admin dashboard
  * admin users
  * admin restaurants
  * admin platform orders
* Scaffold the missing pages with loading, empty, and error states first
* Reuse existing dashboard styling so Week 5 pages feel consistent from the start

#### Both

* Agree on one shared status list: `Pending`, `Preparing`, `Delivered`
* Agree on one shared error message format
* Agree on which pages are required for the final demo and which ones can stay minimal

### Week 5 shared agreements

#### Shared order status list

* Use only these order statuses in Week 5:

  * `Pending`
  * `Preparing`
  * `Delivered`
* Meaning:

  * `Pending` = customer placed the order and seller has not finished processing it yet
  * `Preparing` = seller is actively working on the order
  * `Delivered` = order is complete
* Do not add extra statuses like `Cancelled`, `Rejected`, or `Ready` during Week 5 unless both developers update backend, frontend, and demo flow together

#### Shared error message format

* Backend API error shape for Week 5:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

* Frontend should always read `response.data.message` first
* If no API message exists, use a short fallback such as:

  * `Failed to load data.`
  * `Failed to save changes.`
  * `Something went wrong.`
* Keep error messages short, clear, and user-facing
* Do not mix multiple backend error keys like `error`, `msg`, and `message` in Week 5

#### Final demo pages required

These pages must work clearly enough to support the final end-to-end demo:

* `Login`
* `Register`
* `RestaurantList`
* `RestaurantMenu`
* `Cart`
* `Checkout`
* `OrderHistory`
* `OrderTracking`
* `SellerOrders`
* `AdminDashboard`
* `AdminRestaurants`
* `AdminOrders`

#### Pages allowed to stay minimal

These pages should load correctly, but they do not need deep polish for the final demo:

* `AdminUsers` can stay read-only
* `SellerMenu` can stay as a basic management page
* `SellerRestaurantForm` only needs to work, not look perfect
* `FoodDetails` can stay simple if `RestaurantMenu` already supports ordering well
* `Dashboard` only needs to navigate correctly to the important flows

#### Demo rule

* Prioritize pages that prove the full customer -> seller -> admin flow
* If time is short, polish the required demo pages first and keep the minimal pages stable but simple

### Day 2 - Seller order flow

#### Developer 1

* Finish seller order fetch endpoint if missing
* Tighten seller access checks so sellers only see their own restaurant orders
* Review order status update validation
* Make sure tracking and seller update flow stay in sync
* Fix any backend issues affecting auth, restaurant ownership, or order access

#### Developer 2

* Build `SellerOrders.jsx`
* Show seller order list with:

  * order id
  * customer name
  * items
  * total
  * created time
  * current status
* Build seller status update UI using the backend status flow
* Add success and error feedback after status changes
* Add disabled/loading states while updates are in progress

#### Both

* Test the full seller journey:

  * seller logs in
  * seller opens orders
  * seller updates order status
  * customer sees updated tracking status

### Day 3 - Admin management flow

#### Developer 1

* Implement admin endpoints for:

  * dashboard summary counts
  * users list
  * order monitoring list
* Recheck role protection on all admin routes
* Validate admin-side filters and query params
* Support any missing restaurant metrics needed by admin pages, or simplify the frontend expectations

#### Developer 2

* Build `AdminDashboard.jsx` with summary cards only first
* Build `AdminUsers.jsx`
* Finish/improve `AdminRestaurants.jsx`
* Build platform order monitoring page
* Connect all admin pages to live APIs

#### Both

* Verify admin can:

  * view summary data
  * view users
  * review restaurants
  * monitor platform orders

### Day 4 - Integration + role testing

#### Developer 1

* Review all protected routes and backend authorization rules again
* Fix edge cases in validation and error handling
* Clean shared backend logic where seller/admin/customer flows overlap

#### Developer 2

* Improve UI consistency across seller, admin, and customer pages
* Add final loading states everywhere they are still missing
* Add clear success/error alerts on forms and action buttons
* Fix navigation gaps from dashboard to Week 5 pages

#### Both

* Run full role-based testing:

  * customer
  * seller
  * admin
* Test protected-route failures:

  * customer blocked from seller/admin pages
  * seller blocked from admin pages
  * seller blocked from other sellers' orders/restaurants
* Record every issue in one shared bug list and close the blocking ones first

### Day 5 - Final polish + submission prep

#### Developer 1

* Final backend cleanup
* Final auth/order/restaurant bug fixing
* Sanity-check all API responses used in the demo

#### Developer 2

* Final frontend polish
* README cleanup and feature/status update
* Prepare screenshots
* Prepare demo path and presenter notes

#### Both

* Run one complete end-to-end demo rehearsal:

  * register/login
  * browse restaurants
  * add to cart
  * checkout
  * view tracking
  * seller updates order
  * admin reviews platform
* Fix final blocking bugs only
* Freeze code for submission/demo

### Definition of done for Week 5

* Seller can open a dedicated orders page and update order status successfully
* Customer tracking reflects seller status changes correctly
* Admin dashboard, users, restaurants, and order monitoring pages all load real data
* Role-based access works correctly for customer, seller, and admin
* Loading, success, and error states exist on all main Week 5 flows
* README reflects the real setup and feature status
* Screenshots and demo flow are ready before the final day ends

### Main risks to watch this week

* Frontend pages expecting fields the backend does not return yet
* Missing routes causing dashboard links or direct URLs to fail
* Seller/admin access rules breaking when testing with real role accounts
* Final-day time loss from leaving README, screenshots, and demo prep too late

---

# Daily work plan

Use this every day:

## Daily routine

* 15 min: discuss today's tasks
* 2 to 4 hours: development
* 15 min: update each other
* push code to GitHub daily

## What to discuss daily

* what is completed
* what is blocked
* what API changed
* what needs testing

---

# Git workflow

## Branches

* `main` = stable code
* `dev` = integration branch
* feature branches for each task

## Example branches

* `feature/auth-backend`
* `feature/auth-frontend`
* `feature/restaurant-api`
* `feature/restaurant-ui`
* `feature/food-management`
* `feature/cart-checkout`
* `feature/order-tracking`
* `feature/seller-dashboard`
* `feature/admin-dashboard`

## Rule

Never code directly in `main`.

---

# Recommended milestone checkpoints

## End of Week 1

Show:

* login
* register
* protected route

## End of Week 2

Show:

* restaurant list
* restaurant create/edit
* search/filter

## End of Week 3

Show:

* seller food CRUD
* customer menu browsing

## End of Week 4

Show:

* cart
* checkout
* order placement
* tracking

## End of Week 5

Show:

* seller orders
* admin dashboard
* full project demo

---

# Simple ownership map

## Developer 1

* backend foundation
* auth
* restaurant backend
* order backend
* customer order logic
* tracking

## Developer 2

* frontend foundation
* restaurant UI
* food management full flow
* seller UI
* admin UI
* seller order UI

---

# Best start order

Start in this exact order:

1. auth
2. restaurant
3. food/menu
4. cart
5. checkout/order
6. seller orders
7. admin
8. polish

That order follows the dependency flow in your SRS and makes integration easier. 

---

# Final advice

Do not try to build all dashboards first.
First make the **core customer flow work**:

* login
* browse restaurant
* view menu
* add to cart
* checkout
* track order

Then finish seller and admin.


