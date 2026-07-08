# API cURL Examples

Replace `localhost:5000` with your actual server URL and `your_token_here` with actual JWT token.

---

## 1️⃣ Authentication

### Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userID": 1,
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": 1,
    "expiresAt": "2026-07-07T17:45:00Z"
  },
  "statusCode": 200
}
```

---

## 2️⃣ Master Data Management

### Create Item
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "itemName": "Dell Laptop",
    "itemCode": "LAPTOP-001",
    "description": "High performance laptop",
    "itemCategory": "Electronics",
    "itemBrand": "Dell",
    "purchaseCost": 500.00,
    "unitCost": 750.00,
    "unitOfMeasure": "Unit",
    "remark": "New stock item",
    "itemImageURL": "https://example.com/image.jpg",
    "taxPercentage": 10,
    "taxType": "GST",
    "itemType": "Product"
  }'
```

### Get All Items (with pagination)
```bash
curl -X GET "http://localhost:5000/api/items?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Item by ID
```bash
curl -X GET http://localhost:5000/api/items/1 \
  -H "Authorization: Bearer your_token_here"
```

### Get Items by Category
```bash
curl -X GET "http://localhost:5000/api/items/category/Electronics?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Update Item
```bash
curl -X PUT http://localhost:5000/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "itemName": "Dell Laptop Pro",
    "description": "Updated high performance laptop",
    "itemCategory": "Computers",
    "itemBrand": "Dell",
    "purchaseCost": 520.00,
    "unitCost": 800.00,
    "unitOfMeasure": "Unit",
    "remark": "Price updated",
    "itemImageURL": "https://example.com/image-new.jpg",
    "taxPercentage": 12,
    "isActive": true
  }'
```

### Delete Item
```bash
curl -X DELETE http://localhost:5000/api/items/1 \
  -H "Authorization: Bearer your_token_here"
```

---

## 3️⃣ Location/Outlet Management

### Create Location
```bash
curl -X POST http://localhost:5000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "locationName": "Main Warehouse",
    "outletCode": "WH-001",
    "locationType": 1,
    "address": "123 Industrial Ave, Mumbai, India"
  }'
```

### Get All Locations
```bash
curl -X GET "http://localhost:5000/api/locations?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Update Location
```bash
curl -X PUT http://localhost:5000/api/locations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "locationName": "Main Warehouse - Updated",
    "address": "456 Industrial Ave, Mumbai, India",
    "locationType": 1
  }'
```

---

## 4️⃣ Vendor Management

### Create Vendor
```bash
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "companyName": "Tech Supplies Inc",
    "vendorCode": "VENDOR-001",
    "companyAddress": "789 Supply St, Delhi, India",
    "email": "vendor@techsupplies.com",
    "mobile": "+91-9876543210"
  }'
```

### Get All Vendors
```bash
curl -X GET "http://localhost:5000/api/vendors?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Update Vendor
```bash
curl -X PUT http://localhost:5000/api/vendors/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "companyName": "Tech Supplies Corp",
    "companyAddress": "999 Supply St, Delhi, India",
    "email": "newemail@techsupplies.com",
    "mobile": "+91-9876543211"
  }'
```

---

## 5️⃣ Customer Management

### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "companyName": "ABC Retail Stores",
    "customerCode": "CUST-001",
    "address": "Street 1, Bangalore",
    "companyAddress": "123 Retail Plaza, Bangalore, India",
    "email": "orders@abcretail.com",
    "mobile": "+91-8765432109"
  }'
```

### Get All Customers
```bash
curl -X GET "http://localhost:5000/api/customers?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

---

## 6️⃣ Inventory Management

### Get Inventory by Location
```bash
curl -X GET "http://localhost:5000/api/inventory/location/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Inventory by Item
```bash
curl -X GET "http://localhost:5000/api/inventory/item/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Adjust Stock Quantity
```bash
curl -X PUT http://localhost:5000/api/inventory/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "itemID": 1,
    "locationID": 1,
    "quantityAdjustment": 50,
    "remark": "Stock received from warehouse"
  }'
```

### Stock Transfer Between Locations
```bash
curl -X POST http://localhost:5000/api/inventory/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "fromLocationID": 1,
    "toLocationID": 2,
    "itemID": 1,
    "transferQuantity": 25,
    "remark": "Transfer for branch replenishment"
  }'
```

---

## 7️⃣ Purchase Order Management

### Create Purchase Order
```bash
curl -X POST http://localhost:5000/api/purchase-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "locationID": 1,
    "vendorID": 1,
    "remark": "Monthly stock replenishment",
    "items": [
      {
        "itemID": 1,
        "orderQuantity": 100,
        "unitPrice": 500.00
      },
      {
        "itemID": 2,
        "orderQuantity": 50,
        "unitPrice": 200.00
      }
    ]
  }'
```

### Get All Purchase Orders
```bash
curl -X GET "http://localhost:5000/api/purchase-orders?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Purchase Order by ID
```bash
curl -X GET http://localhost:5000/api/purchase-orders/1 \
  -H "Authorization: Bearer your_token_here"
```

### Get Purchase Orders by Vendor
```bash
curl -X GET "http://localhost:5000/api/purchase-orders/vendor/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Update Purchase Order
```bash
curl -X PUT http://localhost:5000/api/purchase-orders/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "status": 2,
    "remark": "Partial delivery received"
  }'
```

