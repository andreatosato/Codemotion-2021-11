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