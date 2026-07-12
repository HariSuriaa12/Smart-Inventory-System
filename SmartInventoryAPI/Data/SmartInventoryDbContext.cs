using System.Collections;
using Microsoft.EntityFrameworkCore;
using SmartInventoryAPI.Models.Entities;

namespace SmartInventoryAPI.Data;

public class SmartInventoryDbContext : DbContext
{
    public SmartInventoryDbContext(DbContextOptions<SmartInventoryDbContext> options) : base(options)
    {
    }

    public DbSet<User> User { get; set; }
    public DbSet<Item> Item { get; set; }
    public DbSet<Location> Location { get; set; }
    public DbSet<Vendor> Vendor { get; set; }
    public DbSet<Customer> Customer { get; set; }
    public DbSet<Inventory> Inventory { get; set; }
    public DbSet<PurchaseOrderHeader> PurchaseOrderHeader { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItem { get; set; }
    public DbSet<OrderFulfillmentHeader> OrderFulfillmentHeader { get; set; }
    public DbSet<OrderFulfillmentItem> OrderFulfillmentItem { get; set; }
    public DbSet<Sales> Sales { get; set; }
    public DbSet<SalesItem> Sales_Item { get; set; }
    public DbSet<StockTransfer> Stock_Transfer { get; set; }
    public DbSet<PerformLog> Perform_Log { get; set; }
    public DbSet<PriceLog> Price_Log { get; set; }
    public DbSet<InventoryLog> Inventory_Log { get; set; }
    public DbSet<ForecastedResult> Forecasted_Result { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var properties = entityType.GetProperties()
                .Where(p => p.ClrType == typeof(bool) || p.ClrType == typeof(bool?));
                //.Where(p => p.ClrType == typeof(bool) && p.Name.Equals("Is_Deleted"));

            foreach (var property in properties)
            {
                property.SetColumnType("bit(1)");
                property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<bool, System.Collections.BitArray>(
                    v => new System.Collections.BitArray(new[] { v }),
                    v => v.Get(0)
                ));
            }
        }

        // Configure decimal precision
        modelBuilder.Entity<Item>()
            .Property(x => x.Purchase_Cost)
            .HasPrecision(14, 2);
        modelBuilder.Entity<Item>()
            .Property(x => x.Unit_Cost)
            .HasPrecision(14, 2);
        modelBuilder.Entity<Item>()
            .Property(x => x.Tax_Percentage)
            .HasPrecision(14, 2);

        modelBuilder.Entity<Inventory>()
            .Property(x => x.On_Hand_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<Inventory>()
            .Property(x => x.Available_Quantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<PurchaseOrderHeader>()
            .Property(x => x.Total_Amount)
            .HasPrecision(14, 2);

        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.Order_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.Unit_Price)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.Sub_Total)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.Received_Quantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<OrderFulfillmentHeader>()
            .Property(x => x.Total_Amount)
            .HasPrecision(14, 2);

        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.Request_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.Unit_Price)
            .HasPrecision(14, 2);
        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.Sub_Total)
            .HasPrecision(14, 2);
        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.Shipped_Quantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<SalesItem>()
            .Property(x => x.Sold_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<SalesItem>()
            .Property(x => x.Sub_Total)
            .HasPrecision(14, 2);
        modelBuilder.Entity<SalesItem>()
            .Property(x => x.Discount_Percentage)
            .HasPrecision(14, 2);

        modelBuilder.Entity<StockTransfer>()
            .Property(x => x.Transfer_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<StockTransfer>()
            .Property(x => x.Sub_Total)
            .HasPrecision(14, 2);

        modelBuilder.Entity<ForecastedResult>()
            .Property(x => x.Forecasted_Quantity)
            .HasPrecision(14, 2);

        // Configure Inventory relationships
        modelBuilder.Entity<Inventory>()
            .HasOne(i => i.Item)
            .WithMany()
            .HasForeignKey(i => i.Item_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Inventory>()
            .HasOne(i => i.Location)
            .WithMany()
            .HasForeignKey(i => i.Location_ID)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure PerformLog relationships
        modelBuilder.Entity<PerformLog>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.Performed_By)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PerformLog>()
            .HasOne(p => p.Location)
            .WithMany()
            .HasForeignKey(p => p.Performed_Outlet)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InventoryLog>()
            .HasOne(p => p.Item)
            .WithMany()
            .HasForeignKey(p => p.Item_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InventoryLog>()
            .HasOne(p => p.Location)
            .WithMany()
            .HasForeignKey(p => p.Location_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InventoryLog>()
            .HasOne(p => p.PerformLog)
            .WithMany()
            .HasForeignKey(p => p.Performed_Log_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PriceLog>()
            .HasOne(p => p.Item)
            .WithMany()
            .HasForeignKey(p => p.Item_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PriceLog>()
            .HasOne(p => p.PerformLog)
            .WithMany()
            .HasForeignKey(p => p.Performed_Log_ID)
            .OnDelete(DeleteBehavior.Restrict);

        //Stock Transfer Relations
        modelBuilder.Entity<StockTransfer>()
            .HasOne(p => p.FromLocation)
            .WithMany()
            .HasForeignKey(p => p.From_Location_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransfer>()
            .HasOne(p => p.ToLocation)
            .WithMany()
            .HasForeignKey(p => p.To_Location_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransfer>()
            .HasOne(p => p.Item)
            .WithMany()
            .HasForeignKey(p => p.Item_ID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransfer>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.Performed_By)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PriceLog>()
            .Property(x => x.Previous_Unit_Price)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PriceLog>()
            .Property(x => x.New_Unit_Price)
            .HasPrecision(14, 2);

        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.Previous_Onhand_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.New_Onhand_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.Previous_Available_Quantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.New_Available_Quantity)
            .HasPrecision(14, 2);
    }
}
