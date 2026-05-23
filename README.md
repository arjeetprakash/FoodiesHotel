# FoodiesHotel

FoodiesHotel is a full-stack food delivery website scaffold with a React frontend and an Express backend.

## Structure

- `frontend/` - React + Vite customer/admin web app
- `backend/` - Express API with MongoDB, role-based auth, refresh tokens, password reset, and uploads

## Roles

### Customer
- Browse the menu
- Add food items to cart
- Place orders
- View order history

### Admin
- Manage menu items
- View all users and orders
- Update order statuses
- Manage restaurant branding

## Features Added

- MongoDB database integration using Mongoose
- Authentication system with:
  - Register/Login
  - JWT access tokens
  - Refresh token rotation
  - Logout support
  - Forgot password & reset password
- Admin branding controls:
  - Restaurant name
  - Tagline
  - Theme color
  - Support email
- Image upload support:
  - Logo upload
  - Hero/banner image upload
- Public branding API integration
- Role-based authorization
- File upload support

---

# Local Setup

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd FoodiesHotel
```

## 2. Install dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

## 3. Configure environment variables

Create `.env` files from the provided `.env.example` files.

### Backend `.env`

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:5000
```

### Frontend `.env`

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Start the backend server

Inside the `backend` folder:

```bash
npm run dev
```

---

## 5. Start the frontend

Inside the `frontend` folder:

```bash
npm run dev
```

---

# Default Demo Logins

## Admin

```txt
Email: admin@foodieshotel.com
Password: admin123
```

## Customer

```txt
Email: customer@foodieshotel.com
Password: customer123
```

---

# Notes

- Backend data is stored in MongoDB.
- Frontend reads API URL from `frontend/.env`.
- Uploaded files are served from `backend/uploads`.
- Ensure MongoDB is running before starting the backend server.

---

# Deploy on Render

## 1. Push repository to GitHub

Push your complete project to GitHub.

---

## 2. Create a Blueprint service on Render

Use the root `render.yaml` file while creating the Blueprint service.

This creates:

- `foodieshotel-backend` (Web Service)
- `foodieshotel-frontend` (Static Site)

---

## 3. Configure backend environment variables in Render

Set the following secrets:

```env
MONGODB_URI=
CORS_ORIGIN=
PUBLIC_BASE_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

---

## 4. Configure frontend environment variable

Set:

```env
VITE_API_URL=https://foodieshotel-backend.onrender.com/api
```

Replace with your actual backend URL if different.

---

## 5. Deploy

Deploy both services and open the frontend URL after deployment.

---

# Render Notes

- MongoDB Atlas or another hosted MongoDB service is required for production deployment.
- Local uploads on Render are ephemeral unless persistent storage or cloud storage is used.
- Update `CORS_ORIGIN` whenever your frontend domain changes.
- Mailtrap is only for testing email functionality.
- For real email delivery, use:
  - SendGrid
  - Mailgun
  - Amazon SES
  - Gmail SMTP with App Password

---

# Tech Stack

## Frontend
- React
- Vite
- JavaScript
- CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

# Future Improvements

- Online payment integration
- Real-time order tracking
- Notifications system
- Cloud image storage
- Mobile app support
- Restaurant analytics dashboard