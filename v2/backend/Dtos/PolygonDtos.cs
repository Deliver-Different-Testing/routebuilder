namespace RouteBuilder.Dtos;

public record PolygonDto(
    int PolygonId,
    string Name,
    string? ColorHex,
    int? RecurringRouteId,
    string? TagLocation,
    List<PolygonPointDto> Points
);

public record PolygonPointDto(double Lat, double Lng);

public record CreatePolygonRequest(
    string Name,
    string? ColorHex,
    List<PolygonPointDto> Points
);

public record UpdatePolygonRequest(
    string? Name,
    string? ColorHex,
    List<PolygonPointDto>? Points
);

public record SaveAsScheduledRouteRequest(
    string RouteName,
    string TagLocation,
    string Frequency,
    TimeOnly? TimeWindowStart,
    TimeOnly? TimeWindowEnd,
    string? ServiceLevel,
    List<string> ZipCodes
);
