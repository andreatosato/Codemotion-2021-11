using Microsoft.EntityFrameworkCore;
using Orders.Database.Entities;

namespace Orders.Database;
public class OrderContext : DbContext
{
    public DbSet<OrderEntity>? Orders { get; set; }
    public DbSet<ProductEntity>? Products { get; set; }

    public OrderContext(DbContextOptions<OrderContext> options) : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<OrderEntity>().HasKey(t => t.OrderId);
        modelBuilder.Entity<OrderEntity>().Property(t => t.OrderId)
            .ValueGeneratedOnAdd()
            .IsRequired();

        modelBuilder.Entity<OrderEntity>().HasMany(t => t.ProductEntities);

        modelBuilder.Entity<ProductEntity>().HasKey(t => t.Id);
        modelBuilder.Entity<ProductEntity>().Property(t => t.Id)
            .ValueGeneratedOnAdd()
            .IsRequired();
    }

}
