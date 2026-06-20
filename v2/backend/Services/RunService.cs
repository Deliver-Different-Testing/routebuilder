using Microsoft.EntityFrameworkCore;
using RouteBuilder.Data;
using RouteBuilder.Dtos;
using RouteBuilder.Entities;

namespace RouteBuilder.Services;

public class RunService(RouteBuilderDbContext db, IJobService jobs, ILogger<RunService> log) : IRunService
{
    public async Task<List<RunDto>> GetRunsAsync(DateTime? date, CancellationToken ct = default)
    {
        var qry = db.TblBulkRuns.AsNoTracking();
        if (date != null) qry = qry.Where(r => r.DespatchDateTime != null && r.DespatchDateTime.Value.Date == date.Value.Date);

        var rows = await qry
            .Select(r => new
            {
                Run = r,
                Jobs = db.TblBulkJobRuns.Count(j => j.BulkRunId == r.Id),
                Courier = db.TucCouriers.Where(c => c.UccrId == r.CourierId).Select(c => c.UccrName).FirstOrDefault(),
            })
            .ToListAsync(ct);

        return rows.Select(x => new RunDto(
            x.Run.Id, x.Run.Name, x.Run.Mins, x.Run.Kms, x.Jobs, x.Run.CourierId, x.Courier, x.Run.Status,
            x.Run.Revenue, x.Run.Payout, x.Run.CourierPercentage, x.Run.Created, x.Run.DespatchDateTime,
            x.Run.RecurringRouteId, x.Run.IsPickupRun
        )).ToList();
    }

    public async Task<RunDetailDto?> GetRunDetailAsync(int runId, CancellationToken ct = default)
    {
        var run = await db.TblBulkRuns.AsNoTracking().FirstOrDefaultAsync(r => r.Id == runId, ct);
        if (run is null) return null;

        var stops = await (
            from jr in db.TblBulkJobRuns
            join j in db.TblBulkJobs on jr.BulkJobId equals j.BulkJobId
            where jr.BulkRunId == runId
            orderby jr.StopOrder
            select new RunJobDto(
                jr.StopOrder,
                "tblBulkJob",
                j.BulkJobId.ToString(),
                j.JobNumber,
                j.FromCompany ?? j.ToCompany,
                j.FromAddress,
                j.ToAddress,
                j.ToSuburb,
                j.ToPostCode,
                j.IsPickup ?? false,
                jr.IsEndPoint
            )).ToListAsync(ct);

        var courier = await db.TucCouriers.Where(c => c.UccrId == run.CourierId).Select(c => c.UccrName).FirstOrDefaultAsync(ct);

        var runDto = new RunDto(
            run.Id, run.Name, run.Mins, run.Kms, stops.Count, run.CourierId, courier, run.Status,
            run.Revenue, run.Payout, run.CourierPercentage, run.Created, run.DespatchDateTime,
            run.RecurringRouteId, run.IsPickupRun
        );
        return new RunDetailDto(runDto, stops);
    }

    public async Task<RunDto> CreateRunAsync(CreateRunRequest req, CancellationToken ct = default)
    {
        var run = new TblBulkRun
        {
            Name = req.Name,
            RecurringRouteId = req.RecurringRouteId,
            IsPickupRun = req.IsPickupRun,
            Created = DateTime.UtcNow,
            DespatchDateTime = DateTime.UtcNow.Date,
            Status = 0,
        };
        db.TblBulkRuns.Add(run);
        await db.SaveChangesAsync(ct);

        var stopOrder = 1;
        foreach (var stop in req.Stops)
        {
            // Phase 1: only attach bulk jobs to runs. tucJob/tucJobBooking attach is Phase 2 work.
            if (stop.Source != "tblBulkJob" || !int.TryParse(stop.Id, out var bulkId)) continue;
            db.TblBulkJobRuns.Add(new TblBulkJobRun
            {
                BulkRunId = run.Id,
                BulkJobId = bulkId,
                StopOrder = stopOrder++,
                IsEndPoint = false
            });
        }
        await db.SaveChangesAsync(ct);

        log.LogInformation("Created run {RunId} ({Name}) with {Stops} stops", run.Id, run.Name, stopOrder - 1);

        return (await GetRunDetailAsync(run.Id, ct))!.Run;
    }

    public async Task<bool> AssignCourierAsync(int runId, int courierId, CancellationToken ct = default)
    {
        var run = await db.TblBulkRuns.FirstOrDefaultAsync(r => r.Id == runId, ct);
        if (run is null) return false;
        run.CourierId = courierId;
        run.LastModified = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> AssignPickupToRunAsync(string pickupSource, string pickupId, int runId, CancellationToken ct = default)
    {
        // TODO Kevin: implement pickup-to-run linkage for tucJob/tucJobBooking pickups.
        //  - tblBulkJobRun currently only supports tblBulkJob FKs.
        //  - Options: (a) materialise the pickup into tblBulkJob via a shim row, or
        //             (b) add a new join table tblBulkPickupRun(BulkRunId, PickupSource, PickupId).
        // Option (b) is cleaner — design with Kevin.
        log.LogWarning("AssignPickupToRun is not implemented yet — Phase 1 stub");
        await Task.CompletedTask;
        return false;
    }

    public async Task<bool> AutoMatchPickupsByZipAsync(DateTime date, CancellationToken ct = default)
    {
        // TODO Kevin: iterate today's pickups, find runs whose deliveries share the same zip,
        // and call AssignPickupToRunAsync on each match. Implement after AssignPickupToRunAsync.
        await Task.CompletedTask;
        return false;
    }
}
