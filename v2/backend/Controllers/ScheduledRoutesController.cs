using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteBuilder.Dtos;
using RouteBuilder.Services;

namespace RouteBuilder.Controllers;

[ApiController]
[Route("api/scheduled-routes")]
[Authorize(Policy = "RouteBuilder.Read")]
public class ScheduledRoutesController(IScheduledRouteService routes) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ScheduledRouteDto>>> Get([FromQuery] bool activeOnly = true, CancellationToken ct = default)
        => await routes.GetAllAsync(activeOnly, ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ScheduledRouteDto>> GetOne(int id, CancellationToken ct)
        => await routes.GetByIdAsync(id, ct) is { } r ? Ok(r) : NotFound();

    [HttpPost]
    [Authorize(Policy = "RouteBuilder.Admin")]
    public async Task<ActionResult<ScheduledRouteDto>> Create([FromBody] CreateScheduledRouteRequest req, CancellationToken ct)
        => await routes.CreateAsync(req, ct);

    [HttpPost("{id:int}/build-now")]
    [Authorize(Policy = "RouteBuilder.Build")]
    public async Task<IActionResult> BuildNow(int id, CancellationToken ct)
        => await routes.BuildNowAsync(id, ct) ? NoContent() : NotFound();
}
