using Microsoft.EntityFrameworkCore;
using RouteBuilder.Data;
using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public class FleetService(RouteBuilderDbContext db) : IFleetService
{
    public async Task<List<FleetDto>> GetFleetsAsync(CancellationToken ct = default)
        => await db.TucFleets.AsNoTracking()
            .Where(f => f.UfltActive ?? true)
            .Select(f => new FleetDto(f.UfltId, f.UfltName))
            .ToListAsync(ct);

    public async Task<List<CourierDto>> GetCouriersByFleetAsync(int fleetId, CancellationToken ct = default)
        => await db.TucCouriers.AsNoTracking()
            .Where(c => c.UccrFleetId == fleetId && (c.UccrActive ?? true))
            .Select(c => new CourierDto(
                c.UccrId, c.UccrName, c.UccrFleetId,
                c.UccrStatus == 1 ? "available" : c.UccrStatus == 2 ? "on-run" : "off"
            ))
            .ToListAsync(ct);
}
