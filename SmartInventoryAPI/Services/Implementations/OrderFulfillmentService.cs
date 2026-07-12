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
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.Customer_ID);
        if (customer == null || customer.Is_Deleted)
            throw new NotFoundException("Customer not found");

        var location = await _unitOfWork.Locations.GetByIdAsync(request.Location_ID);
        if (location == null || location.Is_Deleted)
            throw new NotFoundException("Location not found");

        var order = new OrderFulfillmentHeader
        {
            Location_ID = request.Location_ID,
            Customer_ID = request.Customer_ID,
            Order_Date = request.Order_Date,
            Order_Time = DateTime.UtcNow.TimeOfDay,
            Shipment_Address_Line_1 = request.Shipment_Address_Line_1,
            Shipment_Address_Line_2 = request.Shipment_Address_Line_2,
            Shipment_City = request.Shipment_City,
            Shipment_State = request.Shipment_State,
            Shipment_PostCode = request.Shipment_PostCode,
            Shipment_Country_Code = request.Shipment_Country_Code,
            Status = 1,
            Verified_By = 1,
            Total_Amount = 0
        };

        var createdOrder = await _unitOfWork.OrderFulfillments.AddAsync(order);
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
                    Status = 1,
                    Sub_Total = item.Request_Quantity * item.Unit_Price,
                    Shipped_Quantity = 0
                };
                await _unitOfWork.OrderFulfillments.AddAsync(createdOrder);
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

        return _mapper.Map<OrderFulfillmentDetailDto>(order);
    }

    public async Task<IEnumerable<OrderFulfillmentDto>> GetAllOrderFulfillmentsAsync(int skip = 0, int take = 10)
    {
        var orders = await _unitOfWork.OrderFulfillments.GetAllAsync(skip, take);
        return _mapper.Map<IEnumerable<OrderFulfillmentDto>>(orders.Where(o => !o.Is_Deleted));
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

    public async Task<IEnumerable<OrderFulfillmentDto>> GetByCustomerAsync(long customerId, int skip = 0, int take = 10)
    {
        var orders = await _unitOfWork.OrderFulfillments.GetByCustomerAsync(customerId, skip, take);
        return _mapper.Map<IEnumerable<OrderFulfillmentDto>>(orders);
    }
}
