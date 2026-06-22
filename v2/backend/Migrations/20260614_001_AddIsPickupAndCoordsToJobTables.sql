-- ============================================================================
-- 20260614_001 — Add IsPickup flag + lat/lng coordinates to existing job tables
-- Run order: 1 of 3
-- Target: per-tenant Despatch database (single deployment per tenant)
-- Notes: idempotent — guarded with IF NOT EXISTS / IF COL_LENGTH IS NULL
-- ============================================================================

PRINT 'Migration 20260614_001 — IsPickup + lat/lng on existing job tables';

-- ─── tblBulkJob ──────────────────────────────────────────────────────────────
IF COL_LENGTH('dbo.tblBulkJob', 'IsPickup') IS NULL
BEGIN
    ALTER TABLE dbo.tblBulkJob ADD IsPickup BIT NULL;
    PRINT '  + tblBulkJob.IsPickup';
END

IF COL_LENGTH('dbo.tblBulkJob', 'FromLat') IS NULL
BEGIN
    ALTER TABLE dbo.tblBulkJob ADD FromLat FLOAT NULL, FromLng FLOAT NULL, ToLat FLOAT NULL, ToLng FLOAT NULL;
    PRINT '  + tblBulkJob.From/To Lat/Lng';
END

-- ─── tucJob ──────────────────────────────────────────────────────────────────
IF COL_LENGTH('dbo.tucJob', 'UcjbIsPickup') IS NULL
BEGIN
    ALTER TABLE dbo.tucJob ADD UcjbIsPickup BIT NULL;
    PRINT '  + tucJob.UcjbIsPickup';
END

IF COL_LENGTH('dbo.tucJob', 'UcjbFromLat') IS NULL
BEGIN
    ALTER TABLE dbo.tucJob ADD UcjbFromLat FLOAT NULL, UcjbFromLng FLOAT NULL, UcjbToLat FLOAT NULL, UcjbToLng FLOAT NULL;
    PRINT '  + tucJob.From/To Lat/Lng';
END

IF COL_LENGTH('dbo.tucJob', 'UcjbFromPostCode') IS NULL
BEGIN
    ALTER TABLE dbo.tucJob ADD UcjbFromPostCode INT NULL, UcjbToPostCode INT NULL;
    PRINT '  + tucJob.From/To PostCode';
END

-- ─── tucJobBooking ───────────────────────────────────────────────────────────
IF COL_LENGTH('dbo.tucJobBooking', 'UcbkIsPickup') IS NULL
BEGIN
    ALTER TABLE dbo.tucJobBooking ADD UcbkIsPickup BIT NULL;
    PRINT '  + tucJobBooking.UcbkIsPickup';
END

IF COL_LENGTH('dbo.tucJobBooking', 'UcbkFromLat') IS NULL
BEGIN
    ALTER TABLE dbo.tucJobBooking ADD UcbkFromLat FLOAT NULL, UcbkFromLng FLOAT NULL, UcbkToLat FLOAT NULL, UcbkToLng FLOAT NULL;
    PRINT '  + tucJobBooking.From/To Lat/Lng';
END

IF COL_LENGTH('dbo.tucJobBooking', 'UcbkFromPostCode') IS NULL
BEGIN
    ALTER TABLE dbo.tucJobBooking ADD UcbkFromPostCode INT NULL, UcbkToPostCode INT NULL;
    PRINT '  + tucJobBooking.From/To PostCode';
END

-- ─── tblBulkRun: add RecurringRouteId + IsPickupRun ──────────────────────────
IF COL_LENGTH('dbo.tblBulkRun', 'RecurringRouteId') IS NULL
BEGIN
    ALTER TABLE dbo.tblBulkRun ADD RecurringRouteId INT NULL, IsPickupRun BIT NULL;
    PRINT '  + tblBulkRun.RecurringRouteId + IsPickupRun';
END

-- ─── tblBulkRunSetting: ensure new columns exist (mockup Settings drawer) ────
IF OBJECT_ID('dbo.tblBulkRunSetting', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.tblBulkRunSetting', 'VehicleType') IS NULL
    BEGIN
        ALTER TABLE dbo.tblBulkRunSetting ADD
            VehicleType NVARCHAR(40) NULL,
            AveragePackageSizeM3 DECIMAL(6,2) NULL,
            TimeWindowMinutes INT NULL,
            MaxJobsPerRoute INT NULL,
            MaxKmPerRoute INT NULL,
            ReturnToDepot BIT NULL,
            RespectColdChain BIT NULL,
            OptimiseStopOrder BIT NULL,
            TightPack BIT NULL,
            IncludePickupLeg BIT NULL,
            LastModified DATETIME2 NULL;
        PRINT '  + tblBulkRunSetting cockpit-settings columns';
    END
END

PRINT 'Migration 20260614_001 complete.';
GO
