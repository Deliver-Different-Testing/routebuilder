using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public interface IFleetService
{
    Task<List<FleetDto>> GetFleetsAsync(CancellationToken ct = default);
    Task<List<CourierDto>> GetCouriersByFleetAsync(int fleetId, CancellationToken ct = default);
}
