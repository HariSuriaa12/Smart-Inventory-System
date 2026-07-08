using AutoMapper;
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
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerID);
        if (customer == null || customer.IsDeleted)
            throw new NotFoundException("Customer not found");

        var location = await _unitOfWork.Locations.GetByIdAsync(request.LocationID);
        if (location == null || location.IsDeleted)
            throw new NotFoundException("Location not found");

        var order = new OrderFulfillmentHeader
        {
            LocationID = request.LocationID,
            CustomerID = request.CustomerID,
            OrderDate = request.OrderDate,
            OrderTime = DateTime.UtcNow.TimeOfDay,
            ShipmentAddressLine1 = request.ShipmentAddressLine1,
            ShipmentAddressLine2 = request.ShipmentAddressLine2,
            ShipmentCity = request.ShipmentCity,
            ShipmentState = request.ShipmentState,
            ShipmentPostCode = request.ShipmentPostCode,
            ShipmentCountryCode = request.ShipmentCountryCode,
            Status = 1,
            VerifiedBy = 1,
            TotalAmount = 0
        };

        var createdOrder = await _unitOfWork.OrderFulfillments.AddAsync(order);
        decimal totalAmount = 0;

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                var orderItem = new OrderFulfillmentItem
                {
                    FulfillmentID = createdOrder.ID,
                    ItemID = item.ItemID,
                    RequestQuantity = item.RequestQuantity,
                    UnitPrice = item.UnitPrice,
                    Status = 1,
                    SubTotal = item.RequestQuantity * item.UnitPrice,
                    ShippedQuantity = 0
                };
                await _unitOfWork.OrderFulfillments.AddAsync(createdOrder);
                totalAmount += orderItem.SubTotal;
            }
        }

        createdOrder.TotalAmount = totalAmount;
        await _unitOfWork.OrderFulfillments.UpdateAsync(createdOrder);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment received for Customer {CustomerID}", request.CustomerID);

        return await GetOrderFulfillmentByIdAsync(createdOrder.ID);
    }

    public async Task<OrderFulfillmentDetailDto> GetOrderFulfillmentByIdAsync(long id)
    {
        var order = await _unitOfWork.OrderFulfillments.GetWithItemsAsync(id);
        if (order == null || order.IsDeleted)
            throw new NotFoundException("Order Fulfillment not found");

        return _mapper.Map<OrderFulfillmentDetailDto>(order);
    }

    public async Task<IEnumerable<OrderFulfillmentDto>> GetAllOrderFulfillmentsAsync(int skip = 0, int take = 10)
    {
        var orders = await _unitOfWork.OrderFulfillments.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<OrderFulfillmentDto>>(orders.Where(o => !o.IsDeleted));
    }

    public async Task<OrderFulfillmentDetailDto> UpdateOrderFulfillmentAsync(long id, UpdateOrderFulfillmentRequestDto request)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null || order.IsDeleted)
            throw new NotFoundException("Order Fulfillment not found");

        order.Status = request.Status;
        order.Remark = request.Remark;

        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment {ID} updated", id);

        return await GetOrderFulfillmentByIdAsync(id);
    }

    public async Task DeleteOrderFulfillmentAsync(long id)
    {
        var order = await _unitOfWork.OrderFulfillments.GetByIdAsync(id);
        if (order == null)
            throw new NotFoundException("Order Fulfillment not found");

        order.IsDeleted = true;
        await _unitOfWork.OrderFulfillments.UpdateAsync(order);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Order Fulfillment {ID} deleted", id);
    }

    public async Task<IEnumerable<OrderFulfillmentDto>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10)
    {
        var orders = await _unitOfWork.OrderFulfillments.GetByCustomerAsync(customerId, skip, take);
        return _mapper.Map<IEnumerable<OrderFulfillmentDto>>(orders);
    }
}
