using RouteBuilder.Dtos;

namespace RouteBuilder.Services;

public interface IQuoteService
{
    Task<int> UploadAsync(QuoteUploadRequest req, CancellationToken ct = default);
    Task<QuoteSimulateResult> SimulateAsync(QuoteSimulateRequest req, CancellationToken ct = default);
}
