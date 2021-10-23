var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient("Product", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("ProductApi")));
builder.Services.AddHttpClient("Store", c => c.BaseAddress = new Uri(builder.Configuration.GetValue<string>("StoreApi")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
