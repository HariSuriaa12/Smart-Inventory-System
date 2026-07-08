# Smart Inventory System - Implementation Guide

## Project Overview
This is an ASP.NET Core 8.0 backend for a Smart Inventory Management System with PostgreSQL database, JWT authentication, and forecasting capabilities.

## Current Status
- ✅ Project structure and configuration files created
- ✅ All entity models created (17 tables)
- ✅ DTOs for request/response mapping created
- ✅ DbContext configured with EF Core
- ✅ Repository pattern with Unit of Work implemented
- ✅ Middleware for exception handling and logging
- ✅ Custom exceptions and utilities
- ✅ Partial service interfaces created
- ⏳ Remaining: Service implementations and Controllers

## Remaining Files to Create

### 1. Service Interfaces (Complete these)
```
Services/Interfaces/
├── IVendorService.cs
├── ICustomerService.cs
├── IInventoryService.cs
├── IPurchaseOrderService.cs
├── IOrderFulfillmentService.cs
├── ISalesService.cs
└── IStockTransferService.cs
```

### 2. Service Implementations
```
Services/Implementations/
├── JwtTokenService.cs (JWT token generation)
├── AuthService.cs (Login logic)
├── UserService.cs (User CRUD)
├── ItemService.cs (Item CRUD)
├── LocationService.cs (Location CRUD)
├── VendorService.cs (Vendor CRUD)
├── CustomerService.cs (Customer CRUD)
├── InventoryService.cs (Stock management)
├── PurchaseOrderService.cs (PO creation/management)
├── OrderFulfillmentService.cs (Order fulfillment API integration)
├── SalesService.cs (Sales data integration)
└── StockTransferService.cs (Inter-location transfers)
```

### 3. Controllers
```
Controllers/
├── AuthController.cs (Login endpoint)
├── UsersController.cs (User management)
├── ItemsController.cs (Item management)
├── LocationsController.cs (Location/Outlet management)
├── VendorsController.cs (Vendor management)
├── CustomersController.cs (Customer management)
├── InventoryController.cs (Stock queries and adjustments)
├── PurchaseOrdersController.cs (PO management & vendor integration)
├── OrderFulfillmentController.cs (Order fulfillment integration API)
├── SalesController.cs (Sales data import from POS)
└── StockTransferController.cs (Stock transfer management)
```

## Service Implementation Pattern

### Example: VendorService
```csharp
using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Vendor;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class VendorService : IVendorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public VendorService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<VendorDto> CreateVendorAsync(CreateVendorRequestDto request)
    {
        var vendor = _mapper.Map<Vendor>(request);
        var createdVendor = await _unitOfWork.Vendors.AddAsync(vendor);
        await _unitOfWork.SaveAsync();
        return _mapper.Map<VendorDto>(createdVendor);
    }

    public async Task<VendorDto> GetVendorByIdAsync(long id)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(id);
        if (vendor == null || vendor.IsDeleted)
            throw new NotFoundException("Vendor not found");
        return _mapper.Map<VendorDto>(vendor);
    }

    public async Task<IEnumerable<VendorDto>> GetAllVendorsAsync(int skip = 0, int take = 10)
    {
        var vendors = await _unitOfWork.Vendors.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<VendorDto>>(vendors.Where(v => !v.IsDeleted));
    }

    public async Task<VendorDto> UpdateVendorAsync(long id, UpdateVendorRequestDto request)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(id);
        if (vendor == null || vendor.IsDeleted)
            throw new NotFoundException("Vendor not found");

        _mapper.Map(request, vendor);
        await _unitOfWork.Vendors.UpdateAsync(vendor);
        await _unitOfWork.SaveAsync();
        return _mapper.Map<VendorDto>(vendor);
    }

    public async Task DeleteVendorAsync(long id)
    {
        var vendor = await _unitOfWork.Vendors.GetByIdAsync(id);
        if (vendor == null)
            throw new NotFoundException("Vendor not found");

        vendor.IsDeleted = true;
        await _unitOfWork.Vendors.UpdateAsync(vendor);
        await _unitOfWork.SaveAsync();
    }
}
```

## Controller Implementation Pattern

### Example: VendorsController
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventoryAPI.Models.DTOs.Request.Vendor;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Services.Interfaces;

