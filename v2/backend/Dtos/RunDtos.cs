namespace RouteBuilder.Dtos;

public record RunDto(
    int Id,
    string? Name,
    int? Mins,
    double? Kms,
    int? Jobs,
    int? CourierId,
    string? Courier,
    int? Status,
    decimal? Revenue,
    decimal? Payout,
    double? CourierPercentage,
    DateTime? Created,
    DateTime? DespatchDateTime,
    int? RecurringRouteId,
    bool? IsPickupRun
);

public record RunDetailDto(RunDto Run, List<RunJobDto> Stops);

public record RunJobDto(
    int StopOrder,
    string Source,
    string Id,
    string? JobNumber,
    string? Customer,
    string? FromAddress,
    string? ToAddress,
    string? Suburb,
    int? ZipCode,
    bool IsPickup,
    bool IsEndPoint
);

public record CreateRunRequest(
    string Name,
    int? RecurringRouteId,
    bool IsPickupRun,
    List<RunJobRef> Stops
);

public record RunJobRef(string Source, string Id);

public record AssignCourierRequest(int CourierId);

public record AssignPickupToRunRequest(string PickupSource, string PickupId, int RunId);
