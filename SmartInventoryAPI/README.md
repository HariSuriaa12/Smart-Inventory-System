# Smart Inventory System - ASP.NET Core Backend

A comprehensive stock management system with forecasting capabilities, built with ASP.NET Core 8.0 and PostgreSQL.

## Features

✅ **Complete Database Layer**
- 17 main tables + 3 ML support tables
- Entity Framework Core with PostgreSQL
- Soft delete pattern for all entities
- Comprehensive logging and audit trails

✅ **Authentication & Authorization**
- JWT token-based authentication
- Role-based access control
- User management

✅ **Master Data Management**
- Items/Products
- Locations/Outlets
- Vendors/Suppliers
- Customers/Organizations
- Users

✅ **Inventory Management**
- Real-time stock tracking
- Stock quantity adjustment with audit trail
- Inter-location stock transfers
- Inventory history logging

✅ **Purchase Orders**
- PO creation and management
- Vendor integration for PO transmission
- Receipt and status tracking

✅ **Order Fulfillment**
- Integration API for receiving customer orders
- Shipment tracking
- Order status management

✅ **Sales Integration**
- Import sales data from POS systems
- Real-time sales recording
- Promotion and discount tracking

✅ **Stock Transfer**
- Transfer stock between locations
- Status tracking
- Audit logging

✅ **Forecasting Support**
- Data models for ANN and Moving Average predictions
- Model comparison and selection
- Training data preparation

## Project Structure

```
SmartInventoryAPI/
├── Models/
│   ├── Entities/          # All 17 database entities
│   └── DTOs/              # Request/Response models
├── Controllers/           # API endpoints
├── Services/              # Business logic
│   ├── Interfaces/        # Service contracts
│   └── Implementations/   # Service implementations
├── Repositories/          # Data access layer
│   ├── Interfaces/
│   └── Implementations/   # Including UnitOfWork pattern
├── Data/                  # DbContext
├── Configuration/         # DI, JWT, AutoMapper
├── Middleware/            # Exception handling, logging
├── Utilities/             # Helpers, exceptions
└── Migrations/            # EF Core migrations
```

## What's Implemented

### ✅ Complete
1. **Project Configuration**
   - .csproj with all dependencies
   - appsettings.json (development & production)
   - Program.cs with full DI setup

2. **Data Layer**
   - All 17+ entity models
   - SmartInventoryDbContext
   - Complete repository pattern with UnitOfWork
   - 10 specific repositories + generic repository

3. **DTOs**
   - Response DTOs for all entities
   - Request DTOs for create/update operations
   - AutoMapper profiles for mapping

4. **Configuration**
   - JWT settings and service
   - Dependency injection
   - AutoMapper configuration
   - DbContext setup

5. **Middleware & Utilities**
   - Exception handling middleware
   - Request logging middleware
   - Custom exceptions (5 types)
   - Password helper for hashing

6. **Services (Partial)**
   - JWT token service ✅
   - Auth service ✅
   - User service ✅
   - Service interfaces defined for all modules

### ⏳ Ready to Implement (Use Templates Below)

The following can be generated using the templates in IMPLEMENTATION_GUIDE.md:

**Services to Create:**
- ItemService
- LocationService
- VendorService
- CustomerService
- InventoryService
- PurchaseOrderService
- OrderFulfillmentService
- SalesService
- StockTransferService

**Controllers to Create:**
- AuthController
- UsersController
- ItemsController
- LocationsController
- VendorsController
- CustomersController
- InventoryController
- PurchaseOrdersController
- OrderFulfillmentController
- SalesController
- StockTransferController

## Quick Start

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 12+
- Visual Studio 2022 or VS Code

### Setup

1. **Clone/Extract Project**
   ```bash
   cd SmartInventoryAPI
   ```

2. **Restore Dependencies**
   ```bash
   dotnet restore
   ```

3. **Configure Database**
   Edit `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "User ID=postgres;Password=yourpassword;Host=localhost;Port=5432;Database=smart_inventory_db;"
   }
   ```

4. **Update Database**
   ```bash
   dotnet ef database update
   ```

5. **Configure JWT**
   Update `appsettings.json` JWT settings:
   ```json
   "JwtSettings": {
     "Key": "your-secret-key-min-32-chars-long",
     "Issuer": "SmartInventoryAPI",
     "Audience": "SmartInventoryClients",
     "ExpirationMinutes": 60
   }
   ```

6. **Run Application**
   ```bash
   dotnet run
   ```

7. **Access Swagger UI**
   Navigate to: `http://localhost:5000/swagger`

## API Documentation

### Authentication
All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - Login with username/password

#### Master Data (CRUD)
- `GET/POST /api/items`
- `GET/POST /api/locations`
- `GET/POST /api/vendors`
- `GET/POST /api/customers`
- `GET/POST /api/users`

#### Inventory Management
- `GET /api/inventory` - Get stock levels
- `PUT /api/inventory/adjust` - Adjust stock quantity
- `POST /api/inventory/transfer` - Transfer stock between locations
- `GET /api/inventory/logs` - View inventory history

#### Purchase Orders
- `POST /api/purchase-orders` - Create PO
- `GET /api/purchase-orders` - List POs
- `POST /api/purchase-orders/{id}/send-to-vendor` - Send PO to vendor
- `PUT /api/purchase-orders/{id}/receive` - Receive PO goods

#### Integration APIs
- `POST /api/order-fulfillment/receive` - Receive customer orders
- `POST /api/sales/import` - Import sales from POS

## Database Schema

### Core Tables
- `User` - System users
- `Item` - Products
- `Location` - Outlets/Warehouses
- `Vendor` - Suppliers
- `Customer` - Organizations that order
- `Inventory` - Stock levels
- `PurchaseOrderHeader/Item` - Vendor orders
- `OrderFulfillmentHeader/Item` - Customer orders
- `Sales/Sales_Item` - Sales data from POS
- `StockTransfer` - Inter-location transfers

### Logging Tables
- `PerformLog` - Activity audit log
- `PriceLog` - Price change history
- `InventoryLog` - Stock quantity changes

### ML Support Tables
- `ForecastedResult` - Predicted demand
- `Model_Training_Data` - Training dataset
- `Model_Comparison` - Model performance

## Key Design Patterns

1. **Repository Pattern** - Clean data access layer
2. **Unit of Work** - Transaction management
3. **Dependency Injection** - Loose coupling
4. **DTO Pattern** - Request/response mapping
5. **AutoMapper** - Object mapping
6. **Soft Delete** - Data preservation
7. **JWT Authentication** - Stateless auth
8. **Pagination** - skip/take pattern

## Error Handling

Standard error response format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": ["Specific error 1", "Specific error 2"]
}
```

## Logging

Logs are written to:
- Console (development)
- File: `logs/log-YYYYMMDD.txt` (rolling daily)
- Includes request/response details

## Next Steps

1. **Complete Service Implementations**
   Use templates in IMPLEMENTATION_GUIDE.md to create remaining services

2. **Create Controllers**
   Create controllers following the pattern provided

3. **Add Validations**
   Implement FluentValidation for business rules

4. **Testing**
   Add unit tests and integration tests

5. **Forecasting Service**
   Integrate Python TensorFlow model via HTTP

6. **Deploy**
   Configure for production environment

## Support

For implementation questions, refer to:
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation patterns
- Entity models - Database schema reference
- Service interfaces - Contract specifications

## License

Internal project for university major assessment

