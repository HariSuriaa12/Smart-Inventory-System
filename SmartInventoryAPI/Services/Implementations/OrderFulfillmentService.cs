using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class OrderFulfillmentService : IOrderFulfillmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<OrderFulfillmentService> _logger;

    public OrderFulfillmentService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<OrderFulfillmentService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<OrderFulfillmentDetailDto> ReceiveOrderFulfillmentAsync(ReceiveOrderFulfillmentRequestDto request)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.Customer_ID);
        if (customer == null || customer.Is_Deleted)
            throw new NotFoundException("Customer not found");

        var order = new OrderFulfillmentHeader
        {
            Location_ID = 0,
            Customer_ID = request.Customer_ID,
            Order_Date = request.Order_Date,
            Order_Time = DateTime.UtcNow.TimeOfDay,
            Shipment_Address_Line_1 = request.Shipment_Address_Line_1,
            Shipment_Address_Line_2 = request.Shipment_Address_Line_2,
            Shipment_City = request.Shipment_City,
            Shipment_State = request.Shipment_State,
            Shipment_PostCode = request.Shipment_PostCode,
            Shipment_Country_Code = request.Shipment_Country_Code,
            Status = 0,
            Verified_By = 0,
            Total_Amount = 0
        };

        var createdOrder = await _unitOfWork.OrderFulfillments.AddAsync(order);
        await _unitOfWork.SaveAsync();
        decimal totalAmount = 0;

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                var orderItem = new OrderFulfillmentItem
                {
                    Fulfillment_ID = createdOrder.ID,
                    Item_ID = item.Item_ID,
                    Request_Quantity = item.Request_Quantity,
                    Unit_Price = item.Unit_Price,
                    Status = 0,
                    Sub_Total = item.Request_Quantity * item.Unit_Price,
                    Shipped_Quantity = 0
                };
                await _unitOfWork.Context.Set<OrderFulfillmentItem>().AddAsync(orderItem);
                totalAmount += orderItem.Sub_Total;
            }
        }

        createdOrder.Total_Amount = totalAmount;
        await _unitOfWork.OrderFulfillments.UpdateAsync(createdOrder);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment received for Customer {CustomerID}", request.Customer_ID);

        return await GetOrderFulfillmentByIdAsync(createdOrder.ID);
    }

    public async Task<OrderFulfillmentDetailDto> GetOrderFulfillmentByIdAsync(long id)
    {
        var order = await _unitOfWork.OrderFulfillments.GetWithItemsAsync(id);
        if (order == null || order.Is_Deleted)
            throw new NotFoundException("Order Fulfillment not found");
        else
            order.Items = order.Items?.Where(i => !i.Is_Deleted).ToList();

        return _mapper.Map<OrderFulfillmentDetailDto>(order);
    }

    public async Task<PaginatedResponseDto<OrderFulfillmentDto>> GetAllOrderFulfillmentsAsync(
        int skip = 0, int take = 10, long? fulfillmentId = null, long? customerId = null,
        bool? unprocessedOnly = null, long? locationId = null)
    {
        IQueryable<OrderFulfillmentHeader> query = _unitOfWork.Context.Set<OrderFulfillmentHeader>()
            .Where(o => !o.Is_Deleted)
            .Include(o => o.Customer)
            .Include(o => o.Location)
            .Include(o => o.User);

        if (fulfillmentId.HasValue)
            query = query.Where(o => o.ID == fulfillmentId.Value);

        if (customerId.HasValue)
            query = query.Where(o => o.Customer_ID == customerId.Value);

        if (unprocessedOnly.HasValue && unprocessedOnly.Value)
            query = query.Where(o => o.Location_ID == 0);
        else if (locationId.HasValue)
            query = query.Where(o => o.Location_ID == locationId.Value);

        var total = await query.CountAsync();
        var orders = await query.Skip(skip).Take(take).ToListAsync();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<OrderFulfillmentDto>
        {
            Data = _mapper.Map<IEnumerable<OrderFulfillmentDto>>(orders),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<OrderFulfillmentDetailDto> UpdateOrderFulfillmentAsync(long id, UpdateOrderFulfillmentRequestDto request)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null || order.Is_Deleted)
            throw new NotFoundException("Order Fulfillment not found");

        order.Status = request.Status;
        order.Remark = request.Remark;

        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment {ID} updated", id);

        return await GetOrderFulfillmentByIdAsync(id);
    }

    public async Task<OrderFulfillmentDetailDto> VerifyAndAssignAsync(long id, long locationId)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null || order.Is_Deleted)
            throw new NotFoundException("Order Fulfillment not found");

        if (order.Status != 0)
            throw new BadRequestException("Only unassigned fulfillments can be verified");

        var location = await _unitOfWork.Locations.GetByIdAsync(locationId);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        order.Location_ID = locationId;
        order.Status = 5;

        var items = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .Where(i => i.Fulfillment_ID == id && !i.Is_Deleted)
            .ToListAsync();

        foreach (var item in items)
        {
            item.Status = 5;
        }

        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        _unitOfWork.Context.Set<OrderFulfillmentItem>().UpdateRange(items);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment {ID} verified and assigned to Location {LocationID}", id, locationId);

        return await GetOrderFulfillmentByIdAsync(id);
    }

    public async Task<OrderFulfillmentDetailDto> ShipItemAsync(long id, long itemId, decimal shippedQuantity)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null || order.Is_Deleted)
            throw new NotFoundException("Order Fulfillment not found");

        var item = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .FirstOrDefaultAsync(i => i.ID == itemId && i.Fulfillment_ID == id && !i.Is_Deleted);
        if (item == null)
            throw new NotFoundException("Order Fulfillment item not found");

        if (shippedQuantity < 0)
            throw new BadRequestException("Shipped quantity cannot be negative");
        if (shippedQuantity > item.Request_Quantity)
            throw new BadRequestException($"Shipped quantity cannot exceed requested quantity ({item.Request_Quantity})");

        item.Shipped_Quantity = shippedQuantity;

        if (shippedQuantity == item.Request_Quantity)
        {
            item.Status = 3;
        }
        else if (shippedQuantity > 0)
        {
            item.Status = 2;
        }
        else
        {
            item.Status = 5;
        }

        _unitOfWork.Context.Set<OrderFulfillmentItem>().Update(item);

        var allItems = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .Where(i => i.Fulfillment_ID == id && !i.Is_Deleted)
            .ToListAsync();

        bool allShipped = allItems.All(i => i.Shipped_Quantity >= i.Request_Quantity);
        bool anyShipped = allItems.Any(i => i.Shipped_Quantity > 0);

        if (allShipped)
        {
            order.Status = 3;
        }
        else if (anyShipped)
        {
            order.Status = 2;
        }

        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Item {ItemID} shipped with quantity {Qty} for Order Fulfillment {OFID}", itemId, shippedQuantity, id);

        return await GetOrderFulfillmentByIdAsync(id);
    }

    public async Task<OrderFulfillmentDetailDto> CancelItemAsync(long id, long itemId)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null || order.Is_Deleted)
            throw new NotFoundException("Order Fulfillment not found");

        if (order.Status == 0)
            throw new BadRequestException("Cannot cancel individual items for unassigned fulfillments");

        var item = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .FirstOrDefaultAsync(i => i.ID == itemId && i.Fulfillment_ID == id && !i.Is_Deleted);
        if (item == null)
            throw new NotFoundException("Order Fulfillment item not found");

        if (item.Status != 5 && item.Status != 2 && item.Status != 3)
            throw new BadRequestException("Only Verified, Partially Fulfilled, or Fulfilled items can be cancelled");

        item.Status = 4;
        _unitOfWork.Context.Set<OrderFulfillmentItem>().Update(item);

        var allItems = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .Where(i => i.Fulfillment_ID == id && !i.Is_Deleted)
            .ToListAsync();

        bool allCancelled = allItems.All(i => i.Status == 4);

        if (allCancelled)
        {
            order.Status = 4;
        }

        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Item {ItemID} cancelled for Order Fulfillment {OFID}", itemId, id);

        return await GetOrderFulfillmentByIdAsync(id);
    }

    public async Task<OrderFulfillmentDetailDto> CancelItemWithReturnAsync(long id, long itemId)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null || order.Is_Deleted)
            throw new NotFoundException("Order Fulfillment not found");

        if (order.Status == 0)
            throw new BadRequestException("Cannot cancel individual items for unassigned fulfillments");

        var item = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .FirstOrDefaultAsync(i => i.ID == itemId && i.Fulfillment_ID == id && !i.Is_Deleted);
        if (item == null)
            throw new NotFoundException("Order Fulfillment item not found");

        if (item.Status != 2 && item.Status != 3)
            throw new BadRequestException("Items can only be cancelled with return if they are Partially Fulfilled or Fulfilled");

        item.Shipped_Quantity = 0;
        item.Status = 4;

        _unitOfWork.Context.Set<OrderFulfillmentItem>().Update(item);

        var allItems = await _unitOfWork.Context.Set<OrderFulfillmentItem>()
            .Where(i => i.Fulfillment_ID == id && !i.Is_Deleted && i.Status != 4)
            .ToListAsync();

        if (allItems.Count == 0)
        {
            order.Status = 4;
        }
        else
        {
            var anyShipped = allItems.Any(i => i.Shipped_Quantity > 0);
            var allShipped = allItems.All(i => i.Shipped_Quantity >= i.Request_Quantity);

            if (allShipped)
            {
                order.Status = 3;
            }
            else if (anyShipped)
            {
                order.Status = 2;
            }
            else
            {
                order.Status = 5;
            }
        }

        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Item {ItemID} cancelled with return for Order Fulfillment {OFID}", itemId, id);

        return await GetOrderFulfillmentByIdAsync(id);
    }

    public async Task DeleteOrderFulfillmentAsync(long id)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null)
            throw new NotFoundException("Order Fulfillment not found");

        order.Is_Deleted = true;
        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment {ID} deleted", id);
    }

    public async Task<PaginatedResponseDto<OrderFulfillmentDto>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10)
    {
        var query = _unitOfWork.Context.Set<OrderFulfillmentHeader>()
            .Where(o => o.Customer_ID == customerId && !o.Is_Deleted)
            .Include(o => o.Customer)
            .Include(o => o.Location)
            .Include(o => o.User);

        var total = await query.CountAsync();
        var orders = await query.Skip(skip).Take(take).ToListAsync();

        var page = (skip / take) + 1;
        var totalPages = (int)Math.Ceiling((double)total / take);

        return new PaginatedResponseDto<OrderFulfillmentDto>
        {
            Data = _mapper.Map<IEnumerable<OrderFulfillmentDto>>(orders),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }
}
