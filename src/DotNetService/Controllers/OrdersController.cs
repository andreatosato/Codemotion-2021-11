using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orders.Database;
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
        return Ok(orders);
    }

    [HttpPost()]
    public async Task<IActionResult> PostAsync()
    {
        return Ok();
    }
}
