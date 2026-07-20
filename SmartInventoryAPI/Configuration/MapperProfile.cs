using AutoMapper;
using SmartInventoryAPI.Models.DTOs.Request.Auth;
using SmartInventoryAPI.Models.DTOs.Request.Customer;
using SmartInventoryAPI.Models.DTOs.Request.Inventory;
using SmartInventoryAPI.Models.DTOs.Request.Item;
using SmartInventoryAPI.Models.DTOs.Request.Location;
using SmartInventoryAPI.Models.DTOs.Request.OrderFulfillment;
using SmartInventoryAPI.Models.DTOs.Request.PurchaseOrder;
using SmartInventoryAPI.Models.DTOs.Request.RolePermission;
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
        CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role_Name, opt => opt.MapFrom(src => src.Role_Permission != null ? src.Role_Permission.role_name : ""));

        CreateMap<CreateUserRequestDto, User>();
        CreateMap<UpdateUserRequestDto, User>();
        CreateMap<UpdateUserRequestDto, User>()
        .AfterMap((src, dest) =>
        {
            if (dest.Creation_Date.Kind != DateTimeKind.Utc)
            {
                dest.Creation_Date = DateTime.SpecifyKind(dest.Creation_Date, DateTimeKind.Utc);
            }
        })
        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Item mappings
        CreateMap<Item, ItemDto>();
        CreateMap<CreateItemRequestDto, Item>();
        CreateMap<UpdateItemRequestDto, Item>();
        CreateMap<UpdateItemRequestDto, Item>()
        .AfterMap((src, dest) =>
        {
            if (dest.Creation_Date.Kind != DateTimeKind.Utc)
            {
                dest.Creation_Date = DateTime.SpecifyKind(dest.Creation_Date, DateTimeKind.Utc);
            }
        })
        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Location mappings
        CreateMap<Location, LocationDto>();
        CreateMap<CreateLocationRequestDto, Location>();
        CreateMap<UpdateLocationRequestDto, Location>();
        CreateMap<UpdateLocationRequestDto, Location>()
        .AfterMap((src, dest) =>
        {
            if (dest.Creation_Date.Kind != DateTimeKind.Utc)
            {
                dest.Creation_Date = DateTime.SpecifyKind(dest.Creation_Date, DateTimeKind.Utc);
            }
        })
        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Vendor mappings
        CreateMap<Vendor, VendorDto>();
        CreateMap<CreateVendorRequestDto, Vendor>();
        CreateMap<UpdateVendorRequestDto, Vendor>();
        CreateMap<UpdateVendorRequestDto, Vendor>()
        .AfterMap((src, dest) =>
        {
            if (dest.Creation_Date.Kind != DateTimeKind.Utc)
            {
                dest.Creation_Date = DateTime.SpecifyKind(dest.Creation_Date, DateTimeKind.Utc);
            }
        })
        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Customer mappings
        CreateMap<Customer, CustomerDto>();
        CreateMap<CreateCustomerRequestDto, Customer>();
        CreateMap<UpdateCustomerRequestDto, Customer>();
        CreateMap<UpdateCustomerRequestDto, Customer>()
        .AfterMap((src, dest) =>
        {
            if (dest.Creation_Date.Kind != DateTimeKind.Utc)
            {
                dest.Creation_Date = DateTime.SpecifyKind(dest.Creation_Date, DateTimeKind.Utc);
            }
        })
        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Inventory mappings
        CreateMap<Inventory, InventoryDto>()
            .ForMember(dest => dest.Item_Name, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Name : ""))
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""));

        CreateMap<Inventory, InventoryDetailDto>();
        CreateMap<Item, ItemDetailDto>();
        CreateMap<Location, LocationDetailDto>();

        // PurchaseOrder mappings
        CreateMap<PurchaseOrderHeader, PurchaseOrderDto>()
            .ForMember(dest => dest.Vendor_Name, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Company_Name : ""))
            .ForMember(dest => dest.Vendor_Code, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Vendor_Code : ""))
            .ForMember(dest => dest.Vendor_Mobile, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Mobile : ""))
            .ForMember(dest => dest.Vendor_Email, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Email : ""))
            .ForMember(dest => dest.Vendor_Company_Address, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Company_Address : ""))
            .ForMember(dest => dest.User_Full_Name, opt => opt.MapFrom(src => src.User != null ? src.User.Full_Name : ""))
            .ForMember(dest => dest.User_Staff_Code, opt => opt.MapFrom(src => src.User != null ? src.User.Staff_Code : ""))
            .ForMember(dest => dest.User_Mobile_No, opt => opt.MapFrom(src => src.User != null ? src.User.Mobile_No : ""))
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""));

        CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>()
            .ForMember(dest => dest.Item_Name, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Name : ""))
            .ForMember(dest => dest.Item_Code, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Code : ""))
            .ForMember(dest => dest.Item_Category, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Category : ""))
            .ForMember(dest => dest.Unit_Of_Measure, opt => opt.MapFrom(src => src.Item != null ? src.Item.Unit_Of_Measure : ""));

        CreateMap<PurchaseOrderHeader, PurchaseOrderDetailDto>()
            .ForMember(dest => dest.Vendor_Name, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Company_Name : ""))
            .ForMember(dest => dest.Vendor_Code, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Vendor_Code : ""))
            .ForMember(dest => dest.Vendor_Mobile, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Mobile : ""))
            .ForMember(dest => dest.Vendor_Email, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Email : ""))
            .ForMember(dest => dest.Vendor_Company_Address, opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Company_Address : ""))
            .ForMember(dest => dest.User_Full_Name, opt => opt.MapFrom(src => src.User != null ? src.User.Full_Name : ""))
            .ForMember(dest => dest.User_Staff_Code, opt => opt.MapFrom(src => src.User != null ? src.User.Staff_Code : ""))
            .ForMember(dest => dest.User_Mobile_No, opt => opt.MapFrom(src => src.User != null ? src.User.Mobile_No : ""))
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""));

        // OrderFulfillment mappings
        CreateMap<OrderFulfillmentHeader, OrderFulfillmentDto>()
            .ForMember(dest => dest.Customer_Name, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Company_Name : ""))
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""))
            .ForMember(dest => dest.Verified_By_Name, opt => opt.MapFrom(src => src.User != null ? src.User.Full_Name : ""));

        CreateMap<OrderFulfillmentItem, OrderFulfillmentItemDto>()
            .ForMember(dest => dest.Item_Name, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Name : ""))
            .ForMember(dest => dest.Item_Code, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Code : ""))
            .ForMember(dest => dest.Item_Category, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Category : ""))
            .ForMember(dest => dest.Unit_Of_Measure, opt => opt.MapFrom(src => src.Item != null ? src.Item.Unit_Of_Measure : ""));

        CreateMap<OrderFulfillmentHeader, OrderFulfillmentDetailDto>()
            .ForMember(dest => dest.Customer_Name, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Company_Name : ""))
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""))
            .ForMember(dest => dest.Verified_By_Name, opt => opt.MapFrom(src => src.User != null ? src.User.Full_Name : ""))
            .ForMember(dest => dest.Verified_By_Code, opt => opt.MapFrom(src => src.User != null ? src.User.Staff_Code : ""));

        // Sales mappings
        CreateMap<Sales, SalesDto>()
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""))
            .ForMember(dest => dest.Total_Amount, opt => opt.MapFrom(src => src.Items != null ? src.Items.Sum(i => i.Sub_Total) : 0));

        CreateMap<SalesItem, SalesItemDto>()
            .ForMember(dest => dest.Item_Name, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Name : ""))
            .ForMember(dest => dest.Item_Code, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Code : ""))
            .ForMember(dest => dest.Item_Category, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Category : ""))
            .ForMember(dest => dest.Unit_Of_Measure, opt => opt.MapFrom(src => src.Item != null ? src.Item.Unit_Of_Measure : ""));

        CreateMap<Sales, SalesDetailDto>()
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""))
            .ForMember(dest => dest.Total_Amount, opt => opt.MapFrom(src => src.Items != null ? src.Items.Sum(i => i.Sub_Total) : 0));

        // Forecast mappings
        CreateMap<ForecastedResult, ForecastDto>()
            .ForMember(dest => dest.Item_Code, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Code : ""))
            .ForMember(dest => dest.Item_Name, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Name : ""))
            .ForMember(dest => dest.Location_Name, opt => opt.MapFrom(src => src.Location != null ? src.Location.Location_Name : ""));

        // StockTransfer mappings
        CreateMap<StockTransfer, StockTransferDto>()
            .ForMember(dest => dest.From_Location_Name, opt => opt.MapFrom(src => src.FromLocation != null ? src.FromLocation.Location_Name : ""))
            .ForMember(dest => dest.To_Location_Name, opt => opt.MapFrom(src => src.ToLocation != null ? src.ToLocation.Location_Name : ""))
            .ForMember(dest => dest.Item_Name, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Name : ""))
            .ForMember(dest => dest.Item_Code, opt => opt.MapFrom(src => src.Item != null ? src.Item.Item_Code : ""))
            .ForMember(dest => dest.User_Full_Name, opt => opt.MapFrom(src => src.User != null ? src.User.Full_Name : ""))
            .ForMember(dest => dest.User_Staff_Code, opt => opt.MapFrom(src => src.User != null ? src.User.Staff_Code : ""));

        // RolePermission mappings
        CreateMap<RolePermission, RolePermissionDto>();
        CreateMap<CreateRolePermissionRequestDto, RolePermission>();
        CreateMap<UpdateRolePermissionRequestDto, RolePermission>();
    }
}
