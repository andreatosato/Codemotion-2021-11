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
                var p = await productClient.GetFromJsonAsync<ProductEntity>($"product/{checkProduct.ProductId}");
                if (p == null)
                {
                    ModelState.AddModelError("product_not_exist", $"Product {checkProduct.ProductId} not exist");
                    continue;
                }

                var productAvailability = await storeClient.GetFromJsonAsync<StoreEntity>($"store/{checkProduct.ProductId}");
                if (productAvailability == null)
                    ModelState.AddModelError("product_not_in_store", $"Product {checkProduct.ProductId} not in store");

                if (productAvailability?.Availability <= 0)
                    ModelState.AddModelError("product_not_available", $"Product {checkProduct.ProductId} not available in store");

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
