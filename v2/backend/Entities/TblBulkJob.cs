namespace RouteBuilder.Entities;

/// <summary>
/// Existing bulk-job table. Field set mirrors the legacy RunBuilder Models/TblBulkJob.cs.
/// READ-ONLY in Phase 1 — RouteBuilder reads candidate jobs from here and unions with tucJob + tucJobBooking.
/// </summary>
public partial class TblBulkJob
{
    public int       BulkJobId       { get; set; }
    public string?   JobNumber       { get; set; }
    public DateTime  BookDate        { get; set; }
    public DateTime  BookTime        { get; set; }
    public int       JobStatus       { get; set; }
    public int       ClientId        { get; set; }
    public string?   ClientCode      { get; set; }
    public string?   Contact         { get; set; }
    public decimal?  Amount          { get; set; }
    public int       Speed           { get; set; }
    public string?   FromCompany     { get; set; }
    public string?   FromAddress     { get; set; }
    public string?   FromSuburb      { get; set; }
    public int?      FromPostCode    { get; set; }
    public string?   ToCompany       { get; set; }
    public string?   ToAddress       { get; set; }
    public string?   ToSuburb        { get; set; }
    public int?      ToPostCode      { get; set; }
    public int?      Size            { get; set; }
    public short?    Qty             { get; set; }
    public decimal?  Weight          { get; set; }
    public int?      CourierId       { get; set; }
    public string?   ClientRefa      { get; set; }
    public string?   ClientRefb      { get; set; }
    public string?   OurRef          { get; set; }
    public bool?     DeliverToPrivateBusiness { get; set; }
    public bool?     IsPickup        { get; set; }   // <<< new in Phase 1 (migration adds the column)
    public double?   FromLat         { get; set; }
    public double?   FromLng         { get; set; }
    public double?   ToLat           { get; set; }
    public double?   ToLng           { get; set; }
}
