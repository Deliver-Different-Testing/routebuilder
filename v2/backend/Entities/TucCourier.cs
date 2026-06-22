namespace RouteBuilder.Entities;

/// <summary>Courier. Existing table — only the fields RouteBuilder actually needs.</summary>
public partial class TucCourier
{
    public int     UccrId           { get; set; }
    public string? UccrName         { get; set; }
    public string? UccrEmail        { get; set; }
    public string? UccrMobile       { get; set; }
    public int?    UccrFleetId      { get; set; }
    public int?    UccrStatus       { get; set; }  // 0 off / 1 available / 2 on-run
    public bool?   UccrActive       { get; set; }
}
