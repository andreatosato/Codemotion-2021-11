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