namespace SmartInventoryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<VendorsController> _logger;

    public VendorsController(IVendorService vendorService, ILogger<VendorsController> logger)
    {
        _vendorService = vendorService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<IEnumerable<VendorDto>>>> GetAllVendors(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 10)
    {
        var vendors = await _vendorService.GetAllVendorsAsync(skip, take);
        return Ok(new ApiResponseDto<IEnumerable<VendorDto>>
        {
            Success = true,
            Message = "Vendors retrieved successfully",
            Data = vendors,
            StatusCode = 200
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<VendorDto>>> GetVendorById(long id)
    {
        var vendor = await _vendorService.GetVendorByIdAsync(id);
        return Ok(new ApiResponseDto<VendorDto>
        {
            Success = true,
            Message = "Vendor retrieved successfully",
            Data = vendor,
            StatusCode = 200
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<VendorDto>>> CreateVendor(
        [FromBody] CreateVendorRequestDto request)
    {
        var vendor = await _vendorService.CreateVendorAsync(request);
        return CreatedAtAction(nameof(GetVendorById), new { id = vendor.ID }, 
            new ApiResponseDto<VendorDto>
            {
                Success = true,
                Message = "Vendor created successfully",
                Data = vendor,
                StatusCode = 201
            });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<VendorDto>>> UpdateVendor(
        long id,
        [FromBody] UpdateVendorRequestDto request)
    {
        var vendor = await _vendorService.UpdateVendorAsync(id, request);
        return Ok(new ApiResponseDto<VendorDto>
        {
            Success = true,
            Message = "Vendor updated successfully",
            Data = vendor,
            StatusCode = 200
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteVendor(long id)
    {
        await _vendorService.DeleteVendorAsync(id);
        return Ok(new ApiResponseDto
        {
            Success = true,
            Message = "Vendor deleted successfully",
            StatusCode = 200
        });
    }
}
```

## Integration API Endpoints

### 1. Sales Import API (from POS)
```
POST /api/sales/import
Content-Type: application/json

{
  "locationID": 1,
  "salesDate": "2026-07-07",
  "salesNumber": "SALE-001",
  "salesStatus": 1,
  "items": [
    {
      "itemID": 1,
      "soldQuantity": 5,
      "unitPrice": 100,
      "isPromotion": false,
      "discountPercentage": 0
    }
  ]
}
```

### 2. Order Fulfillment API (from Customers)
```
POST /api/order-fulfillment/receive
Content-Type: application/json

{
  "locationID": 1,
  "customerID": 1,
  "orderDate": "2026-07-07",
  "shipmentAddressLine1": "123 Main St",
  "shipmentCity": "Kuala Lumpur",
  "shipmentState": "KL",
  "shipmentPostCode": "50000",
  "shipmentCountryCode": "MYS",
  "items": [
    {
      "itemID": 1,
      "requestQuantity": 10,
      "unitPrice": 50
    }
  ]
}
```

### 3. Purchase Order Export API (to Vendors)
```
POST /api/purchase-orders/{id}/send-to-vendor

Sends PO data to configured vendor endpoint
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   dotnet restore
   ```

2. **Configure Database**
   - Update connection string in `appsettings.json`
   - PostgreSQL must be installed and running
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "User ID=postgres;Password=yourpassword;Host=localhost;Port=5432;Database=smart_inventory_db;"
   }
   ```

3. **Run Migrations**
   ```bash
   dotnet ef migrations add InitialMigration
   dotnet ef database update
   ```

4. **Configure JWT**
   - Update JWT secret key in `appsettings.json`
   - Generate a strong key (min 32 chars)

5. **Run Application**
   ```bash
   dotnet run
   ```

6. **API Documentation**
   - Swagger UI: `http://localhost:5000/swagger`

## Key Implementation Notes

- **Soft Delete**: All queries should filter out `IsDeleted = true` records
- **Pagination**: Implement skip/take pattern for list endpoints (default: skip=0, take=10)
- **Timestamps**: Use `DateTime.UtcNow` for creation/modification dates
- **Authorization**: Controllers use `[Authorize]` attribute; implement role-based access as needed
- **Validation**: Use FluentValidation for complex business rules
- **Transactions**: Use Unit of Work for multi-entity operations

## Database Schema Notes

- 17 main tables + 3 ML tables
- All tables have `ID` (auto-increment) and `IsDeleted` (soft delete) fields
- Foreign key relationships configured in DbContext
- Decimal fields use precision(14,2)

## Next Steps

1. Create remaining service interfaces (copy IVendorService pattern)
2. Implement all services (copy VendorService pattern)
3. Create all controllers (copy VendorsController pattern)
4. Test API endpoints with Postman/Swagger
5. Implement forecasting service (requires Python TensorFlow integration)
6. Add custom validators using FluentValidation
7. Implement audit logging in PerformLog, PriceLog, InventoryLog

