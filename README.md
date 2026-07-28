# 🚀 ERP-CRM Operations Portal

> A modern full-stack ERP & CRM solution built for wholesale and distribution businesses. The application streamlines customer management, inventory tracking, sales challan generation, and role-based operations through a secure and scalable architecture.

---

## 📖 Overview

This project demonstrates a real-world business workflow where multiple departments—including Sales, Warehouse, Accounts, and Admin—work together within a single platform.

The system enables organizations to manage customers, products, inventory, and sales operations while maintaining secure access control and accurate stock management.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure password hashing
- Role-Based Access Control (RBAC)
- Protected API routes
- Session validation

### 👥 Customer CRM
- Add, edit and manage customers
- Customer profile management
- Search & filter customers
- Customer status tracking
- Lead follow-up management
- Business & GST information
- Customer notes

### 📦 Product & Inventory
- Product catalog management
- SKU-based product identification
- Warehouse/location management
- Live stock availability
- Minimum stock alert
- Inventory movement history
- Stock IN / OUT tracking

### 📄 Sales Challan
- Automatic challan number generation
- Draft & Confirm workflow
- Multiple product support
- Product snapshot storage
- Customer-wise challans
- Prevent negative inventory
- Atomic stock deduction

### 📊 Dashboard
- Business overview
- Customer statistics
- Inventory summary
- Recent activities
- Quick operational insights

---

# 🛠 Tech Stack

## Frontend
- React
- TypeScript
- Vite
- HTML5
- CSS3

## Backend
- Node.js
- Express.js
- TypeScript
- REST API

## Database
- PostgreSQL
- Prisma ORM

## Authentication
- JWT
- bcrypt

## Validation
- Zod

## Development Tools
- Git & GitHub
- Postman
- Docker (Optional)

---

# 📁 Project Structure

```
ERP-CRM/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── assets/
│   └── package.json
│
├── server/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── validations/
│   │   └── utils/
│   └── package.json
│
├── README.md
└── docker-compose.yml
```

---

# 🏢 User Roles

| Role | Permissions |
|-------|-------------|
| 👑 Admin | Complete system access |
| 💼 Sales | Customer management, Challans |
| 📦 Warehouse | Product & Inventory management |
| 💰 Accounts | View challans & customer records |

---

# ⚙ Business Workflow

```
Customer Created
        │
        ▼
Product Added
        │
        ▼
Stock Available
        │
        ▼
Sales Creates Draft Challan
        │
        ▼
Review & Confirm
        │
        ▼
Stock Validation
        │
        ▼
Inventory Updated
        │
        ▼
Movement Log Generated
```

---

# 🔄 Inventory Logic

When a challan is confirmed:

- Product stock is verified.
- Insufficient stock immediately blocks the transaction.
- Stock quantity is updated.
- Inventory movement is logged.
- Challan status changes to **Confirmed**.
- All database operations execute within a transaction to maintain consistency.

---

# 📌 Main Modules

## Authentication
- Login
- JWT Authentication
- Role Authorization

## Customer CRM
- Add Customer
- Update Customer
- Customer Details
- Search Customers
- Follow-up Notes

## Product Management
- Add Product
- Update Product
- Product Categories
- Warehouse Location

## Inventory
- Current Stock
- Stock Movement
- Stock History
- Low Stock Alert

## Sales Challan
- Create Draft
- Add Multiple Products
- Auto Challan Number
- Confirm Challan
- Cancel Draft Challan

---

# 🌐 REST API

## Authentication

```
POST /api/auth/login
```

---

## Customers

```
GET    /api/customers
POST   /api/customers
PATCH  /api/customers/:id
GET    /api/customers/:id
POST   /api/customers/:id/follow-ups
```

---

## Products

```
GET    /api/products
POST   /api/products
PATCH  /api/products/:id
```

---

## Inventory

```
GET    /api/inventory/movements
POST   /api/inventory/movements
```

---

## Challans

```
GET    /api/challans
POST   /api/challans
POST   /api/challans/:id/confirm
POST   /api/challans/:id/cancel
```

---

## Dashboard

```
GET /api/dashboard
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/erp-crm.git
cd erp-crm
```

---

## 2. Start PostgreSQL

```bash
docker compose up -d
```

Or use your own PostgreSQL instance.

---

## 3. Backend Setup

```bash
cd server

cp .env.example .env

npm install

npx prisma generate

npx prisma migrate dev

npm run prisma:seed

npm run dev
```

Backend runs at:

```
http://localhost:5000/api
```

---

## 4. Frontend Setup

```bash
cd client

cp .env.example .env

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | Admin@123 |
| Sales | sales@erp.com | Sales@123 |
| Warehouse | warehouse@erp.com | Warehouse@123 |
| Accounts | accounts@erp.com | Accounts@123 |

---

# 🌍 Environment Variables

### Backend

```env
DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=

PORT=

FRONTEND_URL=
```

### Frontend

```env
VITE_API_BASE_URL=
```

---

# 🚀 Deployment

### Frontend

- Vercel
- Netlify
- Render Static Site

### Backend

- Render
- Railway
- Fly.io

### Database

- Neon PostgreSQL
- Supabase PostgreSQL
- Render PostgreSQL

---

# 📷 Screenshots

<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/22918883-da6d-403f-8c1f-52f789258541" />


```
Login Page

Dashboard

Customer Module

Inventory Module

Sales Challan

```

---

# 📬 Postman Collection

Import the provided Postman collection to test all available REST APIs.

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Input Validation
- Error Handling
- Role-Based Authorization

---

# 💡 Future Improvements

- Invoice PDF Generation
- Purchase Order Module
- Product Image Upload
- Email Notifications
- Password Reset
- Reports & Analytics
- Multi-Warehouse Support
- AWS S3 Integration
- GitHub Actions CI/CD
- Docker Deployment

---

# 📄 Assumptions

- Only authenticated users can access protected resources.
- Stock cannot become negative.
- Challan numbers are generated automatically.
- Confirmed challans are immutable.
- Product information is stored as a snapshot inside each challan.
- Database transactions ensure inventory consistency.

---

# 👨‍💻 Author

**Tanishka Nayak**

Full Stack Java Developer

- Java
- Spring Boot
- React
- Node.js
- PostgreSQL
- TypeScript

GitHub: https://github.com/Tanishkanayak/Mini-Erp-Crm

---
