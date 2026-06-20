namespace RouteBuilder.Dtos;

public record JobSourceDto(string Source, string Id, string? JobNumber);

/// <summary>Unified candidate-job projection — read from tblBulkJob ∪ tucJob ∪ tucJobBooking.</summary>
public record JobDto(
    string  Id,                 // composite: "{source}::{nativeId}"
    string  Source,             // "tblBulkJob" | "tucJob" | "tucJobBooking"
    string? JobNumber,
    string? Customer,
    DateTime? Date,
    TimeOnly? ReadyAt,
    TimeOnly? WindowStart,
    TimeOnly? WindowEnd,
    string? FromAddress,
    string? ToAddress,
    string? FromSuburb,
    string? ToSuburb,
    int?    FromPostCode,
    int?    ToPostCode,
    double? FromLat,
    double? FromLng,
    double? ToLat,
    double? ToLng,
    decimal? WeightKg,
    int?    Speed,
    bool    IsPickup,
    int?    AssignedRunId,
    int?    AssignedCourierId,
    string? Courier
);

public record JobQuery(
    DateTime? Date,
    TimeOnly? ReadyAt,
    string[]? Sources,
    bool?     PickupsOnly,
    bool?     DeliveriesOnly,
    string[]? ZipCodes,
    string?   Search
);