---

## 8️⃣ Order Fulfillment Integration API ⭐

### Receive Order from Customer System (No Auth Required)
```bash
curl -X POST http://localhost:5000/api/order-fulfillment/receive \
  -H "Content-Type: application/json" \
  -d '{
    "locationID": 1,
    "customerID": 1,
    "orderDate": "2026-07-07",
    "shipmentAddressLine1": "456 Commercial St",
    "shipmentAddressLine2": "Suite 200",
    "shipmentCity": "Bangalore",
    "shipmentState": "Karnataka",
    "shipmentPostCode": "560001",
    "shipmentCountryCode": "IND",
    "remark": "Urgent order from customer",
    "items": [
      {
        "itemID": 1,
        "requestQuantity": 75,
        "unitPrice": 750.00
      },
      {
        "itemID": 3,
        "requestQuantity": 30,
        "unitPrice": 1200.00
      }
    ]
  }'
```

### Get All Orders
```bash
curl -X GET "http://localhost:5000/api/order-fulfillment?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Order by ID
```bash
curl -X GET http://localhost:5000/api/order-fulfillment/1 \
  -H "Authorization: Bearer your_token_here"
```

### Get Orders by Customer
```bash
curl -X GET "http://localhost:5000/api/order-fulfillment/customer/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Update Order Status
```bash
curl -X PUT http://localhost:5000/api/order-fulfillment/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "status": 3,
    "remark": "Order shipped"
  }'
```

---

## 9️⃣ Sales Integration API ⭐

### Receive Sales from POS System (No Auth Required)
```bash
curl -X POST http://localhost:5000/api/sales/import \
  -H "Content-Type: application/json" \
  -d '{
    "locationID": 1,
    "salesDate": "2026-07-07",
    "salesNumber": "SALE-20260707-001",
    "salesStatus": 1,
    "items": [
      {
        "itemID": 1,
        "soldQuantity": 10,
        "unitPrice": 750.00,
        "isPromotion": false,
        "discountPercentage": 0
      },
      {
        "itemID": 2,
        "soldQuantity": 5,
        "unitPrice": 200.00,
        "isPromotion": true,
        "discountPercentage": 10
      }
    ]
  }'
```

### Get All Sales
```bash
curl -X GET "http://localhost:5000/api/sales?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Sales by Location
```bash
curl -X GET "http://localhost:5000/api/sales/location/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Sales by Date Range
```bash
curl -X GET "http://localhost:5000/api/sales/date-range?startDate=2026-07-01&endDate=2026-07-07&skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

---

## 🔟 Stock Transfer Management

### Get All Stock Transfers
```bash
curl -X GET "http://localhost:5000/api/stock-transfer?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Transfers from Location
```bash
curl -X GET "http://localhost:5000/api/stock-transfer/from-location/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Transfers to Location
```bash
curl -X GET "http://localhost:5000/api/stock-transfer/to-location/2?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

### Get Transfers by Status
```bash
curl -X GET "http://localhost:5000/api/stock-transfer/status/1?skip=0&take=10" \
  -H "Authorization: Bearer your_token_here"
```

---

## 📊 Response Format Examples

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 1,
    "itemName": "Dell Laptop",
    "itemCode": "LAPTOP-001",
    "unitCost": 750.00,
    "isActive": true,
    "creationDate": "2026-07-07T15:30:00Z"
  },
  "statusCode": 201
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid request",
  "statusCode": 400,
  "errors": [
    "ItemName is required",
    "UnitCost must be greater than 0"
  ]
}
```

### Not Found Response (404)
```json
{
  "success": false,
  "message": "Item not found",
  "statusCode": 404
}
```

### Unauthorized Response (401)
```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## 🔑 Important Notes

1. **Replace `your_token_here`** with the actual JWT token from login response
2. **Replace `localhost:5000`** with your actual server URL
3. **Skip/Take** - Use for pagination (skip=0, take=10 means first 10 records)
4. **Integration APIs** (Order Fulfillment, Sales) don't require Bearer token
5. **All timestamps** are in UTC (Zulu time)
6. **All monetary values** use decimal(14,2) format

---

## 💡 Quick Testing Flow

1. **Login first**
   ```bash
   # Get token
   curl -X POST http://localhost:5000/api/auth/login ...
   ```

2. **Create a Vendor**
   ```bash
   # Use token from login
   curl -X POST http://localhost:5000/api/vendors ...
   ```

3. **Create an Item**
   ```bash
   curl -X POST http://localhost:5000/api/items ...
   ```

4. **Create a Location**
   ```bash
   curl -X POST http://localhost:5000/api/locations ...
   ```

5. **Adjust Inventory** (after item and location exist)
   ```bash
   curl -X PUT http://localhost:5000/api/inventory/adjust ...
   ```

6. **Create Purchase Order**
   ```bash
   curl -X POST http://localhost:5000/api/purchase-orders ...
   ```

---

## 🧪 Using with Postman

Import collection from JSON:
```json
{
  "info": {
    "name": "Smart Inventory API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"admin\",\"password\":\"password123\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

Set `{{base_url}}` and `{{token}}` variables in Postman environment!

