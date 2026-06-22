-- ============================================================================
-- 20260614_002 — Create polygon + scheduled-route tables
-- Run order: 2 of 3
-- ============================================================================

PRINT 'Migration 20260614_002 — polygon + scheduled route tables';

-- ─── tblRecurringRoute ───────────────────────────────────────────────────────
IF OBJECT_ID('dbo.tblRecurringRoute', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblRecurringRoute (
        RecurringRouteId  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Name              NVARCHAR(120)     NOT NULL,
        Frequency         NVARCHAR(80)      NOT NULL,
        TimeWindowStart   TIME              NULL,
        TimeWindowEnd     TIME              NULL,
        AvgJobs           INT               NOT NULL DEFAULT 0,
        ServiceLevel      NVARCHAR(60)      NULL,
        TagLocation       NVARCHAR(120)     NULL,
        ColorHex          NVARCHAR(10)      NULL,
        IsActive          BIT               NOT NULL DEFAULT 1,
        CreatedUtc        DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
        LastBuiltUtc      DATETIME2         NULL,
        INDEX IX_tblRecurringRoute_IsActive (IsActive)
    );
    PRINT '  + tblRecurringRoute';
END

-- ─── tblRecurringRouteZip (many-to-one) ──────────────────────────────────────
IF OBJECT_ID('dbo.tblRecurringRouteZip', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblRecurringRouteZip (
        RecurringRouteZipId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        RecurringRouteId    INT             NOT NULL,
        ZipCode             NVARCHAR(20)    NOT NULL,
        CONSTRAINT FK_tblRecurringRouteZip_Route FOREIGN KEY (RecurringRouteId)
            REFERENCES dbo.tblRecurringRoute(RecurringRouteId) ON DELETE CASCADE,
        CONSTRAINT UQ_tblRecurringRouteZip_RouteZip UNIQUE (RecurringRouteId, ZipCode)
    );
    PRINT '  + tblRecurringRouteZip';
END

-- ─── tblBulkRunPolygon ───────────────────────────────────────────────────────
IF OBJECT_ID('dbo.tblBulkRunPolygon', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblBulkRunPolygon (
        PolygonId         INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Name              NVARCHAR(120)     NOT NULL,
        ColorHex          NVARCHAR(10)      NULL,
        RecurringRouteId  INT               NULL,   -- nullable: a polygon is not necessarily tied to a route
        TagLocation       NVARCHAR(120)     NULL,
        CreatedUtc        DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
        LastModifiedUtc   DATETIME2         NULL,
        CONSTRAINT FK_tblBulkRunPolygon_Route FOREIGN KEY (RecurringRouteId)
            REFERENCES dbo.tblRecurringRoute(RecurringRouteId) ON DELETE SET NULL,
        INDEX IX_tblBulkRunPolygon_Name (Name),
        INDEX IX_tblBulkRunPolygon_Route (RecurringRouteId)
    );
    PRINT '  + tblBulkRunPolygon';
END

-- ─── tblBulkRunPolygonPoint ──────────────────────────────────────────────────
IF OBJECT_ID('dbo.tblBulkRunPolygonPoint', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblBulkRunPolygonPoint (
        PolygonPointId  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PolygonId       INT             NOT NULL,
        OrderIndex      INT             NOT NULL,
        Lat             FLOAT           NOT NULL,
        Lng             FLOAT           NOT NULL,
        CONSTRAINT FK_tblBulkRunPolygonPoint_Polygon FOREIGN KEY (PolygonId)
            REFERENCES dbo.tblBulkRunPolygon(PolygonId) ON DELETE CASCADE,
        INDEX IX_tblBulkRunPolygonPoint_PolygonOrder (PolygonId, OrderIndex)
    );
    PRINT '  + tblBulkRunPolygonPoint';
END

-- ─── FK on tblBulkRun.RecurringRouteId (added by migration 001) ──────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_tblBulkRun_RecurringRoute'
)
BEGIN
    ALTER TABLE dbo.tblBulkRun ADD CONSTRAINT FK_tblBulkRun_RecurringRoute
        FOREIGN KEY (RecurringRouteId) REFERENCES dbo.tblRecurringRoute(RecurringRouteId);
    PRINT '  + FK_tblBulkRun_RecurringRoute';
END

PRINT 'Migration 20260614_002 complete.';
GO
