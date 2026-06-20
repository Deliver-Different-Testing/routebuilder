using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteBuilder.Dtos;
using RouteBuilder.Services;

namespace RouteBuilder.Controllers;

[ApiController]
[Route("api/quote")]
[Authorize(Policy = "RouteBuilder.Quote")]
public class QuoteController(IQuoteService quote) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<ActionResult<int>> Upload([FromBody] QuoteUploadRequest req, CancellationToken ct)
        => Ok(await quote.UploadAsync(req, ct));

    [HttpPost("simulate")]
    public async Task<ActionResult<QuoteSimulateResult>> Simulate([FromBody] QuoteSimulateRequest req, CancellationToken ct)
        => await quote.SimulateAsync(req, ct);
}
