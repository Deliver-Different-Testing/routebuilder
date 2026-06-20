namespace RouteBuilder.Dtos;

public record QuoteUploadRequest(string QuoteSetCode, List<QuoteJobUploadRow> Rows);
public record QuoteJobUploadRow(string? Customer, string? FromAddress, string? ToAddress, int? FromPostCode, int? ToPostCode, decimal? WeightKg, TimeOnly? WindowStart, TimeOnly? WindowEnd, bool IsPickup);
public record QuoteSimulateRequest(string QuoteSetCode, string RateCard, string ServiceLevel, int MaxStopsPerRun, int TargetUtilisationPct);

public record QuoteSimulateResult(
    string QuoteSetCode,
    int JobCount,
    int DriversRequired,
    double AvgShiftHours,
    decimal CostPerJob,
    decimal CostPerKm,
    decimal TotalCost,
    decimal MarginPct,
    decimal RecommendedQuote
);
