namespace RouteBuilder.Entities;

/// <summary>Courier fleet. Existing table.</summary>
public partial class TucFleet
{
    public int     UfltId   { get; set; }
    public string? UfltName { get; set; }
    public bool?   UfltActive { get; set; }
}
