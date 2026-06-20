namespace RouteBuilder.Dtos;

public record FleetDto(int UfltId, string? Name);
public record CourierDto(int UccrId, string? Name, int? FleetId, string Status);
