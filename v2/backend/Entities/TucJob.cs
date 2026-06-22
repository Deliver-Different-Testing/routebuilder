namespace RouteBuilder.Entities;

/// <summary>
/// Existing live-job table. Field set mirrors despatchweb/EntityClasses/TucJob.cs.
/// READ-ONLY in Phase 1.
/// </summary>
public partial class TucJob
{
    public int       UcjbId          { get; set; }
    public string?   UcjbNumber      { get; set; }
    public DateTime  UcjbDate        { get; set; }
    public DateTime? UcjbTime        { get; set; }
    public double?   UcjbType        { get; set; }
    public int?      UcjbClientId    { get; set; }
    public string?   UcjbContact     { get; set; }
    public double?   UcjbChargeType  { get; set; }
    public decimal?  UcjbAmount      { get; set; }
    public int?      UcjbSpeed       { get; set; }
    public int?      UcjbFrom        { get; set; }
    public string?   UcjbFromAddr    { get; set; }
    public int?      UcjbTo          { get; set; }
    public string?   UcjbToAddr      { get; set; }
    public string?   UcjbToSpecial   { get; set; }
    public int?      UcjbSize        { get; set; }
    public short?    UcjbQty         { get; set; }
    public bool      UcjbCbd         { get; set; }
    public bool?     UcjbIsPickup    { get; set; }   // <<< new in Phase 1
    public double?   UcjbFromLat     { get; set; }
    public double?   UcjbFromLng     { get; set; }
    public double?   UcjbToLat       { get; set; }
    public double?   UcjbToLng       { get; set; }
    public int?      UcjbFromPostCode{ get; set; }
    public int?      UcjbToPostCode  { get; set; }
}
