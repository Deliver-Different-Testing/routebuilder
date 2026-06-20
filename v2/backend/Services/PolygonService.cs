using Microsoft.EntityFrameworkCore;
using RouteBuilder.Data;
using RouteBuilder.Dtos;
using RouteBuilder.Entities;

namespace RouteBuilder.Services;

public class PolygonService(RouteBuilderDbContext db, ILogger<PolygonService> log) : IPolygonService
{
    public async Task<List<PolygonDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.TblBulkRunPolygons
            .AsNoTracking()
            .Include(p => p.Points.OrderBy(x => x.OrderIndex))
            .Select(p => new PolygonDto(
                p.PolygonId, p.Name, p.ColorHex, p.RecurringRouteId, p.TagLocation,
                p.Points.OrderBy(x => x.OrderIndex).Select(x => new PolygonPointDto(x.Lat, x.Lng)).ToList()
            ))
            .ToListAsync(ct);
    }

    public async Task<PolygonDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await db.TblBulkRunPolygons
            .AsNoTracking()
            .Include(x => x.Points)
            .FirstOrDefaultAsync(x => x.PolygonId == id, ct);
        if (p is null) return null;
        return new PolygonDto(
            p.PolygonId, p.Name, p.ColorHex, p.RecurringRouteId, p.TagLocation,
            p.Points.OrderBy(x => x.OrderIndex).Select(x => new PolygonPointDto(x.Lat, x.Lng)).ToList()
        );
    }

    public async Task<PolygonDto> CreateAsync(CreatePolygonRequest req, CancellationToken ct = default)
    {
        var entity = new TblBulkRunPolygon
        {
            Name = req.Name,
            ColorHex = req.ColorHex,
            CreatedUtc = DateTime.UtcNow,
        };
        var i = 0;
        foreach (var p in req.Points)
        {
            entity.Points.Add(new TblBulkRunPolygonPoint { OrderIndex = i++, Lat = p.Lat, Lng = p.Lng });
        }
        db.TblBulkRunPolygons.Add(entity);
        await db.SaveChangesAsync(ct);
        log.LogInformation("Created polygon {Id} ({Name}) with {Pts} points", entity.PolygonId, entity.Name, entity.Points.Count);
        return (await GetByIdAsync(entity.PolygonId, ct))!;
    }

    public async Task<PolygonDto?> UpdateAsync(int id, UpdatePolygonRequest req, CancellationToken ct = default)
    {
        var entity = await db.TblBulkRunPolygons.Include(x => x.Points).FirstOrDefaultAsync(x => x.PolygonId == id, ct);
        if (entity is null) return null;
        if (req.Name != null) entity.Name = req.Name;
        if (req.ColorHex != null) entity.ColorHex = req.ColorHex;
        entity.LastModifiedUtc = DateTime.UtcNow;
        if (req.Points != null)
        {
            db.TblBulkRunPolygonPoints.RemoveRange(entity.Points);
            var i = 0;
            foreach (var p in req.Points)
                entity.Points.Add(new TblBulkRunPolygonPoint { OrderIndex = i++, Lat = p.Lat, Lng = p.Lng });
        }
        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await db.TblBulkRunPolygons.FindAsync([id], ct);
        if (entity is null) return false;
        db.TblBulkRunPolygons.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> SaveAsScheduledRouteAsync(int polygonId, SaveAsScheduledRouteRequest req, CancellationToken ct = default)
    {
        var entity = await db.TblBulkRunPolygons.FindAsync([polygonId], ct)
            ?? throw new InvalidOperationException($"Polygon {polygonId} not found");

        var route = new TblRecurringRoute
        {
            Name = req.RouteName,
            Frequency = req.Frequency,
            TimeWindowStart = req.TimeWindowStart,
            TimeWindowEnd = req.TimeWindowEnd,
            ServiceLevel = req.ServiceLevel,
            TagLocation = req.TagLocation,
            ColorHex = entity.ColorHex,
            IsActive = true,
        };
        foreach (var z in req.ZipCodes.Distinct())
            route.Zips.Add(new TblRecurringRouteZip { ZipCode = z });
        db.TblRecurringRoutes.Add(route);
        await db.SaveChangesAsync(ct);

        entity.RecurringRouteId = route.RecurringRouteId;
        entity.TagLocation = req.TagLocation;
        entity.LastModifiedUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        log.LogInformation("Polygon {Pid} saved as scheduled route {Rid} ({Name})", polygonId, route.RecurringRouteId, route.Name);
        return route.RecurringRouteId;
    }
}
