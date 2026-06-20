namespace RouteBuilder.Entities;

/// <summary>
/// Recurring / scheduled route — auto-build trigger.
/// Drives the Scheduled Routes board in the cockpit.
/// </summary>
public partial class TblRecurringRoute
{
    public int       RecurringRouteId { get; set; }
    public string    Name             { get; set; } = string.Empty;
    public string    Frequency        { get; set; } = string.Empty;  // "Mon–Fri", "Daily", etc.
    public TimeOnly? TimeWindowStart  { get; set; }
    public TimeOnly? TimeWindowEnd    { get; set; }
    public int       AvgJobs          { get; set; }
    public string?   ServiceLevel     { get; set; }
    public string?   TagLocation      { get; set; }
    public string?   ColorHex         { get; set; }
    public bool      IsActive         { get; set; } = true;
    public DateTime  CreatedUtc       { get; set; } = DateTime.UtcNow;
    public DateTime? LastBuiltUtc     { get; set; }

    public virtual ICollection<TblRecurringRouteZip> Zips { get; set; } = new List<TblRecurringRouteZip>();
}
