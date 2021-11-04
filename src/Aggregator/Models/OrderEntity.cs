namespace Aggregator.Models
{
    public class OrderEntity
    {
        public List<ProductSoldEntity> Products { get; set; } = new List<ProductSoldEntity>();
    }

    public class ProductSoldEntity
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal SoldPrice { get; set; }
    }
}
