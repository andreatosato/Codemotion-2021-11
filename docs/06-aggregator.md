# Aggregator

## Pacchetti da installare
```xml
<PackageReference Include="OpenTelemetry" Version="1.2.0-beta1" />
<PackageReference Include="OpenTelemetry.Api" Version="1.2.0-beta1" />
<PackageReference Include="OpenTelemetry.Exporter.Zipkin" Version="1.2.0-beta1" />
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.0.0-rc8" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.0.0-rc8" />
<PackageReference Include="OpenTelemetry" Version="1.2.0-beta1" />
```


## Order
Codice applicativo

```cs
using Aggregator.Models;
using Microsoft.AspNetCore.Mvc;

namespace Aggregator.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly HttpClient productClient;
        private readonly HttpClient storeClient;
        private readonly HttpClient orderClient;

        public OrderController(IHttpClientFactory clientFactory)
        {
            productClient = clientFactory.CreateClient("Product");
            storeClient = clientFactory.CreateClient("Store");
            orderClient = clientFactory.CreateClient("Order");
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(OrderEntity order)
        {
            if (order == null)
                return BadRequest();

            var newAvailability = new List<StoreEntity>();
            // Check Products
            foreach (var checkProduct in order.Products)
            {
                var p = await productClient.GetFromJsonAsync<ProductEntity>($"product/{checkProduct.Id}");
                if (p == null)
                {
                    ModelState.AddModelError("product_not_exist", $"Product {checkProduct.Id} not exist");
                    continue;
                }

                var productAvailability = await storeClient.GetFromJsonAsync<StoreEntity>($"store/{checkProduct.Id}");
                if (productAvailability == null)
                    ModelState.AddModelError("product_not_in_store", $"Product {checkProduct.Id} not in store");

                if (productAvailability?.Availability <= 0)
                    ModelState.AddModelError("product_not_available", $"Product {checkProduct.Id} not available in store");

                productAvailability.Availability = productAvailability.Availability - checkProduct.Quantity;
                newAvailability.Add(productAvailability);
            }
            // Update Availability
            foreach (var store in newAvailability)
            {
                //await storeClient.PutAsJsonAsync($"store/{store.ProductId}", store);
                await storeClient.PostAsJsonAsync("store/", store);
            }

            var response = await orderClient.PostAsJsonAsync("orders/", order);
            response.EnsureSuccessStatusCode();

            return Created(response.Headers.Location, order);
        }
    }
}
```
## Product Availability
```cs
using Aggregator.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Aggregator.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProductAvailabilityController : ControllerBase
    {
        private readonly HttpClient productClient;
        private readonly HttpClient storeClient;

        public ProductAvailabilityController(IHttpClientFactory clientFactory)
        {
            productClient = clientFactory.CreateClient("Product");
            storeClient = clientFactory.CreateClient("Store");
        }

        [HttpGet]
        public async Task<IActionResult> GetProductsAvailability()
        {
            List<ProductStoreEntity> result = new List<ProductStoreEntity>();

            var products = await productClient.GetFromJsonAsync<List<ProductEntity>>("product/");
            var store = await storeClient.GetFromJsonAsync<List<StoreEntity>>("store/");

            if (products != null && store != null)
            {
                foreach (var p in products)
                {
                    var productIsInStore = store.Find(t => t.ProductId == p.Id);
                    if (productIsInStore != null)
                        result.Add(new ProductStoreEntity
                        {
                            Id = p.Id,
                            Price = p.Price,
                            Availability = productIsInStore.Availability,
                            Name = p.Name,
                            Country = p.Country,
                            Description = p.Description
                        });
                }
            }

            return Ok(result);
        }
    }
}
```

## Models
```cs
namespace Aggregator.Models
{
    public class OrderEntity
    {
        public List<ProductSoldEntity> Products { get; set; } = new List<ProductSoldEntity>();
    }

    public class ProductSoldEntity
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal SoldPrice { get; set; }
    }

    public class ProductEntity
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("description")]
        public string Description { get; set; }
        [JsonPropertyName("price")]
        public decimal Price { get; set; }
        [JsonPropertyName("country")]
        public string Country { get; set; }
    }

    public class ProductStoreEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Country { get; set; }
        public int Availability { get; set; }
    }

    public class StoreEntity
    {
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        [JsonPropertyName("availability")]
        public int Availability { get; set; }
    }
}
```
## Startup
```cs
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient("Product", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("ProductApi")));
builder.Services.AddHttpClient("Store", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("StoreApi")));
builder.Services.AddHttpClient("Order", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("OrderApi")));
builder.Services
    .AddOpenTelemetryTracing((b) => b
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("Aggregator").AddTelemetrySdk())
        .AddHttpClientInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddZipkinExporter(s => s.Endpoint = new Uri($"{builder.Configuration.GetValue<string>("ZipkinExporter")}/api/v2/spans"))
    );

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Dockerfile

```
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Aggregator/Aggregator.csproj", "Aggregator/"]
RUN dotnet restore "Aggregator/Aggregator.csproj"
COPY . .
WORKDIR "/src/Aggregator"
RUN dotnet build "Aggregator.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aggregator.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aggregator.dll"]
```