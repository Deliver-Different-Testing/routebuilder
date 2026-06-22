using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteBuilder.Dtos;
using RouteBuilder.Services;

namespace RouteBuilder.Controllers;

[ApiController]
[Route("api/polygons")]
[Authorize(Policy = "RouteBuilder.Polygon")]
public class PolygonsController(IPolygonService polygons) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PolygonDto>>> Get(CancellationToken ct)
        => await polygons.GetAllAsync(ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PolygonDto>> GetOne(int id, CancellationToken ct)
        => await polygons.GetByIdAsync(id, ct) is { } p ? Ok(p) : NotFound();

    [HttpPost]
    public async Task<ActionResult<PolygonDto>> Create([FromBody] CreatePolygonRequest req, CancellationToken ct)
        => await polygons.CreateAsync(req, ct);

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PolygonDto>> Update(int id, [FromBody] UpdatePolygonRequest req, CancellationToken ct)
        => await polygons.UpdateAsync(id, req, ct) is { } p ? Ok(p) : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await polygons.DeleteAsync(id, ct) ? NoContent() : NotFound();

    [HttpPost("{id:int}/save-as-scheduled-route")]
    public async Task<ActionResult<int>> SaveAsRoute(int id, [FromBody] SaveAsScheduledRouteRequest req, CancellationToken ct)
        => Ok(await polygons.SaveAsScheduledRouteAsync(id, req, ct));
}
