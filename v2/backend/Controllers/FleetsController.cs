using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteBuilder.Dtos;
using RouteBuilder.Services;

namespace RouteBuilder.Controllers;

[ApiController]
[Route("api/fleets")]
[Authorize(Policy = "RouteBuilder.Read")]
public class FleetsController(IFleetService fleets) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FleetDto>>> Get(CancellationToken ct)
        => await fleets.GetFleetsAsync(ct);

    [HttpGet("{fleetId:int}/couriers")]
    public async Task<ActionResult<List<CourierDto>>> Couriers(int fleetId, CancellationToken ct)
        => await fleets.GetCouriersByFleetAsync(fleetId, ct);
}
