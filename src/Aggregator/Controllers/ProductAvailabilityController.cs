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

        [HttpPost("FakeData")]
        public async Task<IActionResult> GenerateFakeDataAsync()
        {
            ProductEntity p1 = new ProductEntity
            {
                Id = 1,
                Description = "Mela Golden Valsugana",
                Country = "ITA",
                Name = "Mela Golden",
                Price = 1.75m
            };
            StoreEntity s1 = new StoreEntity
            {
                ProductId = 1,
                Availability = 1000
            };

            var productResponse = await productClient.PostAsJsonAsync("product/", p1, new JsonSerializerOptions(JsonSerializerDefaults.Web));
            //productResponse.EnsureSuccessStatusCode();
            var storeResponse = await storeClient.PostAsJsonAsync("store/", s1, new JsonSerializerOptions(JsonSerializerDefaults.Web));
            //storeResponse.EnsureSuccessStatusCode();

            return Ok();
        }
    }
}
