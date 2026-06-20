namespace RouteBuilder.Entities;

/// <summary>Join table — job belongs to run. Composite key.</summary>
public partial class TblBulkJobRun
{
    public int  BulkRunId { get; set; }
    public int  BulkJobId { get; set; }
    public int  StopOrder { get; set; }
    public bool IsEndPoint { get; set; }

    public virtual TblBulkRun? Run { get; set; }
    public virtual TblBulkJob? Job { get; set; }
}
