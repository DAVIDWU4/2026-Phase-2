using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.Sources.OfType<IConfigurationSource>()
    .Where(s => s is FileConfigurationSource)
    .Cast<FileConfigurationSource>()
    .ToList()
    .ForEach(src => src.ReloadOnChange = false);

var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connStr))
{
    throw new InvalidOperationException(
        "Database connection string 'DefaultConnection' is not configured. " +
        "Set the ConnectionStrings__DefaultConnection environment variable.");
}

builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );
        var result = new Microsoft.AspNetCore.Mvc.ObjectResult(new { message = "Validation failed.", errors })
        {
            StatusCode = StatusCodes.Status400BadRequest
        };
        return result;
    };
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// 修复：Singleton → Scoped
builder.Services.AddScoped<PasswordResetService>();

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connStr));

builder.Services.AddScoped<backend.Services.StudyGameService>();    

var allowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "http://localhost:5173",
    "https://2026-phase-2.vercel.app",
};

// Optional: Cors__Origins="https://foo.vercel.app,https://bar.vercel.app"
var extraOrigins = builder.Configuration["Cors:Origins"]
    ?? Environment.GetEnvironmentVariable("Cors__Origins");
if (!string.IsNullOrWhiteSpace(extraOrigins))
{
    foreach (var origin in extraOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
    {
        allowedOrigins.Add(origin);
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); 
}

// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();
app.MapScalarApiReference();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}
app.Run();