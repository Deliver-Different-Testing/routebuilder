using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public interface IRunService
{
    Task<List<RunDto>> GetRunsAsync(DateTime? date, CancellationToken ct = default);
    Task<RunDetailDto?> GetRunDetailAsync(int runId, CancellationToken ct = default);
    Task<RunDto> CreateRunAsync(CreateRunRequest req, CancellationToken ct = default);
    Task<bool> AssignCourierAsync(int runId, int courierId, CancellationToken ct = default);
    Task<bool> AssignPickupToRunAsync(string pickupSource, string pickupId, int runId, CancellationToken ct = default);
    Task<bool> AutoMatchPickupsByZipAsync(DateTime date, CancellationToken ct = default);
}
