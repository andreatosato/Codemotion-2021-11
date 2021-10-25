using System.Text.Json.Serialization;

namespace Aggregator.Models
{
    public class StoreEntity
    {
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        [JsonPropertyName("availability")]
        public int Availability { get; set; }
    }
}
