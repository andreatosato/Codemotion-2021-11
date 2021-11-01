global using Microsoft.AspNetCore.Builder;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Orders.Database;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddCors();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Orders", Version = "v1" });
});
builder.Services.AddDbContext<OrderContext>(
    options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("SqlConnection");
        options.UseSqlServer(connectionString);
    });
builder.Services
    .AddOpenTelemetryTracing((b) => b
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("Orders").AddTelemetrySdk())
        .AddAspNetCoreInstrumentation()
        .AddSqlClientInstrumentation(s =>
        {
            s.SetDbStatementForStoredProcedure = false;
            s.SetDbStatementForText = true;
            s.RecordException = true;
        })
        .AddZipkinExporter(s => s.Endpoint = new Uri($"{builder.Configuration.GetValue<string>("ZipkinExporter")}/api/v2/spans"))
    );

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetService<OrderContext>();
    db.Database.EnsureCreated();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (builder.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Orders v1"));
}

app.UseCors(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseAuthorization();

app.MapControllers();

app.Run();
