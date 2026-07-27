namespace SmartInventoryAPI.Models.Data_Enums
{
    public enum OrderFulfillmentHeaderStatusEnum
    {
        Unfulfilled = 0,
        OnHold,
        PartiallyFulfilled,
        Fulfilled,
        Cancelled,
        Verified
    }

    public enum OrderFulfillmentItemStatusEnum
    {
        Unfulfilled = 0,
        OnHold,
        PartiallyFulfilled,
        Fulfilled,
        Cancelled,
        Verified
    }

    public enum PurchaseOrderHeaderStatusEnum
    {
        Saved = 0,
        Confirmed,
        PartiallyReceived,
        Received,
        Cancelled
    }

    public enum PurchaseOrderItemStatusEnum
    {
        Saved = 0,
        Confirmed,
        PartiallyReceived,
        Received,
        Cancelled
    }

    public enum SalesStatusEnum
    {
        Confirmed = 0,
        Completed,
        Refunded,
        Cancelled
    }

    public enum StockTransferStatusEnum
    {
        Shipped = 0,
        PartiallyReceived,
        Received,
        Cancelled
    }

    public enum PerformedLogModuleEnum
    {
        Item = 1,
        Location,
        User,
        Vendor,
        Inventory,
        PurchaseOrder,
        OrderFulfillment,
        Sales,
        StockTransfer,
        Forecast
    }

    public enum PerformedLogOperationTypeEnum
    {
        Create = 1, //Insert
        Edit, //Update
        Delete
    }

    public enum ForecastMethodEnum
    {
        ANN = 0,
        MA,
    }
}
