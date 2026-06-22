using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RouteBuilder.Data;
using RouteBuilder.Services;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ────────────────────────────────────────────────────────────────────
// Serilog (matches the urgent-couriers stack pattern)
// ────────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();
builder.Host.UseSerilog();

// ────────────────────────────────────────────────────────────────────
// EF Core — single-tenant per deployment (per scoping doc Q10).
// Connection string is the per-deployment Despatch DB.
// ────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<RouteBuilderDbContext>(opts =>
    opts.UseSqlServer(
        builder.Configuration.GetConnectionString("Despatch")
        ?? throw new InvalidOperationException("Despatch connection string missing"),
        sql => sql.MigrationsAssembly("RouteBuilder")
    ));

// ────────────────────────────────────────────────────────────────────
// Auth — Hub cookie (incoming) + JWT bearer (own-issued, for SPA → API)
// Matches the courier portal Phase 1 pattern.
// ────────────────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RouteBuilder";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RouteBuilder";

builder.Services.AddAuthentication(o =>
{
    o.DefaultScheme = "Smart";
    o.DefaultChallengeScheme = "Smart";
})
.AddPolicyScheme("Smart", "Cookie or JWT", o =>
{
    o.ForwardDefaultSelector = ctx =>
    {
        string? auth = ctx.Request.Headers["Authorization"];
        return auth?.StartsWith("Bearer ") == true
            ? JwtBearerDefaults.AuthenticationScheme
            : CookieAuthenticationDefaults.AuthenticationScheme;
    };
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, o =>
{
    o.Cookie.Name = ".AspNet.SharedCookie"; // shared with Hub
    o.Cookie.SameSite = SameSiteMode.Lax;
    o.SlidingExpiration = true;
    o.ExpireTimeSpan = TimeSpan.FromMinutes(20);
})
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromSeconds(30)
    };
});

// ────────────────────────────────────────────────────────────────────
// Feature-matrix policies (per scoping doc Q7).
// Every API endpoint is gated on a Feature claim that the Hub injects.
// ────────────────────────────────────────────────────────────────────
builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("RouteBuilder.Read",    p => p.RequireClaim("Feature", "RouteBuilder.Read"));
    o.AddPolicy("RouteBuilder.Build",   p => p.RequireClaim("Feature", "RouteBuilder.Build"));
    o.AddPolicy("RouteBuilder.Quote",   p => p.RequireClaim("Feature", "RouteBuilder.Quote"));
    o.AddPolicy("RouteBuilder.Polygon", p => p.RequireClaim("Feature", "RouteBuilder.Polygon"));
    o.AddPolicy("RouteBuilder.Admin",   p => p.RequireClaim("Feature", "RouteBuilder.Admin"));
});

// ────────────────────────────────────────────────────────────────────
// Application services — keep all data access in the app layer (Q4).
// Stored procedures are explicitly avoided. EF + LINQ only.
// ────────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IRunService, RunService>();
builder.Services.AddScoped<IPolygonService, PolygonService>();
builder.Services.AddScoped<IScheduledRouteService, ScheduledRouteService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();
builder.Services.AddScoped<IFleetService, FleetService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<RouteBuilderDbContext>("despatch-db");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSerilogRequestLogging();

// SPA — React mounted at wwwroot/app/react/ (configurator pattern)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// SPA fallback — anything not /api/*, /health, /static goes to React
app.MapFallbackToFile("/app/react/index.html");

app.Run();
