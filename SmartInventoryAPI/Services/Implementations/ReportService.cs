using AutoMapper;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities;
using SmartInventoryAPI.Models.Data_Enums;

namespace SmartInventoryAPI.Services.Implementations;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ReportService> _logger;

    public ReportService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ReportService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<byte[]> ExportMasterDataAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Starting master data export");

            var records = new List<Dictionary<string, object?>>();
            var columnNames = new List<string>();

            // Export Users
            var users = await _unitOfWork.User.GetAllUsersWithPermission(0, int.MaxValue);
            var nonDeletedUsers = users.Where(u => !u.Is_Deleted).ToList();
            if (nonDeletedUsers.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "USERS" } });
                var userColumns = new[] { "ID", "User_Name", "Email", "Mobile_Number", "Role" };
                foreach (var user in nonDeletedUsers)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "ID", user.ID },
                        { "User_Name", user.Username },
                        { "Email", user.Email },
                        { "Mobile_Number", user.Mobile_No ?? "" },
                        { "Role", user.Role_Permission?.role_name ?? "" }
                    });
                }
                if (!columnNames.Contains("DataType"))
                    columnNames.AddRange(new[] { "DataType", "ID", "User_Name", "Email", "Mobile_Number", "Role" });
            }

            // Export Items
            var items = await _unitOfWork.Items.GetAllAsync(0, int.MaxValue);
            var nonDeletedItems = items.Where(i => !i.Is_Deleted).ToList();
            if (nonDeletedItems.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "ITEMS" } });
                foreach (var item in nonDeletedItems)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "ITEMS" },
                        { "ID", item.ID },
                        { "Item_Code", item.Item_Code },
                        { "Item_Name", item.Item_Name },
                        { "Category", item.Item_Category ?? "" },
                        { "Unit_Of_Measure", item.Unit_Of_Measure ?? "" },
                        { "Unit_Cost", item.Unit_Cost },
                        { "Is_Active", item.Is_Active }
                    });
                }
                if (!columnNames.Contains("Item_Code"))
                    columnNames.AddRange(new[] { "Item_Code", "Item_Name", "Category", "Unit_Of_Measure", "Unit_Cost", "Is_Active" });
            }

            // Export Locations
            var locations = await _unitOfWork.Locations.GetAllAsync(0, int.MaxValue);
            var nonDeletedLocations = locations.Where(l => !l.Is_Deleted).ToList();
            if (nonDeletedLocations.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "LOCATIONS" } });
                foreach (var location in nonDeletedLocations)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "LOCATIONS" },
                        { "ID", location.ID },
                        { "Location_Name", location.Location_Name },
                        { "Location_Type", location.Location_Type == 0 ? "Outlet" : "Warehouse" },
                        { "Address", location.Address ?? "" },
                        //{ "Is_Active", location.Is_Active }
                    });
                }
            }

            // Export Vendors
            var vendors = await _unitOfWork.Vendors.GetAllAsync(0, int.MaxValue);
            var nonDeletedVendors = vendors.Where(v => !v.Is_Deleted).ToList();
            if (nonDeletedVendors.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "VENDORS" } });
                foreach (var vendor in nonDeletedVendors)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "VENDORS" },
                        { "ID", vendor.ID },
                        { "Vendor_Name", vendor.Company_Name },
                        { "Contact_Person", vendor.Mobile ?? "" },
                        { "Vendor_Code", vendor.Vendor_Code ?? "" },
                        { "Email", vendor.Email ?? "" }
                    });
                }
            }

            // Export Customers
            var customers = await _unitOfWork.Customers.GetAllAsync(0, int.MaxValue);
            var nonDeletedCustomers = customers.Where(c => !c.Is_Deleted).ToList();
            if (nonDeletedCustomers.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "CUSTOMERS" } });
                foreach (var customer in nonDeletedCustomers)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "CUSTOMERS" },
                        { "ID", customer.ID },
                        { "Customer_Name", customer.Company_Name },
                        { "Contact_Person", customer.Mobile ?? "" },
                        { "Email", customer.Email ?? "" },
                        { "Customer_Code", customer.Customer_Code ?? "" }
                    });
                }
            }

            var finalColumnNames = columnNames.Distinct().ToArray();
            var csvBytes = CsvGenerator.GenerateCsvFromDictionaries(records, finalColumnNames);

            _logger.LogInformation("Master data export completed successfully");
            return csvBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting master data");
            throw;
        }
    }

    public async Task<byte[]> ExportTransactionalDataAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Starting transactional data export");

            var records = new List<Dictionary<string, object?>>();
            var columnNames = new List<string>();

            // Export Inventory
            var inventory = await _unitOfWork.Inventories.GetAllAsync(0, int.MaxValue);
            var nonDeletedInventory = inventory.Where(i => !i.Is_Deleted).ToList();
            if (nonDeletedInventory.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "INVENTORY" } });
                foreach (var inv in nonDeletedInventory)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "INVENTORY" },
                        { "ID", inv.ID },
                        { "Item_Code", inv.Item?.Item_Code ?? "" },
                        { "Item_Name", inv.Item?.Item_Name ?? "" },
                        { "Location", inv.Location?.Location_Name ?? "" },
                        { "On_Hand_Qty", inv.On_Hand_Quantity },
                        { "Available_Qty", inv.Available_Quantity },
                    });
                }
                if (!columnNames.Contains("Item_Code"))
                    columnNames.AddRange(new[] { "Item_Code", "Item_Name", "Location", "On_Hand_Qty", "Available_Qty", "Last_Updated" });
            }

            // Export Inventory Logs
            var inventoryLogs = await _unitOfWork.InventoryLogs.GetAllAsync(0, int.MaxValue);
            var nonDeletedLogs = inventoryLogs.Where(l => !l.Is_Deleted).ToList();
            if (nonDeletedLogs.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "INVENTORY_LOGS" } });
                foreach (var log in nonDeletedLogs)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "INVENTORY_LOGS" },
                        { "ID", log.ID },
                        { "Item_Code", log.Item?.Item_Code ?? "" },
                        { "Location", log.Location?.Location_Name ?? "" },
                        { "Quantity", log.Onhand_Quantity_Movement },
                        { "Log_Date", log.Available_Quantity_Movement },
                        { "Performed_By", log.PerformLog.User.Full_Name }
                    });
                }
            }

            // Export Purchase Orders
            var purchaseOrders = await _unitOfWork.PurchaseOrders.GetAllAsync(0, int.MaxValue);
            var nonDeletedPOs = purchaseOrders.Where(po => !po.Is_Deleted).ToList();
            if (nonDeletedPOs.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "PURCHASE_ORDERS" } });
                foreach (var po in nonDeletedPOs)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "PURCHASE_ORDERS" },
                        { "ID", po.ID },
                        { "PO_Number", po.PO_Reference_No },
                        { "Vendor", po.Vendor?.Company_Name ?? "" },
                        { "Order_Date", po.Purchase_Date },
                        { "Remarks", po.Remark ?? (object)"" },
                        { "Status", (PurchaseOrderHeaderStatusEnum)po.Status },
                        { "Total_Amount", po.Total_Amount }
                    });
                }
                if (!columnNames.Contains("PO_Number"))
                    columnNames.AddRange(new[] { "PO_Number", "Vendor", "Order_Date", "Expected_Delivery_Date", "Status", "Total_Amount" });
            }

            // Export Sales
            var sales = await _unitOfWork.Sales.GetAllAsync(0, int.MaxValue);
            var nonDeletedSales = sales.Where(s => !s.Is_Deleted).ToList();
            if (nonDeletedSales.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "SALES" } });
                foreach (var sale in nonDeletedSales)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "SALES" },
                        { "ID", sale.ID },
                        { "Sales_Order_ID", sale.Sales_Order_ID },
                        { "Item_Code", sale.Items ?? "" },
                        { "Quantity_Sold", sale.Quantity_Sold },
                        { "Unit_Price", sale.Unit_Price },
                        { "Total_Price", sale.Total_Price },
                        { "Sale_Date", sale.Sale_Date }
                    });
                }
                if (!columnNames.Contains("Sales_Order_ID"))
                    columnNames.AddRange(new[] { "Sales_Order_ID", "Customer", "Quantity_Sold", "Unit_Price", "Total_Price", "Sale_Date" });
            }

            // Export Stock Transfers
            var stockTransfers = await _unitOfWork.StockTransfers.GetAllAsync(0, int.MaxValue);
            var nonDeletedTransfers = stockTransfers.Where(st => !st.Is_Deleted).ToList();
            if (nonDeletedTransfers.Any())
            {
                records.Add(new Dictionary<string, object?> { { "DataType", "STOCK_TRANSFERS" } });
                foreach (var transfer in nonDeletedTransfers)
                {
                    records.Add(new Dictionary<string, object?>
                    {
                        { "DataType", "STOCK_TRANSFERS" },
                        { "ID", transfer.ID },
                        { "Item_Code", transfer.Item?.Item_Code ?? "" },
                        { "From_Location", transfer.FromLocation?.Location_Name ?? "" },
                        { "To_Location", transfer.ToLocation?.Location_Name ?? "" },
                        { "Transferred_Quantity", transfer.Transfer_Quantity },
                        { "Received_Quantity", transfer.Received_Quantity },
                        { "Transfer_Date", transfer.Transfer_Date },
                        { "Status", (StockTransferStatusEnum)transfer.Status }
                    });
                }
                if (!columnNames.Contains("Transfer_ID"))
                    columnNames.AddRange(new[] { "Transfer_ID", "From_Location", "To_Location", "Quantity", "Transfer_Date", "Status" });
            }

            var finalColumnNames = columnNames.Distinct().ToArray();
            var csvBytes = CsvGenerator.GenerateCsvFromDictionaries(records, finalColumnNames);

            _logger.LogInformation("Transactional data export completed successfully");
            return csvBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transactional data");
            throw;
        }
    }

    public async Task<byte[]> ExportAllDataAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        _logger.LogInformation("Starting complete data export");

        var masterData = await ExportMasterDataAsync(startDate, endDate);
        var transactionalData = await ExportTransactionalDataAsync(startDate, endDate);

        var combined = new List<byte>();
        combined.AddRange(masterData);
        combined.AddRange(transactionalData);

        _logger.LogInformation("Complete data export completed successfully");
        return combined.ToArray();
    }
}
