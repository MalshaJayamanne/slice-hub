
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


