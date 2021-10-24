using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient("Product", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("ProductApi")));
builder.Services.AddHttpClient("Store", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("StoreApi")));
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
