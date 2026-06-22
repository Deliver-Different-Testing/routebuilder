using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteBuilder.Dtos;
using RouteBuilder.Services;

namespace RouteBuilder.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize(Policy = "RouteBuilder.Read")]
public class JobsController(IJobService jobs) : ControllerBase
{
    /// <summary>Unified candidate-job feed — merge of tblBulkJob + tucJob + tucJobBooking.</summary>
    [HttpGet]
    public async Task<ActionResult<List<JobDto>>> Get(
        [FromQuery] DateTime? date,
        [FromQuery] TimeOnly? readyAt,
        [FromQuery] string[]? sources,
        [FromQuery] bool? pickupsOnly,
        [FromQuery] bool? deliveriesOnly,
        [FromQuery] string[]? zipCodes,
        [FromQuery] string? search,
        CancellationToken ct)
        => await jobs.GetCandidateJobsAsync(
            new JobQuery(date, readyAt, sources, pickupsOnly, deliveriesOnly, zipCodes, search), ct);

    [HttpGet("{source}/{id}")]
    public async Task<ActionResult<JobDto?>> GetOne(string source, string id, CancellationToken ct)
        => await jobs.GetByIdAsync(source, id, ct) is { } j ? Ok(j) : NotFound();

    [HttpGet("groups")]
    public async Task<ActionResult<IEnumerable<object>>> Groups([FromQuery] DateTime date, [FromQuery] bool? pickupsOnly, CancellationToken ct)
        => Ok((await jobs.GetGroupsByReadyTimeAsync(date, pickupsOnly, ct))
              .Select(g => new { readyAt = g.ReadyAt, count = g.Count }));
}
