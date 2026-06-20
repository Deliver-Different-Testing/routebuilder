using Microsoft.EntityFrameworkCore;
using RouteBuilder.Entities;

namespace RouteBuilder.Data;

/// <summary>
/// EF Core context for RouteBuilder v2.
/// Connects to the per-tenant Despatch database. Reuses existing tables read-only;
/// the new v2 tables are managed by SQL migrations in /Migrations.
///
/// Per scoping doc Q4 — application-layer code, no stored procedures.
/// </summary>
public class RouteBuilderDbContext : DbContext
{
    public RouteBuilderDbContext(DbContextOptions<RouteBuilderDbContext> options) : base(options) { }

    // ─── Existing tables (read-only initial pass) ──────────────────
    public DbSet<TblBulkJob>       TblBulkJobs        => Set<TblBulkJob>();
    public DbSet<TblBulkRun>       TblBulkRuns        => Set<TblBulkRun>();
    public DbSet<TblBulkRunSetting>TblBulkRunSettings => Set<TblBulkRunSetting>();
    public DbSet<TblBulkJobRun>    TblBulkJobRuns     => Set<TblBulkJobRun>();
    public DbSet<TucJob>           TucJobs            => Set<TucJob>();
    public DbSet<TucJobBooking>    TucJobBookings     => Set<TucJobBooking>();
    public DbSet<TucFleet>         TucFleets          => Set<TucFleet>();
    public DbSet<TucCourier>       TucCouriers        => Set<TucCourier>();

    // ─── New v2 tables ─────────────────────────────────────────────
    public DbSet<TblQuoteJob>             TblQuoteJobs             => Set<TblQuoteJob>();
    public DbSet<TblQuoteRun>             TblQuoteRuns             => Set<TblQuoteRun>();
    public DbSet<TblBulkRunPolygon>       TblBulkRunPolygons       => Set<TblBulkRunPolygon>();
    public DbSet<TblBulkRunPolygonPoint>  TblBulkRunPolygonPoints  => Set<TblBulkRunPolygonPoint>();
    public DbSet<TblRecurringRoute>       TblRecurringRoutes       => Set<TblRecurringRoute>();
    public DbSet<TblRecurringRouteZip>    TblRecurringRouteZips    => Set<TblRecurringRouteZip>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ─── Existing table mappings (keep names exactly as the schema has them) ─
        b.Entity<TblBulkJob>(e =>
        {
            e.ToTable("tblBulkJob");
            e.HasKey(x => x.BulkJobId);
        });

        b.Entity<TblBulkRun>(e =>
        {
            e.ToTable("tblBulkRun");
            e.HasKey(x => x.Id);
        });

        b.Entity<TblBulkRunSetting>(e =>
        {
            e.ToTable("tblBulkRunSetting");
            e.HasKey(x => x.Id);
        });

        b.Entity<TblBulkJobRun>(e =>
        {
            e.ToTable("tblBulkJobRun");
            e.HasKey(x => new { x.BulkRunId, x.BulkJobId });
        });

        b.Entity<TucJob>(e =>
        {
            e.ToTable("tucJob");
            e.HasKey(x => x.UcjbId);
        });

        b.Entity<TucJobBooking>(e =>
        {
            e.ToTable("tucJobBooking");
            e.HasKey(x => x.UcbkId);
        });

        b.Entity<TucFleet>(e =>
        {
            e.ToTable("tucFleet");
            e.HasKey(x => x.UfltId);
        });

        b.Entity<TucCourier>(e =>
        {
            e.ToTable("tucCourier");
            e.HasKey(x => x.UccrId);
        });

        // ─── New v2 tables ─────────────────────────────────────────
        b.Entity<TblQuoteJob>(e =>
        {
            e.ToTable("tblQuoteJob");
            e.HasKey(x => x.QuoteJobId);
            e.HasIndex(x => x.QuoteRunId);
            e.HasIndex(x => new { x.QuoteSetCode, x.FromPostCode });
        });

        b.Entity<TblQuoteRun>(e =>
        {
            e.ToTable("tblQuoteRun");
            e.HasKey(x => x.QuoteRunId);
            e.HasIndex(x => x.QuoteSetCode);
            e.HasMany(x => x.QuoteJobs)
              .WithOne(j => j.QuoteRun!)
              .HasForeignKey(j => j.QuoteRunId)
              .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<TblBulkRunPolygon>(e =>
        {
            e.ToTable("tblBulkRunPolygon");
            e.HasKey(x => x.PolygonId);
            e.HasIndex(x => x.Name);
            e.HasIndex(x => x.RecurringRouteId);
            e.HasMany(x => x.Points)
              .WithOne(p => p.Polygon!)
              .HasForeignKey(p => p.PolygonId)
              .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<TblBulkRunPolygonPoint>(e =>
        {
            e.ToTable("tblBulkRunPolygonPoint");
            e.HasKey(x => x.PolygonPointId);
            e.HasIndex(x => new { x.PolygonId, x.OrderIndex });
        });

        b.Entity<TblRecurringRoute>(e =>
        {
            e.ToTable("tblRecurringRoute");
            e.HasKey(x => x.RecurringRouteId);
            e.HasIndex(x => x.IsActive);
            e.HasMany(x => x.Zips)
              .WithOne(z => z.RecurringRoute!)
              .HasForeignKey(z => z.RecurringRouteId)
              .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<TblRecurringRouteZip>(e =>
        {
            e.ToTable("tblRecurringRouteZip");
            e.HasKey(x => x.RecurringRouteZipId);
            e.HasIndex(x => new { x.RecurringRouteId, x.ZipCode }).IsUnique();
        });
    }
}
