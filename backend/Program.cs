using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
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

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "StudyApp.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.Path = "/";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// Register business services
builder.Services.AddScoped<PasswordResetService>();
builder.Services.AddScoped<StudyGameService>();

// Postgres database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr, npgsql =>
        npgsql.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null)));

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

allowedOrigins.AddRange(new[]
{
    "http://localhost:3000",
    "http://localhost:5173"
});

// Log configured origins for debugging
Console.WriteLine($"[CORS] Configured allowed origins: {string.Join(", ", allowedOrigins)}");
if (allowedOrigins.Count <= 2) // only localhost defaults
{
    Console.WriteLine("[CORS] WARNING: Only localhost origins configured. Set AllowedOrigins env var for production.");
}

static bool IsAllowedOrigin(string origin, IReadOnlyCollection<string> configuredOrigins)
{
    if (configuredOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
        return true;

    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        return false;

    // Allow Vercel production + preview deployment URLs (e.g. project-hash-team-projects.vercel.app)
    if (uri.Scheme == Uri.UriSchemeHttps
        && uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
    {
        return true;
    }

    return uri.Scheme == Uri.UriSchemeHttp
        && (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
            || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase));
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => IsAllowedOrigin(origin, allowedOrigins))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetPreflightMaxAge(TimeSpan.FromMinutes(5));
    });
});

var app = builder.Build();

// Middleware order must not be changed
// Forwarded headers must be first so HTTPS is detected correctly behind proxy
app.UseForwardedHeaders();
app.UseCookiePolicy();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// API docs only visible in development, hidden in production
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Auto-run database migrations on startup (controlled by env var, default: enabled)
var autoMigrate = app.Configuration["AutoMigrate"] ?? "true";
if (autoMigrate.Equals("true", StringComparison.OrdinalIgnoreCase))
{
    try
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("[DB] Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB] FATAL: Migration failed: {ex.Message}");
        Console.WriteLine(ex.ToString());
        throw;
    }
}

Console.WriteLine("[Startup] Application ready.");
app.Run();