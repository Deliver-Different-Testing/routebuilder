using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public interface IPolygonService
{
    Task<List<PolygonDto>> GetAllAsync(CancellationToken ct = default);
    Task<PolygonDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PolygonDto> CreateAsync(CreatePolygonRequest req, CancellationToken ct = default);
    Task<PolygonDto?> UpdateAsync(int id, UpdatePolygonRequest req, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<int> SaveAsScheduledRouteAsync(int polygonId, SaveAsScheduledRouteRequest req, CancellationToken ct = default);
}
