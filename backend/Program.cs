using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Disable appsettings hot-reload in production; keep it in development for debugging
if (!builder.Environment.IsDevelopment())
{
    builder.Configuration.Sources.OfType<IConfigurationSource>()
        .Where(s => s is FileConfigurationSource)
        .Cast<FileConfigurationSource>()
        .ToList()
        .ForEach(src => src.ReloadOnChange = false);
}

// Validate database connection string
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connStr))
{
    throw new InvalidOperationException(
        "Database connection string 'DefaultConnection' is not configured. " +
        "Set the ConnectionStrings__DefaultConnection environment variable.");
}

// Custom model validation 400 error response format
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );
        var result = new ObjectResult(new { message = "Validation failed.", errors })
        {
            StatusCode = StatusCodes.Status400BadRequest
        };
        return result;
    };
});

// Enable standard HTTP ProblemDetails errors
builder.Services.AddProblemDetails();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// Register business services
builder.Services.AddScoped<PasswordResetService>();
builder.Services.AddScoped<StudyGameService>();

// Postgres database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

// Global cookie policy: compatible with Vercel <-> Render cross-domain
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.None;
    options.Secure = CookieSecurePolicy.Always;
});

// CORS configuration: read Render env var AllowedOrigins, with AllowCredentials support
var originConfig = builder.Configuration["AllowedOrigins"] ?? string.Empty;
var allowedOrigins = originConfig
    .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .ToList();

// Fallback local development origins
allowedOrigins.AddRange(new[]
{
    "http://localhost:3000",
    "http://localhost:5173"
});
allowedOrigins = allowedOrigins.Distinct().ToList();

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

// Middleware order must not be changed
app.UseCookiePolicy();
app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();

// API docs only visible in development, hidden in production
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Auto-run database migrations only in development; production must run manually
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

app.Run();