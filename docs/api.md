# API Documentation

## Health check

GET /api/health

Response:

```json
{
  "status": "ok"
}
```

## Authentication

### Login

POST /api/auth/login

Request body:

```json
{
  "email": "admin@fundsroom.com",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@fundsroom.com",
    "role": "Admin"
  }
}
```

## Customers

### List customers

GET /api/customers

Headers:

```http
Authorization: Bearer <token>
```

### Create customer

POST /api/customers

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "name": "Rajesh Kumar",
  "mobile": "9876543210",
  "email": "rajesh@example.com",
  "business_name": "North Star Traders",
  "gst_number": "27ABCDE1234F1Z5",
  "customer_type": "Wholesale",
  "address": "Mumbai, Maharashtra",
  "status": "Active",
  "follow_up_date": "2026-08-10",
  "notes": "Prefers evening delivery"
}
```

## Products

### List products

GET /api/products

Headers:

```http
Authorization: Bearer <token>
```

### Create product

POST /api/products

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "name": "Premium Rice 25kg",
  "sku": "PR-25-001",
  "category": "Groceries",
  "unit_price": 1200,
  "current_stock": 85,
  "minimum_stock": 20,
  "location": "Rack A-12"
}
```

## Stock movements

### List stock movements

GET /api/stock-movements

Headers:

```http
Authorization: Bearer <token>
```

## Challans

### List challans

GET /api/challans

Headers:

```http
Authorization: Bearer <token>
```

### Create challan

POST /api/challans

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "customer_id": 1,
  "status": "Confirmed",
  "items": [
    {
      "product_id": 1,
      "quantity": 5
    }
  ],
  "created_by": "System Admin"
}
```
