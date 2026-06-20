namespace RouteBuilder.Dtos;

public record ScheduledRouteDto(
    int RecurringRouteId,
    string Name,
    string Frequency,
    TimeOnly? TimeWindowStart,
    TimeOnly? TimeWindowEnd,
    int AvgJobs,
    string? ServiceLevel,
    string? TagLocation,
    string? ColorHex,
    bool IsActive,
    DateTime? LastBuiltUtc,
    List<string> ZipCodes
);

public record CreateScheduledRouteRequest(
    string Name,
    string Frequency,
    TimeOnly? TimeWindowStart,
    TimeOnly? TimeWindowEnd,
    string? ServiceLevel,
    string? TagLocation,
    string? ColorHex,
    List<string> ZipCodes
);
