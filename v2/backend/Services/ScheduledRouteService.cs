using Microsoft.EntityFrameworkCore;
using RouteBuilder.Data;
using RouteBuilder.Dtos;
using RouteBuilder.Entities;

namespace RouteBuilder.Services;

public class ScheduledRouteService(RouteBuilderDbContext db, ILogger<ScheduledRouteService> log) : IScheduledRouteService
{
    public async Task<List<ScheduledRouteDto>> GetAllAsync(bool activeOnly, CancellationToken ct = default)
    {
        var q = db.TblRecurringRoutes.AsNoTracking().Include(r => r.Zips).AsQueryable();
        if (activeOnly) q = q.Where(r => r.IsActive);
        return await q.Select(r => new ScheduledRouteDto(
            r.RecurringRouteId, r.Name, r.Frequency, r.TimeWindowStart, r.TimeWindowEnd,
            r.AvgJobs, r.ServiceLevel, r.TagLocation, r.ColorHex, r.IsActive, r.LastBuiltUtc,
            r.Zips.Select(z => z.ZipCode).ToList()
        )).ToListAsync(ct);
    }

    public async Task<ScheduledRouteDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => (await GetAllAsync(false, ct)).FirstOrDefault(r => r.RecurringRouteId == id);

    public async Task<ScheduledRouteDto> CreateAsync(CreateScheduledRouteRequest req, CancellationToken ct = default)
    {
        var entity = new TblRecurringRoute
        {
            Name = req.Name,
            Frequency = req.Frequency,
            TimeWindowStart = req.TimeWindowStart,
            TimeWindowEnd = req.TimeWindowEnd,
            ServiceLevel = req.ServiceLevel,
            TagLocation = req.TagLocation,
            ColorHex = req.ColorHex,
            IsActive = true,
        };
        foreach (var z in req.ZipCodes.Distinct())
            entity.Zips.Add(new TblRecurringRouteZip { ZipCode = z });
        db.TblRecurringRoutes.Add(entity);
        await db.SaveChangesAsync(ct);
        log.LogInformation("Created scheduled route {Id} ({Name})", entity.RecurringRouteId, entity.Name);
        return (await GetByIdAsync(entity.RecurringRouteId, ct))!;
    }

    public async Task<bool> BuildNowAsync(int id, CancellationToken ct = default)
    {
        // TODO Kevin: invoke the route-build engine for this scheduled route's zip set
        //  - find candidate jobs for today in those zips via IJobService
        //  - call IRunService.CreateRunAsync with the matched jobs
        //  - update LastBuiltUtc on the recurring route
        log.LogWarning("BuildNow is a stub — wire engine in Phase 1.6");
        var r = await db.TblRecurringRoutes.FirstOrDefaultAsync(x => x.RecurringRouteId == id, ct);
        if (r is null) return false;
        r.LastBuiltUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
