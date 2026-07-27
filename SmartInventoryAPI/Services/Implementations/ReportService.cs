using AutoMapper;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities;

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

    public async Task<byte[]> ExportMasterDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Starting master data export with modules: {Modules}", string.Join(", ", modules));
            var sheetsData = new Dictionary<string, List<Dictionary<string, object?>>>();

            if (modules.Contains("Users") || modules.Count == 0)
            {
                sheetsData.Add("Users", await GetUsersSheet());
            }

            if (modules.Contains("Items") || modules.Count == 0)
            {
                sheetsData.Add("Items", await GetItemsSheet());
            }

            if (modules.Contains("Locations") || modules.Count == 0)
            {
                sheetsData.Add("Locations", await GetLocationsSheet());
            }

            if (modules.Contains("Vendors") || modules.Count == 0)
            {
                sheetsData.Add("Vendors", await GetVendorsSheet());
            }

            if (modules.Contains("Customers") || modules.Count == 0)
            {
                sheetsData.Add("Customers", await GetCustomersSheet());
            }

            var excelBytes = ExcelGenerator.GenerateExcel(sheetsData);
            _logger.LogInformation("Master data export completed successfully");
            return excelBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting master data");
            throw;
        }
    }

    public async Task<byte[]> ExportTransactionalDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Starting transactional data export with modules: {Modules}", string.Join(", ", modules));
            var sheetsData = new Dictionary<string, List<Dictionary<string, object?>>>();

            if (modules.Contains("Inventory") || modules.Count == 0)
            {
                sheetsData.Add("Inventory", await GetInventorySheet());
            }

            if (modules.Contains("Inventory Logs") || modules.Count == 0)
            {
                sheetsData.Add("Inventory Logs", await GetInventoryLogsSheet());
            }

            if (modules.Contains("Purchase Orders") || modules.Count == 0)
            {
                sheetsData.Add("PO Headers", await GetPurchaseOrderHeadersSheet());
                sheetsData.Add("PO Items", await GetPurchaseOrderItemsSheet());
            }

            if (modules.Contains("Order Fulfillment") || modules.Count == 0)
            {
                sheetsData.Add("OF Headers", await GetOrderFulfillmentHeadersSheet());
                sheetsData.Add("OF Items", await GetOrderFulfillmentItemsSheet());
            }

            if (modules.Contains("Sales") || modules.Count == 0)
            {
                sheetsData.Add("Sales Headers", await GetSalesHeadersSheet());
                sheetsData.Add("Sales Items", await GetSalesItemsSheet());
            }

            if (modules.Contains("Stock Transfers") || modules.Count == 0)
            {
                sheetsData.Add("Stock Transfers", await GetStockTransfersSheet());
            }

            var excelBytes = ExcelGenerator.GenerateExcel(sheetsData);
            _logger.LogInformation("Transactional data export completed successfully");
            return excelBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transactional data");
            throw;
        }
    }

    public async Task<byte[]> ExportLoggingDataAsync(List<string> modules, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("Starting logging data export with modules: {Modules}", string.Join(", ", modules));
            var sheetsData = new Dictionary<string, List<Dictionary<string, object?>>>();

            if (modules.Contains("Perform Logs") || modules.Count == 0)
            {
                sheetsData.Add("Perform Logs", await GetPerformLogsSheet());
            }

            if (modules.Contains("Inventory Logs") || modules.Count == 0)
            {
                sheetsData.Add("Inventory Logs", await GetInventoryLogsSheet());
            }

            if (modules.Contains("Price Logs") || modules.Count == 0)
            {
                sheetsData.Add("Price Logs", await GetPriceLogsSheet());
            }

            var excelBytes = ExcelGenerator.GenerateExcel(sheetsData);
            _logger.LogInformation("Logging data export completed successfully");
            return excelBytes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting logging data");
            throw;
        }
    }

    // Master Data Sheets
    private async Task<List<Dictionary<string, object?>>> GetUsersSheet()
    {
        var users = await _unitOfWork.User.GetAllUsersWithPermission(0, int.MaxValue);
        var nonDeletedUsers = users.Where(u => !u.Is_Deleted).ToList();

        return nonDeletedUsers.Select(u => new Dictionary<string, object?>
        {
            { "ID", u.ID },
            { "User Name", u.Username },
            { "Email", u.Email },
            { "Mobile", u.Mobile_No ?? "" },
            { "Role", u.Role_Permission?.role_name ?? "" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetItemsSheet()
    {
        var items = await _unitOfWork.Items.GetAllAsync(0, int.MaxValue);
        var nonDeletedItems = items.Where(i => !i.Is_Deleted).ToList();

        return nonDeletedItems.Select(i => new Dictionary<string, object?>
        {
            { "ID", i.ID },
            { "Item Code", i.Item_Code },
            { "Item Name", i.Item_Name },
            { "Category", i.Item_Category ?? "" },
            { "Unit", i.Unit_Of_Measure ?? "" },
            { "Unit Cost", i.Unit_Cost },
            { "Active", i.Is_Active ? "Yes" : "No" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetLocationsSheet()
    {
        var locations = await _unitOfWork.Locations.GetAllAsync(0, int.MaxValue);
        var nonDeletedLocations = locations.Where(l => !l.Is_Deleted).ToList();

        return nonDeletedLocations.Select(l => new Dictionary<string, object?>
        {
            { "ID", l.ID },
            { "Location Name", l.Location_Name },
            { "Type", l.Location_Type == 0 ? "Outlet" : "Warehouse" },
            { "Address", l.Address ?? "" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetVendorsSheet()
    {
        var vendors = await _unitOfWork.Vendors.GetAllAsync(0, int.MaxValue);
        var nonDeletedVendors = vendors.Where(v => !v.Is_Deleted).ToList();

        return nonDeletedVendors.Select(v => new Dictionary<string, object?>
        {
            { "ID", v.ID },
            { "Vendor Code", v.Vendor_Code ?? "" },
            { "Vendor Name", v.Company_Name },
            { "Contact", v.Mobile ?? "" },
            { "Email", v.Email ?? "" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetCustomersSheet()
    {
        var customers = await _unitOfWork.Customers.GetAllAsync(0, int.MaxValue);
        var nonDeletedCustomers = customers.Where(c => !c.Is_Deleted).ToList();

        return nonDeletedCustomers.Select(c => new Dictionary<string, object?>
        {
            { "ID", c.ID },
            { "Customer Code", c.Customer_Code ?? "" },
            { "Customer Name", c.Company_Name },
            { "Contact", c.Mobile ?? "" },
            { "Email", c.Email ?? "" }
        }).ToList();
    }

    // Transactional Data Sheets
    private async Task<List<Dictionary<string, object?>>> GetInventorySheet()
    {
        var inventory = await _unitOfWork.Inventories.GetAllAsync(0, int.MaxValue);
        var nonDeletedInventory = inventory.Where(i => !i.Is_Deleted).ToList();

        return nonDeletedInventory.Select(inv => new Dictionary<string, object?>
        {
            { "ID", inv.ID },
            { "Item Code", inv.Item?.Item_Code ?? "" },
            { "Item Name", inv.Item?.Item_Name ?? "" },
            { "Location", inv.Location?.Location_Name ?? "" },
            { "On-Hand Qty", inv.On_Hand_Quantity },
            { "Available Qty", inv.Available_Quantity },
            { "Last Updated", inv.Last_Updated_Date }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetInventoryLogsSheet()
    {
        var logs = await _unitOfWork.InventoryLogs.GetAllAsync(0, int.MaxValue);
        var nonDeletedLogs = logs.Where(l => !l.Is_Deleted).ToList();

        return nonDeletedLogs.Select(log => new Dictionary<string, object?>
        {
            { "ID", log.ID },
            { "Item Code", log.Item?.Item_Code ?? "" },
            { "Item Name", log.Item?.Item_Name ?? "" },
            { "Location", log.Location?.Location_Name ?? "" },
            { "Onhand Movement", log.Onhand_Quantity_Movement },
            { "Available Movement", log.Available_Quantity_Movement },
            { "Perform Log ID", log.Performed_Log_ID },
            { "Log Date", log.PerformLog?.Perform_Date ?? DateTime.MinValue }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetPurchaseOrderHeadersSheet()
    {
        var pos = await _unitOfWork.PurchaseOrders.GetAllAsync(0, int.MaxValue);
        var nonDeletedPOs = pos.Where(po => !po.Is_Deleted).ToList();

        return nonDeletedPOs.Select(po => new Dictionary<string, object?>
        {
            { "ID", po.ID },
            { "PO Reference No", po.PO_Reference_No ?? "" },
            { "Vendor", po.Vendor?.Company_Name ?? "" },
            { "Location", po.Location?.Location_Name ?? "" },
            { "Purchase Date", po.Purchase_Date },
            { "Status", po.Status.ToString() },
            { "Total Amount", po.Total_Amount },
            { "Remark", po.Remark ?? "" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetPurchaseOrderItemsSheet()
    {
        var pos = await _unitOfWork.PurchaseOrders.GetAllAsync(0, int.MaxValue);
        var records = new List<Dictionary<string, object?>>();

        foreach (var po in pos.Where(p => !p.Is_Deleted && p.Items != null))
        {
            foreach (var item in po.Items.Where(i => !i.Is_Deleted))
            {
                records.Add(new Dictionary<string, object?>
                {
                    { "PO ID", po.ID },
                    { "PO Ref No", po.PO_Reference_No ?? "" },
                    { "Item Code", item.Item?.Item_Code ?? "" },
                    { "Item Name", item.Item?.Item_Name ?? "" },
                    { "Quantity", item.Quantity },
                    { "Unit Price", item.Unit_Price },
                    { "Total Price", item.Total_Price },
                    { "Remarks", item.Remarks ?? "" }
                });
            }
        }

        return records;
    }

    private async Task<List<Dictionary<string, object?>>> GetOrderFulfillmentHeadersSheet()
    {
        var ofs = await _unitOfWork.OrderFulfillments.GetAllAsync(0, int.MaxValue);
        var nonDeletedOFs = ofs.Where(of => !of.Is_Deleted).ToList();

        return nonDeletedOFs.Select(of => new Dictionary<string, object?>
        {
            { "ID", of.ID },
            { "Customer", of.Customer?.Company_Name ?? "" },
            { "Location", of.Location?.Location_Name ?? "" },
            { "Order Date", of.Order_Date },
            { "Status", of.Status.ToString() },
            { "Total Amount", of.Total_Amount },
            { "Shipment Address", $"{of.Shipment_Address_Line_1}, {of.Shipment_City}" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetOrderFulfillmentItemsSheet()
    {
        var ofs = await _unitOfWork.OrderFulfillments.GetAllAsync(0, int.MaxValue);
        var records = new List<Dictionary<string, object?>>();

        foreach (var of in ofs.Where(o => !o.Is_Deleted && o.Items != null))
        {
            foreach (var item in of.Items.Where(i => !i.Is_Deleted))
            {
                records.Add(new Dictionary<string, object?>
                {
                    { "OF ID", of.ID },
                    { "Customer", of.Customer?.Company_Name ?? "" },
                    { "Item Code", item.Item?.Item_Code ?? "" },
                    { "Item Name", item.Item?.Item_Name ?? "" },
                    { "Ordered Qty", item.Ordered_Quantity },
                    { "Shipped Qty", item.Shipped_Quantity ?? 0 },
                    { "Unit Price", item.Unit_Price },
                    { "Total Price", item.Total_Price }
                });
            }
        }

        return records;
    }

    private async Task<List<Dictionary<string, object?>>> GetSalesHeadersSheet()
    {
        var sales = await _unitOfWork.Sales.GetAllAsync(0, int.MaxValue);
        var nonDeletedSales = sales.Where(s => !s.Is_Deleted).ToList();

        return nonDeletedSales.Select(s => new Dictionary<string, object?>
        {
            { "ID", s.ID },
            { "Sales Number", s.Sales_Number ?? "" },
            { "Location", s.Location?.Location_Name ?? "" },
            { "Sales Date", s.Sales_Date },
            { "Status", s.Sales_Status.ToString() },
            { "Reserved", s.Is_Reserved ? "Yes" : "No" }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetSalesItemsSheet()
    {
        var sales = await _unitOfWork.Sales.GetAllAsync(0, int.MaxValue);
        var records = new List<Dictionary<string, object?>>();

        foreach (var sale in sales.Where(s => !s.Is_Deleted && s.Items != null))
        {
            foreach (var item in sale.Items.Where(i => !i.Is_Deleted))
            {
                records.Add(new Dictionary<string, object?>
                {
                    { "Sales ID", sale.ID },
                    { "Sales Number", sale.Sales_Number ?? "" },
                    { "Item Code", item.Item?.Item_Code ?? "" },
                    { "Item Name", item.Item?.Item_Name ?? "" },
                    { "Quantity Sold", item.Quantity_Sold },
                    { "Unit Price", item.Unit_Price },
                    { "Total Price", item.Total_Price }
                });
            }
        }

        return records;
    }

    private async Task<List<Dictionary<string, object?>>> GetStockTransfersSheet()
    {
        var transfers = await _unitOfWork.StockTransfers.GetAllAsync(0, int.MaxValue);
        var nonDeletedTransfers = transfers.Where(st => !st.Is_Deleted).ToList();

        return nonDeletedTransfers.Select(st => new Dictionary<string, object?>
        {
            { "ID", st.ID },
            { "Item Code", st.Item?.Item_Code ?? "" },
            { "Item Name", st.Item?.Item_Name ?? "" },
            { "From Location", st.From_Location?.Location_Name ?? "" },
            { "To Location", st.To_Location?.Location_Name ?? "" },
            { "Quantity", st.Quantity },
            { "Transfer Date", st.Transfer_Date },
            { "Status", st.Status ?? "" }
        }).ToList();
    }

    // Logging Data Sheets
    private async Task<List<Dictionary<string, object?>>> GetPerformLogsSheet()
    {
        var logs = await _unitOfWork.PerformLogs.GetAllAsync(0, int.MaxValue);
        var nonDeletedLogs = logs.Where(l => !l.Is_Deleted).ToList();

        return nonDeletedLogs.Select(log => new Dictionary<string, object?>
        {
            { "ID", log.ID },
            { "Performed By", log.User?.Username ?? "" },
            { "Performed Outlet", log.Location?.Location_Name ?? "" },
            { "Perform Module", log.Perform_Module.ToString() },
            { "Operation Type", log.Operation_Type.ToString() },
            { "Perform Remark", log.Perform_Remark ?? "" },
            { "Operation ID", log.Operation_ID },
            { "Perform Date", log.Perform_Date }
        }).ToList();
    }

    private async Task<List<Dictionary<string, object?>>> GetPriceLogsSheet()
    {
        var logs = await _unitOfWork.PriceLogs.GetAllAsync(0, int.MaxValue);
        var nonDeletedLogs = logs.Where(l => !l.Is_Deleted).ToList();

        return nonDeletedLogs.Select(log => new Dictionary<string, object?>
        {
            { "ID", log.ID },
            { "Item Code", log.Item?.Item_Code ?? "" },
            { "Item Name", log.Item?.Item_Name ?? "" },
            { "Previous Price", log.Previous_Unit_Price },
            { "New Price", log.New_Unit_Price },
            { "Perform Log ID", log.Performed_Log_ID },
            { "Change Date", log.PerformLog?.Perform_Date ?? DateTime.MinValue }
        }).ToList();
    }
}
