
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
                totalPrice += p.SoldPrice;
            }
            return totalPrice;
        }
    }

    public DateTimeOffset OrderCreated { get; }
}
