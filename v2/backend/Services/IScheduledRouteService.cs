using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public interface IScheduledRouteService
{
    Task<List<ScheduledRouteDto>> GetAllAsync(bool activeOnly, CancellationToken ct = default);
    Task<ScheduledRouteDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ScheduledRouteDto> CreateAsync(CreateScheduledRouteRequest req, CancellationToken ct = default);
    Task<bool> BuildNowAsync(int id, CancellationToken ct = default);
}
