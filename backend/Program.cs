using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Support Render's PORT environment variable (common on PaaS platforms)
// If PORT is set but ASPNETCORE_URLS is not, auto-configure the URL
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port) && string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    builder.WebHost.UseUrls($"http://+:{port}");
    Console.WriteLine($"[Host] Listening on port {port} (from PORT env var)");
}

// Configure forwarded headers for reverse proxy (Render, nginx, etc.)
// Required so the app knows it's running behind HTTPS when proxied
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

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

// Log configured origins for debugging
Console.WriteLine($"[CORS] Configured allowed origins: {string.Join(", ", allowedOrigins)}");
if (allowedOrigins.Count <= 2) // only localhost defaults
{
    Console.WriteLine("[CORS] WARNING: Only localhost origins configured. Set AllowedOrigins env var for production.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetPreflightMaxAge(TimeSpan.FromHours(1));
    });
});

var app = builder.Build();

// Middleware order must not be changed
// Forwarded headers must be first so HTTPS is detected correctly behind proxy
app.UseForwardedHeaders();
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

// Auto-run database migrations on startup (controlled by env var, default: enabled)
// Set AutoMigrate=false to disable (e.g. if you run migrations manually via CI)
var autoMigrate = app.Configuration["AutoMigrate"] ?? "true";
if (autoMigrate.Equals("true", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
    Console.WriteLine("[DB] Database migrations applied successfully.");
}

app.Run();