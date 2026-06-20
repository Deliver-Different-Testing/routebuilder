namespace RouteBuilder.Entities;

/// <summary>
/// User-drawn polygon used as a geo-gate during route assembly.
/// May be tagged to a Scheduled Route — when tagged, the polygon becomes that route's geo-gate.
/// </summary>
public partial class TblBulkRunPolygon
{
    public int       PolygonId         { get; set; }
    public string    Name              { get; set; } = string.Empty;
    public string?   ColorHex          { get; set; }       // for rendering
    public int?      RecurringRouteId  { get; set; }       // null until saved as a Scheduled Route
    public string?   TagLocation       { get; set; }       // depot / customer / freeform
    public DateTime  CreatedUtc        { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedUtc   { get; set; }

    public virtual ICollection<TblBulkRunPolygonPoint> Points { get; set; } = new List<TblBulkRunPolygonPoint>();
    public virtual TblRecurringRoute? RecurringRoute { get; set; }
}
