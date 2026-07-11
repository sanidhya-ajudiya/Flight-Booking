# SkyWings Flight Booking System - Backend Server

This is the production-ready Node.js, Express.js, and MongoDB backend for the SkyWings Flight Booking System. It integrates fully with the Angular frontend using JWT Authentication and REST APIs.

## Tech Stack
- **Node.js & Express.js** - Application server framework
- **MongoDB & Mongoose** - Database and object data modeling
- **JWT & bcryptjs** - Secure authentication & password hashing
- **Nodemailer** - Transacational email notifications (confirmations, cancellations, tickets)
- **Multer** - Profile avatar file uploads
- **Morgan & Helmet** - HTTP logging and security headers
- **CORS** - Cross-origin resource sharing configured for Angular dev server
- **Express Validator** - Request input validation middleware
- **Express Rate Limit** - Security protection against brute-force and request flooding

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or a MongoDB Atlas URI)

### 2. Installation
Navigate to the `server` directory and install the dependencies:
```bash
cd server
npm install
```

### 3. Environment Configuration
Verify that the `.env` file exists in the `server` directory. The template is defined in `.env.example`:
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/flight-booking
JWT_SECRET=skywings_super_secure_jwt_secret_key_2026
JWT_REFRESH_SECRET=skywings_super_secure_jwt_refresh_secret_key_2026
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d
```

### 4. Seed the Database
Seed the database with default users (Admin & Customer), airports, airlines, coupons, and 480 flights scheduled for the upcoming week:
```bash
node utils/seeder.js
```

### 5. Start the Server
Run in development mode with live-reloads:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## Default Credentials
Use these accounts to test roles in the login screen of the Angular frontend:
- **User / Customer Account:**
  - Email: `user@example.com`
  - Password: `password`
- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `password`

---

## API Documentation

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Log in a user and set JWT cookie/token
- `POST /logout` - Clear cookie and logout
- `GET /me` - Get profile details (Private)
- `PUT /profile` - Update profile data (Private)
- `POST /avatar` - Upload profile image (Private, field: `avatar`)
- `GET /verify-email` - Verify account registration
- `POST /forgot-password` - Request a password reset link
- `POST /reset-password` - Update password using reset token

### Airports (`/api/airports`)
- `GET /` - List all airports or search by query (`?query=BOM`)
- `POST /` - Create a new airport (Admin)
- `PUT /:id` - Update airport details (Admin)
- `DELETE /:id` - Remove airport (Admin)

### Airlines (`/api/airlines`)
- `GET /` - List all airlines
- `POST /` - Create a new airline (Admin)
- `PUT /:id` - Update airline details (Admin)
- `DELETE /:id` - Delete airline (Admin)

### Flights (`/api/flights`)
- `GET /search` - Search flights (e.g., `/search?origin=BOM&destination=DEL&departureDate=2026-07-10&cabinClass=economy&sortBy=price`)
- `GET /:id` - Get flight details by ID
- `GET /` - List all flights (Admin)
- `POST /` - Create a new flight (Admin)
- `PUT /:id` - Update flight details (Admin)
- `DELETE /:id` - Delete flight (Admin)

### Bookings (`/api/bookings`)
- `POST /` - Create a new booking and reserve seats
- `GET /my-bookings` - Get all bookings for the logged-in user (Private)
- `POST /:id/cancel` - Cancel a booking and release reserved seats
- `GET /ref/:ref` - Fetch booking details by 6-char booking reference code

### Coupons (`/api/coupons`)
- `POST /validate` - Verify coupon code eligibility and discount amount
- `GET /` - List all active coupons (Admin)
- `POST /` - Create a new coupon (Admin)
- `DELETE /:id` - Delete coupon (Admin)

### Wishlist (`/api/wishlist`)
- `GET /` - Get user's saved flight list (Private)
- `POST /` - Add flight to wishlist (Private)
- `DELETE /:flightId` - Remove flight from wishlist (Private)

### Payments (`/api/payments`)
- `POST /stripe/create-payment-intent` - Mock Stripe Payment Intent
- `POST /razorpay/order` - Mock Razorpay Order Creator
- `POST /razorpay/verify` - Mock Razorpay signature validation
- `POST /paypal/order` - Mock PayPal Order Creator
- `POST /paypal/capture` - Mock PayPal Order Capture and Confirmation

### Admin Dashboard & Reports (`/api/admin`)
- `GET /stats` - Retrieve revenue analytics and booking numbers (Admin)
- `GET /reports/:type/export` - Export reports as CSV. Options: `booking`, `revenue`, `user`, `flight` (Admin)
