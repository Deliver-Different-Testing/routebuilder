-- ============================================================================
-- 20260614_003 — Create shadow quote tables (Quoting feature)
-- Run order: 3 of 3
-- ============================================================================

PRINT 'Migration 20260614_003 — quote shadow tables';

IF OBJECT_ID('dbo.tblQuoteRun', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblQuoteRun (
        QuoteRunId       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        QuoteSetCode     NVARCHAR(60)     NOT NULL,
        Name             NVARCHAR(120)    NULL,
        JobCount         INT              NOT NULL DEFAULT 0,
        EstimatedMins    INT              NOT NULL DEFAULT 0,
        EstimatedKm      FLOAT            NOT NULL DEFAULT 0,
        ProjectedRevenue DECIMAL(12,2)    NOT NULL DEFAULT 0,
        ProjectedCost    DECIMAL(12,2)    NOT NULL DEFAULT 0,
        RecommendedQuote DECIMAL(12,2)    NOT NULL DEFAULT 0,
        DriversRequired  INT              NOT NULL DEFAULT 1,
        CreatedUtc       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        INDEX IX_tblQuoteRun_Set (QuoteSetCode)
    );
    PRINT '  + tblQuoteRun';
END

IF OBJECT_ID('dbo.tblQuoteJob', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblQuoteJob (
        QuoteJobId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        QuoteSetCode  NVARCHAR(60)     NOT NULL,
        QuoteRunId    INT              NULL,
        Customer      NVARCHAR(200)    NULL,
        FromAddress   NVARCHAR(400)    NULL,
        ToAddress     NVARCHAR(400)    NULL,
        FromPostCode  INT              NULL,
        ToPostCode    INT              NULL,
        WeightKg      DECIMAL(8,2)     NULL,
        WindowStart   TIME             NULL,
        WindowEnd     TIME             NULL,
        IsPickup      BIT              NOT NULL DEFAULT 0,
        CreatedUtc    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_tblQuoteJob_Run FOREIGN KEY (QuoteRunId)
            REFERENCES dbo.tblQuoteRun(QuoteRunId) ON DELETE CASCADE,
        INDEX IX_tblQuoteJob_Run (QuoteRunId),
        INDEX IX_tblQuoteJob_SetZip (QuoteSetCode, FromPostCode)
    );
    PRINT '  + tblQuoteJob';
END

PRINT 'Migration 20260614_003 complete.';
GO
