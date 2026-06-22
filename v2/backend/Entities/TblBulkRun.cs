namespace RouteBuilder.Entities;

/// <summary>Existing run table. Field set mirrors legacy Models/TblBulkRun.cs.</summary>
public partial class TblBulkRun
{
    public int       Id                  { get; set; }
    public string?   Name                { get; set; }
    public int?      Mins                { get; set; }
    public double?   Kms                 { get; set; }
    public int?      CourierId           { get; set; }
    public int?      Status              { get; set; }
    public decimal?  Revenue             { get; set; }
    public decimal?  Payout              { get; set; }
    public double?   CourierPercentage   { get; set; }
    public string?   GoogleRouteResponse { get; set; }
    public DateTime? Created             { get; set; }
    public DateTime? LastModified        { get; set; }
    public DateTime? DespatchDateTime    { get; set; }

    public int?      RecurringRouteId    { get; set; }   // <<< new in Phase 1
    public bool?     IsPickupRun         { get; set; }   // <<< new in Phase 1

    public virtual ICollection<TblBulkJobRun> Jobs { get; set; } = new List<TblBulkJobRun>();
}
