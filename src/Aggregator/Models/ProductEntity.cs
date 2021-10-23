using System.Text.Json.Serialization;

namespace Aggregator.Models
{
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
}
