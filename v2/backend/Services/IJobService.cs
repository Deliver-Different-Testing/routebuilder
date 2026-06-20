using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public interface IJobService
{
    Task<List<JobDto>> GetCandidateJobsAsync(JobQuery query, CancellationToken ct = default);
    Task<JobDto?> GetByIdAsync(string source, string id, CancellationToken ct = default);
    Task<List<(string ReadyAt, int Count)>> GetGroupsByReadyTimeAsync(DateTime date, bool? pickupsOnly, CancellationToken ct = default);
}
