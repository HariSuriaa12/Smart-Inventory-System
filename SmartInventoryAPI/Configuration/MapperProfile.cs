using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Auth;
using SmartInventoryAPI.Models.DTOs.Request.Customer;
using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Request.Item;
using SmartInventoryAPI.Models.DTOs.Request.Location;
using SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;
using SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;
using SmartInventoryAPI.Models.DTOs.Request.Sales;
using SmartInventoryAPI.Models.DTOs.Request.User;
using SmartInventoryAPI.Models.DTOs.Request.Vendor;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Configuration;

public class MapperProfile : Profile
{
    public MapperProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserRequestDto, User>();
        CreateMap<UpdateUserRequestDto, User>();

        // Item mappings
        CreateMap<Item, ItemDto>();
        CreateMap<CreateItemRequestDto, Item>();
        CreateMap<UpdateItemRequestDto, Item>();

        // Location mappings
        CreateMap<Location, LocationDto>();
        CreateMap<CreateLocationRequestDto, Location>();
        CreateMap<UpdateLocationRequestDto, Location>();

        // Vendor mappings
        CreateMap<Vendor, VendorDto>();
        CreateMap<CreateVendorRequestDto, Vendor>();
        CreateMap<UpdateVendorRequestDto, Vendor>();

        // Customer mappings
        CreateMap<Customer, CustomerDto>();
        CreateMap<CreateCustomerRequestDto, Customer>();
        CreateMap<UpdateCustomerRequestDto, Customer>();

        // Inventory mappings
        CreateMap<Inventory, InventoryDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item != null ? src.Item.ItemName : ""))
            .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location != null ? src.Location.LocationName : ""));

        // PurchaseOrder mappings
        CreateMap<PurchaseOrderHeader, PurchaseOrderDto>()
            .ForMember(dest => dest.VendorName, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.CompanyName : ""))
            .ForMember(dest => dest.CreationDate, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item != null ? src.Item.ItemName : ""));

        CreateMap<PurchaseOrderHeader, PurchaseOrderDetailDto>()
            .ForMember(dest => dest.VendorName, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.CompanyName : ""));

        // OrderFulfillment mappings
        CreateMap<OrderFulfillmentHeader, OrderFulfillmentDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.CompanyName : ""));

        CreateMap<OrderFulfillmentItem, OrderFulfillmentItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item != null ? src.Item.ItemName : ""));

        CreateMap<OrderFulfillmentHeader, OrderFulfillmentDetailDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.CompanyName : ""));

        // Sales mappings
        CreateMap<Sales, SalesDto>()
            .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location != null ? src.Location.LocationName : ""));

        CreateMap<SalesItem, SalesItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item != null ? src.Item.ItemName : ""));

        CreateMap<Sales, SalesDetailDto>()
            .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location != null ? src.Location.LocationName : ""));

        // Forecast mappings
        CreateMap<ForecastedResult, ForecastDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item != null ? src.Item.ItemName : ""))
            .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location != null ? src.Location.LocationName : ""));
    }
}
