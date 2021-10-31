# DotNet

Codice applicativo
## Pacchetti 
```xml
<PackageReference Include="OpenTelemetry" Version="1.2.0-beta1" />
<PackageReference Include="OpenTelemetry.Api" Version="1.2.0-beta1" />
<PackageReference Include="OpenTelemetry.Exporter.Zipkin" Version="1.2.0-beta1" />
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.0.0-rc8" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.0.0-rc8" />
<PackageReference Include="OpenTelemetry.Instrumentation.SqlClient" Version="1.0.0-rc8" />
```

## Entity Framework
```cs
using Microsoft.EntityFrameworkCore;
using Orders.Database.Entities;

namespace Orders.Database;
public class OrderContext : DbContext
{
    public DbSet<OrderEntity> Orders { get; set; }
    public DbSet<ProductEntity> Products { get; set; }

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

        modelBuilder.Entity<OrderEntity>().HasMany(t => t.ProductEntities)
            .WithOne(t => t.Order)
            .HasForeignKey(t => t.OrderId);

        modelBuilder.Entity<ProductEntity>().HasKey(t => t.Id);
        modelBuilder.Entity<ProductEntity>().Property(t => t.Id)
            .ValueGeneratedOnAdd()
            .IsRequired();

        modelBuilder.Entity<ProductEntity>().Property(t => t.SoldPrice).HasPrecision(15, 6);
    }

}
```

```cs
namespace Orders.Database.Entities
{
    public class ProductEntity
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal SoldPrice { get; set; }
        public OrderEntity Order { get; }
    }
}
```

```cs
namespace Orders.Database.Entities;
public class OrderEntity
{
    public OrderEntity()
    {
        OrderCreated = DateTimeOffset.UtcNow;
    }
    public int OrderId { get; private set; }
    public List<ProductEntity> ProductEntities { get; set; }
    public decimal TotalPrice
    {
        get
        {
            var totalPrice = 0m;
            foreach (var p in ProductEntities)
            {
                totalPrice += p.SoldPrice * p.Quantity;
            }
            return totalPrice;
        }
    }

    public DateTimeOffset OrderCreated { get; }
}
```

## Controller
```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orders.Database;
using Orders.Database.Entities;
using Orders.ViewModels;

namespace Orders.Controllers;
[Route("[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly OrderContext db;

    public OrdersController(OrderContext db)
    {
        this.db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var orders = await db.Orders.Include(t => t.ProductEntities).ToListAsync();
        var orderResult = orders.Select(t =>
            new OrderReadViewModel
            {
                OrderCreated = t.OrderCreated,
                TotalPrice = t.TotalPrice,
                Products = t.ProductEntities
                .Select(x => new ProductViewModel
                {
                    ProductId = x.ProductId,
                    Quantity = x.Quantity,
                    SoldPrice = x.SoldPrice
                })
                .ToList()
            });
        return Ok(orderResult);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> Get(int orderId)
    {
        var order = await db.Orders
            .Include(t => t.ProductEntities)
            .FirstOrDefaultAsync(t => t.OrderId == orderId);
        if (order == null)
            return NotFound();

        var orderResult = new OrderReadViewModel
        {
            OrderCreated = order.OrderCreated,
            TotalPrice = order.TotalPrice,
            Products = order.ProductEntities
                .Select(x => new ProductViewModel
                {
                    ProductId = x.ProductId,
                    Quantity = x.Quantity,
                    SoldPrice = x.SoldPrice
                })
                .ToList()
        };
        return Ok(orderResult);
    }

    [HttpPost()]
    public async Task<IActionResult> PostAsync(OrderCreateViewModel newOrder)
    {

        var newOrderEntity = new OrderEntity
        {
            ProductEntities = newOrder.Products.Select(t => new ProductEntity
            {
                ProductId = t.ProductId,
                Quantity = t.Quantity,
                SoldPrice = t.SoldPrice
            }).ToList()
        };
        db.Orders.Add(newOrderEntity);
        await db.SaveChangesAsync();

        return Created($"/Orders/{newOrderEntity.OrderId}", newOrder);
    }
}
```

### I ViewModels
```cs

namespace Orders.ViewModels;
public class OrderCreateViewModel
{
    public List<ProductViewModel> Products { get; set; }
}

public class OrderReadViewModel
{
    public List<ProductViewModel> Products { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTimeOffset OrderCreated { get; set; }
}
```

```cs
namespace Orders.ViewModels;
public class ProductViewModel
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal SoldPrice { get; set; }
}
```

## Lo Startup
```cs
global using Microsoft.AspNetCore.Builder;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Orders.Database;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Orders", Version = "v1" });
});
builder.Services.AddDbContext<OrderContext>(
    options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("SqlConnection");
        options.UseSqlServer(connectionString);
    });
builder.Services
    .AddOpenTelemetryTracing((b) => b
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("Orders").AddTelemetrySdk())
        .AddAspNetCoreInstrumentation()
        .AddSqlClientInstrumentation(s =>
        {
            s.SetDbStatementForStoredProcedure = false;
            s.SetDbStatementForText = true;
            s.RecordException = true;
        })
        .AddZipkinExporter(s => s.Endpoint = new Uri($"{builder.Configuration.GetValue<string>("ZipkinExporter")}/api/v2/spans"))
    );

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetService<OrderContext>();
    db.Database.EnsureCreated();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (builder.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Orders v1"));
}

app.UseAuthorization();

app.MapControllers();

app.Run();
```

# Dockerfile
```
#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["DotNetService/Orders.csproj", "DotNetService/"]
RUN dotnet restore "DotNetService/Orders.csproj"
COPY . .
WORKDIR "/src/DotNetService"
RUN dotnet build "Orders.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Orders.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Orders.dll"]
```