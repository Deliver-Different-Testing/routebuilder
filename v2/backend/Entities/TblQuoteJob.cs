namespace RouteBuilder.Entities;

/// <summary>
/// Shadow job — uploaded for quoting. Never promotes to tucJob.
/// Scoped by QuoteSetCode so multiple quote sets can coexist.
/// </summary>
public partial class TblQuoteJob
{
    public int       QuoteJobId   { get; set; }
    public string    QuoteSetCode { get; set; } = string.Empty;
    public int?      QuoteRunId   { get; set; }     // null until simulation assigns the job to a quote run

    public string?   Customer     { get; set; }
    public string?   FromAddress  { get; set; }
    public string?   ToAddress    { get; set; }
    public int?      FromPostCode { get; set; }
    public int?      ToPostCode   { get; set; }
    public decimal?  WeightKg     { get; set; }
    public TimeOnly? WindowStart  { get; set; }
    public TimeOnly? WindowEnd    { get; set; }
    public bool      IsPickup     { get; set; }

    public DateTime  CreatedUtc   { get; set; } = DateTime.UtcNow;

    public virtual TblQuoteRun? QuoteRun { get; set; }
}
