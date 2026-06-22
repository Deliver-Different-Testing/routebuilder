using RouteBuilder.Data;
using RouteBuilder.Dtos;
using RouteBuilder.Entities;

namespace RouteBuilder.Services;

public class QuoteService(RouteBuilderDbContext db, ILogger<QuoteService> log) : IQuoteService
{
    public async Task<int> UploadAsync(QuoteUploadRequest req, CancellationToken ct = default)
    {
        var rows = req.Rows.Select(r => new TblQuoteJob
        {
            QuoteSetCode = req.QuoteSetCode,
            Customer = r.Customer,
            FromAddress = r.FromAddress,
            ToAddress = r.ToAddress,
            FromPostCode = r.FromPostCode,
            ToPostCode = r.ToPostCode,
            WeightKg = r.WeightKg,
            WindowStart = r.WindowStart,
            WindowEnd = r.WindowEnd,
            IsPickup = r.IsPickup,
            CreatedUtc = DateTime.UtcNow,
        }).ToList();
        db.TblQuoteJobs.AddRange(rows);
        await db.SaveChangesAsync(ct);
        log.LogInformation("Uploaded {Count} quote jobs into set {Set}", rows.Count, req.QuoteSetCode);
        return rows.Count;
    }

    public async Task<QuoteSimulateResult> SimulateAsync(QuoteSimulateRequest req, CancellationToken ct = default)
    {
        // TODO Kevin: real simulation. Phase 1 returns a calibration result.
        // - Group jobs in the quote set by zip
        // - Estimate stop-time per job, km between stops via HERE or Google
        // - Apply rate card + service level to compute cost/quote/margin
        var jobs = db.TblQuoteJobs.Where(j => j.QuoteSetCode == req.QuoteSetCode);
        var jobCount = jobs.Count();
        var drivers = Math.Max(1, (int)Math.Ceiling(jobCount / (double)req.MaxStopsPerRun));
        var avgShift = 8.5;
        var costPerJob = 12.50m;
        var costPerKm = 1.20m;
        var estimatedKm = jobCount * 3.8m;
        var totalCost = jobCount * costPerJob + estimatedKm * costPerKm;
        var marginPct = 22m;
        var quote = totalCost * (1 + marginPct / 100m);
        var result = new QuoteSimulateResult(
            req.QuoteSetCode, jobCount, drivers, avgShift, costPerJob, costPerKm, totalCost, marginPct, quote
        );
        log.LogInformation("Simulated quote {Set}: {Jobs} jobs, {Drivers} drivers, ${Quote}", req.QuoteSetCode, jobCount, drivers, quote);
        await Task.CompletedTask;
        return result;
    }
}
