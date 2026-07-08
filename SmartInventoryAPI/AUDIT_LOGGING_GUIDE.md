# Audit Logging System Guide

## Overview

The Smart Inventory System includes a comprehensive audit logging system that tracks all CREATE, UPDATE, and DELETE operations, as well as price changes and inventory movements.

## Logging Tables

### 1. PerformLog (Performance/Activity Log)
Tracks all operations performed on the system.

**Fields:**
- `ID` - Primary key (auto-increment)
- `PerformedBy` - User ID who performed the action
- `PerformedOutlet` - Location/outlet where action was performed
- `PerformModule` - Module code (see Operation Modules below)
- `OperationType` - Type of operation (see Operation Types below)
- `PerformRemark` - Description of the operation
- `PerformDate` - Timestamp of the operation
- `OperationID` - ID of the affected entity (Item ID, User ID, etc.)
- `IsDeleted` - Soft delete flag

### 2. PriceLog (Price Change History)
Tracks all price updates for items.

**Fields:**
- `ID` - Primary key
- `ItemID` - Item that had price change
- `PreviousUnitPrice` - Old price
- `NewUnitPrice` - New price
- `PerformedLogID` - Reference to PerformLog
- `IsDeleted` - Soft delete flag

### 3. InventoryLog (Stock Movement History)
Tracks all inventory quantity changes.

**Fields:**
- `ID` - Primary key
- `ItemID` - Item ID
- `LocationID` - Location/outlet ID
- `PreviousOnhandQuantity` - Previous on-hand stock
- `NewOnhandQuantity` - New on-hand stock
- `PreviousAvailableQuantity` - Previous available stock
- `NewAvailableQuantity` - New available stock
- `PerformedLogID` - Reference to PerformLog
- `IsDeleted` - Soft delete flag

---

## Operation Codes

### Module Codes
```csharp
1 = Item (Product management)
2 = Inventory (Stock management)
3 = User (User management)
4 = Vendor (Vendor management)
5 = Customer (Customer management)
6 = PurchaseOrder (Purchase orders)
7 = OrderFulfillment (Order fulfillment)
8 = Sales (Sales records)
```

### Operation Type Codes
```csharp
1 = CREATE
2 = UPDATE
3 = DELETE
4 = TRANSFER
5 = RECEIVE
6 = SHIP
```

---

## Current Implementation

### Services with Audit Logging Implemented

#### 1. ItemService ✅
- **CREATE** - Logs when new item is created
- **UPDATE** - Logs item updates and price changes
- **DELETE** - Logs when item is soft-deleted
- **Price Change** - Automatically logs to PriceLog when unit cost changes

#### 2. InventoryService ✅
- **ADJUST** - Logs stock quantity adjustments with InventoryLog
- **TRANSFER** - Logs stock transfers from one location to another
- **Inventory Changes** - Tracks both source and destination location changes

### Services to Update

The following services should be updated similarly:

#### UserService
```csharp
// After CreateUserAsync
await _loggingService.LogPerformanceAsync(
    performedBy: 1,
    performedOutlet: 1,
    performModule: 3, // User module
    operationType: 1, // Create
    performRemark: $"Created user: {request.Username}",
    operationId: createdUser.ID);

// After UpdateUserAsync and DeleteUserAsync similarly
```

#### LocationService
```csharp
// Same pattern with performModule: 2 (Inventory/Location)
```

#### VendorService, CustomerService
```csharp
// Use performModule: 4 for Vendor, 5 for Customer
```

#### PurchaseOrderService
```csharp
// Use performModule: 6
// Log CREATE, UPDATE, DELETE operations
```

#### OrderFulfillmentService
```csharp
// Use performModule: 7
// Log RECEIVE, UPDATE, SHIP operations
```

#### SalesService
```csharp
// Use performModule: 8
// Log RECEIVE operation
```

---

## How to Add Logging to a Service

### Step 1: Inject ILoggingService
```csharp
private readonly ILoggingService _loggingService;

public YourService(IUnitOfWork unitOfWork, IMapper mapper, 
    ILogger<YourService> logger, ILoggingService loggingService)
{
    _unitOfWork = unitOfWork;
    _mapper = mapper;
    _logger = logger;
    _loggingService = loggingService; // Add this
}
```

