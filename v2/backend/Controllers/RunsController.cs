using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteBuilder.Dtos;
using RouteBuilder.Services;

namespace RouteBuilder.Controllers;

[ApiController]
[Route("api/runs")]
[Authorize(Policy = "RouteBuilder.Read")]
public class RunsController(IRunService runs) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RunDto>>> Get([FromQuery] DateTime? date, CancellationToken ct)
        => await runs.GetRunsAsync(date, ct);

    [HttpGet("{runId:int}")]
    public async Task<ActionResult<RunDetailDto>> GetDetail(int runId, CancellationToken ct)
        => await runs.GetRunDetailAsync(runId, ct) is { } d ? Ok(d) : NotFound();

    [HttpPost]
    [Authorize(Policy = "RouteBuilder.Build")]
    public async Task<ActionResult<RunDto>> Create([FromBody] CreateRunRequest req, CancellationToken ct)
        => await runs.CreateRunAsync(req, ct);

    [HttpPost("{runId:int}/assign-courier")]
    [Authorize(Policy = "RouteBuilder.Build")]
    public async Task<IActionResult> AssignCourier(int runId, [FromBody] AssignCourierRequest req, CancellationToken ct)
        => await runs.AssignCourierAsync(runId, req.CourierId, ct) ? NoContent() : NotFound();

    [HttpPost("assign-pickup")]
    [Authorize(Policy = "RouteBuilder.Build")]
    public async Task<IActionResult> AssignPickup([FromBody] AssignPickupToRunRequest req, CancellationToken ct)
        => await runs.AssignPickupToRunAsync(req.PickupSource, req.PickupId, req.RunId, ct) ? NoContent() : NotFound();

    [HttpPost("auto-match-pickups")]
    [Authorize(Policy = "RouteBuilder.Build")]
    public async Task<IActionResult> AutoMatchPickups([FromQuery] DateTime date, CancellationToken ct)
        => await runs.AutoMatchPickupsByZipAsync(date, ct) ? NoContent() : NotFound();
}
