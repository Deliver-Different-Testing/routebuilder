using Microsoft.EntityFrameworkCore;
using RouteBuilder.Data;
using RouteBuilder.Dtos;
using RouteBuilder.Entities;

namespace RouteBuilder.Services;

/// <summary>
/// Unified job projection — reads from tblBulkJob + tucJob + tucJobBooking via EF Core,
/// projects each source into a common JobDto shape.
///
/// PER SCOPING DOC Q4 — no stored procedures. All logic in this app layer.
/// </summary>
public class JobService(RouteBuilderDbContext db, ILogger<JobService> log) : IJobService
{
    public async Task<List<JobDto>> GetCandidateJobsAsync(JobQuery q, CancellationToken ct = default)
    {
        var includeBulk    = q.Sources is null || q.Sources.Contains("tblBulkJob");
        var includeTucJob  = q.Sources is null || q.Sources.Contains("tucJob");
        var includeTucBook = q.Sources is null || q.Sources.Contains("tucJobBooking");

        // tblBulkJob projection
        var bulk = !includeBulk ? new List<JobDto>() : await db.TblBulkJobs
            .AsNoTracking()
            .Where(j => q.Date == null || j.BookDate.Date == q.Date.Value.Date)
            .Where(j => q.PickupsOnly  != true || j.IsPickup == true)
            .Where(j => q.DeliveriesOnly != true || (j.IsPickup ?? false) == false)
            .Where(j => q.ZipCodes == null || q.ZipCodes.Length == 0 || (j.ToPostCode != null && q.ZipCodes.Contains(j.ToPostCode.ToString()!)))
            .Where(j => q.Search == null
                       || (j.JobNumber  != null && j.JobNumber.Contains(q.Search))
                       || (j.FromCompany != null && j.FromCompany.Contains(q.Search))
                       || (j.ToCompany   != null && j.ToCompany.Contains(q.Search)))
            .Select(j => new JobDto(
                $"tblBulkJob::{j.BulkJobId}",
                "tblBulkJob",
                j.JobNumber,
                j.FromCompany ?? j.ToCompany,
                j.BookDate,
                TimeOnly.FromDateTime(j.BookTime),
                null,
                null,
                j.FromAddress,
                j.ToAddress,
                j.FromSuburb,
                j.ToSuburb,
                j.FromPostCode,
                j.ToPostCode,
                j.FromLat,
                j.FromLng,
                j.ToLat,
                j.ToLng,
                j.Weight,
                j.Speed,
                j.IsPickup ?? false,
                null,
                j.CourierId,
                null
            ))
            .ToListAsync(ct);

        var tucJob = !includeTucJob ? new List<JobDto>() : await db.TucJobs
            .AsNoTracking()
            .Where(j => q.Date == null || j.UcjbDate.Date == q.Date.Value.Date)
            .Where(j => q.PickupsOnly  != true || j.UcjbIsPickup == true)
            .Where(j => q.DeliveriesOnly != true || (j.UcjbIsPickup ?? false) == false)
            .Where(j => q.ZipCodes == null || q.ZipCodes.Length == 0 || (j.UcjbToPostCode != null && q.ZipCodes.Contains(j.UcjbToPostCode.ToString()!)))
            .Where(j => q.Search == null
                       || (j.UcjbNumber != null && j.UcjbNumber.Contains(q.Search))
                       || (j.UcjbContact != null && j.UcjbContact.Contains(q.Search))
                       || (j.UcjbToAddr != null && j.UcjbToAddr.Contains(q.Search)))
            .Select(j => new JobDto(
                $"tucJob::{j.UcjbId}",
                "tucJob",
                j.UcjbNumber,
                j.UcjbContact,
                j.UcjbDate,
                j.UcjbTime != null ? TimeOnly.FromDateTime(j.UcjbTime.Value) : null,
                null,
                null,
                j.UcjbFromAddr,
                j.UcjbToAddr,
                null,
                null,
                j.UcjbFromPostCode,
                j.UcjbToPostCode,
                j.UcjbFromLat,
                j.UcjbFromLng,
                j.UcjbToLat,
                j.UcjbToLng,
                null,
                j.UcjbSpeed,
                j.UcjbIsPickup ?? false,
                null,
                null,
                null
            ))
            .ToListAsync(ct);

        var tucBook = !includeTucBook ? new List<JobDto>() : await db.TucJobBookings
            .AsNoTracking()
            .Where(j => q.Date == null || (j.UcbkDate != null && j.UcbkDate.Value.Date == q.Date.Value.Date))
            .Where(j => q.PickupsOnly  != true || j.UcbkIsPickup == true)
            .Where(j => q.DeliveriesOnly != true || (j.UcbkIsPickup ?? false) == false)
            .Where(j => q.ZipCodes == null || q.ZipCodes.Length == 0 || (j.UcbkToPostCode != null && q.ZipCodes.Contains(j.UcbkToPostCode.ToString()!)))
            .Where(j => q.Search == null
                       || (j.UcbkJobNumber  != null && j.UcbkJobNumber.Contains(q.Search))
                       || (j.UcbkContact    != null && j.UcbkContact.Contains(q.Search))
                       || (j.UcbkClientCode != null && j.UcbkClientCode.Contains(q.Search)))
            .Select(j => new JobDto(
                $"tucJobBooking::{j.UcbkId}",
                "tucJobBooking",
                j.UcbkJobNumber,
                j.UcbkContact,
                j.UcbkDate,
                j.UcbkTime != null ? TimeOnly.FromDateTime(j.UcbkTime.Value) : null,
                null,
                null,
                j.UcbkFromAddr,
                j.UcbkToAddr,
                null,
                null,
                j.UcbkFromPostCode,
                j.UcbkToPostCode,
                j.UcbkFromLat,
                j.UcbkFromLng,
                j.UcbkToLat,
                j.UcbkToLng,
                null,
                null,
                j.UcbkIsPickup ?? false,
                null,
                null,
                null
            ))
            .ToListAsync(ct);

        var all = bulk.Concat(tucJob).Concat(tucBook).ToList();
        log.LogInformation("GetCandidateJobs returned {Count} jobs (bulk={B}, tucJob={J}, tucBook={K})",
            all.Count, bulk.Count, tucJob.Count, tucBook.Count);
        return all;
    }

    public async Task<JobDto?> GetByIdAsync(string source, string id, CancellationToken ct = default)
    {
        if (!int.TryParse(id, out var intId)) return null;
        var single = await GetCandidateJobsAsync(new JobQuery(null, null, [source], null, null, null, null), ct);
        return single.FirstOrDefault(j => j.Id == $"{source}::{intId}");
    }

    public async Task<List<(string ReadyAt, int Count)>> GetGroupsByReadyTimeAsync(DateTime date, bool? pickupsOnly, CancellationToken ct = default)
    {
        var jobs = await GetCandidateJobsAsync(new JobQuery(date, null, null, pickupsOnly, null, null, null), ct);
        return jobs
            .GroupBy(j => j.ReadyAt?.ToString("HH:mm") ?? "—")
            .Select(g => (g.Key, g.Count()))
            .OrderBy(g => g.Key)
            .ToList();
    }
}