### Step 2: Log CREATE Operations
```csharp
public async Task<YourDto> CreateAsync(CreateYourRequestDto request)
{
    var entity = _mapper.Map<YourEntity>(request);
    var created = await _unitOfWork.Repository.AddAsync(entity);
    await _unitOfWork.SaveAsync();

    // Log the creation
    await _loggingService.LogPerformanceAsync(
        performedBy: 1,           // Get from current user context
        performedOutlet: 1,       // Get from current user context
        performModule: 1,         // Your module code
        operationType: 1,         // CREATE
        performRemark: $"Created your entity: {entity.Name}",
        operationId: created.ID);

    return _mapper.Map<YourDto>(created);
}
```

### Step 3: Log UPDATE Operations
```csharp
public async Task<YourDto> UpdateAsync(long id, UpdateYourRequestDto request)
{
    var entity = await _unitOfWork.Repository.GetByIdAsync(id);
    if (entity == null) throw new NotFoundException();

    var previousPrice = entity.Price; // If updating price
    _mapper.Map(request, entity);
    await _unitOfWork.Repository.UpdateAsync(entity);
    await _unitOfWork.SaveAsync();

    // Log the update
    await _loggingService.LogPerformanceAsync(
        performedBy: 1,
        performedOutlet: 1,
        performModule: 1,
        operationType: 2,         // UPDATE
        performRemark: $"Updated: {entity.Name}",
        operationId: id);

    // If price changed, log it
    if (previousPrice != entity.Price)
    {
        await _loggingService.LogPriceChangeAsync(
            itemId: id,
            previousPrice: previousPrice,
            newPrice: entity.Price,
            performLogId: id);
    }

    return _mapper.Map<YourDto>(entity);
}
```

### Step 4: Log DELETE Operations
```csharp
public async Task DeleteAsync(long id)
{
    var entity = await _unitOfWork.Repository.GetByIdAsync(id);
    if (entity == null) throw new NotFoundException();

    entity.IsDeleted = true;
    await _unitOfWork.Repository.UpdateAsync(entity);
    await _unitOfWork.SaveAsync();

    // Log the deletion
    await _loggingService.LogPerformanceAsync(
        performedBy: 1,
        performedOutlet: 1,
        performModule: 1,
        operationType: 3,         // DELETE
        performRemark: $"Deleted: {entity.Name}",
        operationId: id);
}
```

---

## Getting Current User Information

Currently, the logging service uses hardcoded values (performedBy: 1, performedOutlet: 1). 

To implement proper user tracking, add these to services:

```csharp
// Get current user ID from HTTP context
private long GetCurrentUserId()
{
    var userIdClaim = _httpContextAccessor.HttpContext?.User
        .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
    return long.Parse(userIdClaim?.Value ?? "1");
}

// Get current outlet from user context
private long GetCurrentOutlet()
{
    // Get from user's location assignment or settings
    return 1; // Default
}
```

Then use in logging:
```csharp
await _loggingService.LogPerformanceAsync(
    performedBy: GetCurrentUserId(),
    performedOutlet: GetCurrentOutlet(),
    ...
);
```

---

## Audit Trail Queries

### Get all operations for a specific user
```sql
SELECT * FROM "PerformLog" 
WHERE "PerformedBy" = {userId}
ORDER BY "PerformDate" DESC;
```

### Get price change history for an item
```sql
SELECT pl.*, i."ItemCode"
FROM "PriceLog" pl
JOIN "Item" i ON pl."ItemID" = i."ID"
WHERE pl."ItemID" = {itemId}
ORDER BY pl."ID" DESC;
```

### Get stock movement history
```sql
SELECT il.*, i."ItemCode", l."LocationName"
FROM "InventoryLog" il
JOIN "Item" i ON il."ItemID" = i."ID"
JOIN "Location" l ON il."LocationID" = l."ID"
ORDER BY il."ID" DESC;
```

### Get all changes on a specific date
```sql
SELECT * FROM "PerformLog"
WHERE DATE("PerformDate") = '2026-07-07'
ORDER BY "PerformDate" DESC;
```

---

## Benefits of Audit Logging

✅ **Compliance** - Meet regulatory requirements  
✅ **Traceability** - Know who changed what and when  
✅ **Accountability** - Users can be held responsible for their actions  
✅ **Recovery** - Restore previous values if needed  
✅ **Analytics** - Analyze usage patterns  
✅ **Security** - Detect suspicious activities  

---

## Next Steps

1. ✅ ItemService - Fully implemented
2. ✅ InventoryService - Fully implemented
3. ⏳ Update remaining services with logging
4. ⏳ Add IHttpContextAccessor to get actual current user
5. ⏳ Create audit report endpoints
6. ⏳ Add audit log viewing in frontend

