namespace RouteBuilder.Entities;

/// <summary>
/// Per-tenant build-settings row (vehicle type, time-window, max-jobs, etc.).
/// Mirrors the Settings drawer in the React mockup.
/// </summary>
public partial class TblBulkRunSetting
{
    public int      Id                  { get; set; }
    public string?  VehicleType         { get; set; }
    public decimal? AveragePackageSizeM3 { get; set; }
    public int?     TimeWindowMinutes   { get; set; }
    public int?     MaxJobsPerRoute     { get; set; }
    public int?     MaxKmPerRoute       { get; set; }
    public bool?    ReturnToDepot       { get; set; }
    public bool?    RespectColdChain    { get; set; }
    public bool?    OptimiseStopOrder   { get; set; }
    public bool?    TightPack           { get; set; }
    public bool?    IncludePickupLeg    { get; set; }
    public DateTime? LastModified       { get; set; }
}
