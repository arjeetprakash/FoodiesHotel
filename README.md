# FoodiesHotel

FoodiesHotel is a full-stack food delivery website scaffold with a React frontend and an Express backend.

## Structure

- `frontend/` - React + Vite customer/admin web app
- `backend/` - Express API with MongoDB, role-based auth, refresh tokens, password reset, and uploads

## Roles

- Customer: browse the menu, add food to cart, place orders, and view order history
- Admin: manage menu items, view all users and orders, and update order statuses

## Features Added

- Real database layer: MongoDB via Mongoose models
- Production-style auth: register, login, short-lived access token, refresh token rotation, logout, forgot password, reset password
- Admin branding control: editable restaurant name, tagline, color, support email
- Image upload support: admin can upload logo and hero images
- Public branding API used by landing page and dashboard shell

## Local setup

1. Install MongoDB locally and start it, or set `MONGODB_URI` to your hosted cluster.
2. Install dependencies in both folders.
3. Create the local environment files from the provided `.env.example` files.
4. Start backend with `npm run dev` in `backend`.
5. Start frontend with `npm run dev` in `frontend`.

## Default demo logins

- Admin: `admin@foodieshotel.com` / `admin123`
- Customer: `customer@foodieshotel.com` / `customer123`

## Notes

- The backend persists data in MongoDB.
- The frontend reads the API URL from `frontend/.env`.
- Uploaded files are served from `backend/uploads`.

## Deploy on Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint service from the repository using the root `render.yaml`.
3. The blueprint creates two services:
	- `foodieshotel-backend` (Web Service)
	- `foodieshotel-frontend` (Static Site)
4. Set the backend secrets in Render:
	- `MONGODB_URI`
	- `CORS_ORIGIN` to your frontend URL
	- `PUBLIC_BASE_URL` to your backend URL
	- `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` if you want password reset emails to send for real
5. Set frontend env var `VITE_API_URL` to your backend API URL, for example `https://foodieshotel-backend.onrender.com/api`.
6. Let Render deploy both services, then open the frontend URL.

### Render notes

- The backend uses MongoDB, so you must provide a valid hosted MongoDB URI.
- If you use the image upload feature on Render, remember that local uploads are ephemeral unless you attach persistent storage or move uploads to a cloud bucket.
- After the frontend is deployed, update `CORS_ORIGIN` on the backend if your frontend URL changes.
- Mailtrap is a testing SMTP inbox. Deployment does not make Mailtrap send to real Gmail/Outlook inboxes. For real customer delivery, use a production SMTP provider (SendGrid, Mailgun, SES, Gmail SMTP with app password, etc.).
