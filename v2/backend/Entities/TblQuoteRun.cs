namespace RouteBuilder.Entities;

/// <summary>Simulated run produced by the quoting engine over tblQuoteJob.</summary>
public partial class TblQuoteRun
{
    public int       QuoteRunId   { get; set; }
    public string    QuoteSetCode { get; set; } = string.Empty;
    public string?   Name         { get; set; }
    public int       JobCount     { get; set; }
    public int       EstimatedMins{ get; set; }
    public double    EstimatedKm  { get; set; }
    public decimal   ProjectedRevenue { get; set; }
    public decimal   ProjectedCost    { get; set; }
    public decimal   RecommendedQuote { get; set; }
    public int       DriversRequired  { get; set; }
    public DateTime  CreatedUtc       { get; set; } = DateTime.UtcNow;

    public virtual ICollection<TblQuoteJob> QuoteJobs { get; set; } = new List<TblQuoteJob>();
}
