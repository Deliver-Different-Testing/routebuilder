namespace RouteBuilder.Entities;

/// <summary>Zip codes covered by a scheduled route — many-to-one with TblRecurringRoute.</summary>
public partial class TblRecurringRouteZip
{
    public int    RecurringRouteZipId { get; set; }
    public int    RecurringRouteId    { get; set; }
    public string ZipCode             { get; set; } = string.Empty;

    public virtual TblRecurringRoute? RecurringRoute { get; set; }
}
