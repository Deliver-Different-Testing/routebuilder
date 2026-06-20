namespace RouteBuilder.Entities;

/// <summary>Single corner of a polygon. Order matters — see OrderIndex.</summary>
public partial class TblBulkRunPolygonPoint
{
    public int    PolygonPointId { get; set; }
    public int    PolygonId      { get; set; }
    public int    OrderIndex     { get; set; }
    public double Lat            { get; set; }
    public double Lng            { get; set; }

    public virtual TblBulkRunPolygon? Polygon { get; set; }
}
