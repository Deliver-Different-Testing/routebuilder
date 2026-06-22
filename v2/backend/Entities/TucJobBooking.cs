namespace RouteBuilder.Entities;

/// <summary>
/// Existing booking-side job table. Field set mirrors despatchweb/EntityClasses/TucJobBooking.cs.
/// READ-ONLY in Phase 1.
/// </summary>
public partial class TucJobBooking
{
    public int       UcbkId          { get; set; }
    public string?   UcbkJobNumber   { get; set; }
    public DateTime? UcbkDate        { get; set; }
    public DateTime? UcbkTime        { get; set; }
    public int?      UcbkType        { get; set; }
    public int?      UcbkClientId    { get; set; }
    public string?   UcbkClientCode  { get; set; }
    public string?   UcbkClientRef   { get; set; }
    public string?   UcbkOurRef      { get; set; }
    public string?   UcbkContact     { get; set; }
    public decimal?  UcbkAmount      { get; set; }
    public double?   UcbkChargeType  { get; set; }
    public double?   UcbkFrom        { get; set; }
    public string?   UcbkFromAddr    { get; set; }
    public double?   UcbkTo          { get; set; }
    public string?   UcbkToAddr      { get; set; }
    public int?      UcbkFromPostCode{ get; set; }
    public int?      UcbkToPostCode  { get; set; }
    public bool?     UcbkIsPickup    { get; set; }   // <<< new in Phase 1
    public double?   UcbkFromLat     { get; set; }
    public double?   UcbkFromLng     { get; set; }
    public double?   UcbkToLat       { get; set; }
    public double?   UcbkToLng       { get; set; }
}
