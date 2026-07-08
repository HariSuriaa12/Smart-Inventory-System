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
    public DbSet<Item> Items { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<PurchaseOrderHeader> PurchaseOrderHeaders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
    public DbSet<OrderFulfillmentHeader> OrderFulfillmentHeaders { get; set; }
    public DbSet<OrderFulfillmentItem> OrderFulfillmentItems { get; set; }
    public DbSet<Sales> Sales { get; set; }
    public DbSet<SalesItem> SalesItems { get; set; }
    public DbSet<StockTransfer> StockTransfers { get; set; }
    public DbSet<PerformLog> PerformLogs { get; set; }
    public DbSet<PriceLog> PriceLogs { get; set; }
    public DbSet<InventoryLog> InventoryLogs { get; set; }
    public DbSet<ForecastedResult> ForecastedResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .Property(u => u.Is_Deleted)
            .HasColumnType("bit(1)")
            .HasConversion(
                // When saving to DB: convert bool to a 1-element BitArray
                v => new BitArray(new[] { v }),
                // When reading from DB: get the first boolean value out of the BitArray
                v => v.Get(0)
            );

        // Configure decimal precision
        modelBuilder.Entity<Item>()
            .Property(x => x.PurchaseCost)
            .HasPrecision(14, 2);
        modelBuilder.Entity<Item>()
            .Property(x => x.UnitCost)
            .HasPrecision(14, 2);
        modelBuilder.Entity<Item>()
            .Property(x => x.TaxPercentage)
            .HasPrecision(14, 2);

        modelBuilder.Entity<Inventory>()
            .Property(x => x.OnHandQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<Inventory>()
            .Property(x => x.AvailableQuantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<PurchaseOrderHeader>()
            .Property(x => x.TotalAmount)
            .HasPrecision(14, 2);

        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.OrderQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.UnitPrice)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.SubTotal)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PurchaseOrderItem>()
            .Property(x => x.ReceivedQuantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<OrderFulfillmentHeader>()
            .Property(x => x.TotalAmount)
            .HasPrecision(14, 2);

        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.RequestQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.UnitPrice)
            .HasPrecision(14, 2);
        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.SubTotal)
            .HasPrecision(14, 2);
        modelBuilder.Entity<OrderFulfillmentItem>()
            .Property(x => x.ShippedQuantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<SalesItem>()
            .Property(x => x.SoldQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<SalesItem>()
            .Property(x => x.SubTotal)
            .HasPrecision(14, 2);
        modelBuilder.Entity<SalesItem>()
            .Property(x => x.DiscountPercentage)
            .HasPrecision(14, 2);

        modelBuilder.Entity<StockTransfer>()
            .Property(x => x.TransferQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<StockTransfer>()
            .Property(x => x.SubTotal)
            .HasPrecision(14, 2);

        modelBuilder.Entity<ForecastedResult>()
            .Property(x => x.ForecastedQuantity)
            .HasPrecision(14, 2);

        modelBuilder.Entity<PriceLog>()
            .Property(x => x.PreviousUnitPrice)
            .HasPrecision(14, 2);
        modelBuilder.Entity<PriceLog>()
            .Property(x => x.NewUnitPrice)
            .HasPrecision(14, 2);

        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.PreviousOnhandQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.NewOnhandQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.PreviousAvailableQuantity)
            .HasPrecision(14, 2);
        modelBuilder.Entity<InventoryLog>()
            .Property(x => x.NewAvailableQuantity)
            .HasPrecision(14, 2);
    }
}
