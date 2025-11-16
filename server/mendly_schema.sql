/* ===== Schema: Mendly Core ===== */

-- 0) Safety: create schema if needed
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dbo') EXEC('CREATE SCHEMA dbo');

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

------------------------------------------------------------
-- 1) Users
------------------------------------------------------------
IF OBJECT_ID('dbo.Users','U') IS NOT NULL DROP TABLE dbo.Users;
CREATE TABLE dbo.Users (
    user_id        UNIQUEIDENTIFIER    NOT NULL CONSTRAINT PK_Users PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    Username       NVARCHAR(120)       NOT NULL UNIQUE,
    Email          NVARCHAR(255)       NOT NULL UNIQUE,
    Password       NVARCHAR(256)       NOT NULL,
    Age            SMALLINT            NULL CHECK (Age IS NULL OR (Age BETWEEN 10 AND 120)),
    Gender         TINYINT             NULL CHECK (Gender IN (0,1,2,3)), -- 0=NA,1=F,2=M,3=Other
    is_admin       BIT                 NOT NULL CONSTRAINT DF_Users_IsAdmin DEFAULT (0),  -- <— added
    is_deleted     BIT                 NOT NULL CONSTRAINT DF_Users_IsDeleted DEFAULT (0),
    created_at     DATETIMEOFFSET      NOT NULL CONSTRAINT DF_Users_Created DEFAULT SYSDATETIMEOFFSET(),
    updated_at     DATETIMEOFFSET      NOT NULL CONSTRAINT DF_Users_Updated DEFAULT SYSDATETIMEOFFSET()
);

------------------------------------------------------------
-- 2) UserSettings  (1–1 مع المستخدم)
------------------------------------------------------------
IF OBJECT_ID('dbo.UserSettings','U') IS NOT NULL DROP TABLE dbo.UserSettings;
CREATE TABLE dbo.UserSettings (
    user_id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_UserSettings PRIMARY KEY
                                 CONSTRAINT FK_UserSettings_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    checkin_frequency           TINYINT          NOT NULL CONSTRAINT DF_UserSettings_Freq DEFAULT (3) CHECK (checkin_frequency IN (1,2,3)),
    motivation_enabled          BIT              NOT NULL CONSTRAINT DF_UserSettings_Motivation DEFAULT (1),
    created_at                  DATETIMEOFFSET   NOT NULL CONSTRAINT DF_UserSettings_Created DEFAULT SYSDATETIMEOFFSET(),
    updated_at                  DATETIMEOFFSET   NOT NULL CONSTRAINT DF_UserSettings_Updated DEFAULT SYSDATETIMEOFFSET()
);

------------------------------------------------------------
-- 3) UserDeviceTokens  (جديد موصى به لـ FCM)
------------------------------------------------------------
IF OBJECT_ID('dbo.UserDeviceTokens','U') IS NOT NULL DROP TABLE dbo.UserDeviceTokens;
CREATE TABLE dbo.UserDeviceTokens (
    token_id        UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_UserDeviceTokens PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_UserDeviceTokens_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    platform        NVARCHAR(20)     NOT NULL CHECK (platform IN (N'android',N'ios')),
    fcm_token       NVARCHAR(512)    NOT NULL UNIQUE,
    app_version     NVARCHAR(20)     NULL,
    last_seen       DATETIMEOFFSET   NOT NULL CONSTRAINT DF_UserDeviceTokens_LastSeen DEFAULT SYSDATETIMEOFFSET(),
    is_active       BIT              NOT NULL CONSTRAINT DF_UserDeviceTokens_Active DEFAULT (1)
);
CREATE INDEX IX_UserDeviceTokens_User ON dbo.UserDeviceTokens(user_id, is_active);

------------------------------------------------------------
-- 4) CheckinSchedule
------------------------------------------------------------
IF OBJECT_ID('dbo.CheckinSchedule','U') IS NOT NULL DROP TABLE dbo.CheckinSchedule;
CREATE TABLE dbo.CheckinSchedule (
    schedule_id     UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_CheckinSchedule PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_CheckinSchedule_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    slot_name       NVARCHAR(20)     NOT NULL CHECK (slot_name IN (N'morning',N'noon',N'evening')),
    local_hour      TINYINT          NOT NULL CHECK (local_hour BETWEEN 0 AND 23),
    local_minute    TINYINT          NOT NULL CHECK (local_minute BETWEEN 0 AND 59),
    enabled         BIT              NOT NULL CONSTRAINT DF_CheckinSchedule_Enabled DEFAULT (1),
    created_at      DATETIMEOFFSET   NOT NULL CONSTRAINT DF_CheckinSchedule_Created DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET   NOT NULL CONSTRAINT DF_CheckinSchedule_Updated DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT UQ_CheckinSchedule_UserSlot UNIQUE (user_id, slot_name)
);

------------------------------------------------------------
-- 5) MoodEntries
------------------------------------------------------------
IF OBJECT_ID('dbo.MoodEntries','U') IS NOT NULL DROP TABLE dbo.MoodEntries;
CREATE TABLE dbo.MoodEntries (
    mood_id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_MoodEntries PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id             UNIQUEIDENTIFIER NOT NULL
                          CONSTRAINT FK_MoodEntries_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    checkin_slot        NVARCHAR(20)     NULL CHECK (checkin_slot IS NULL OR checkin_slot IN (N'morning',N'noon',N'evening')),
    score               TINYINT          NOT NULL CHECK (score BETWEEN 0 AND 10),
    label               NVARCHAR(40)     NULL,
    text_note_encrypted VARBINARY(MAX)   NULL,
    emojis_json         NVARCHAR(MAX)    NULL,
    captured_at         DATETIMEOFFSET   NOT NULL,
    created_at          DATETIMEOFFSET   NOT NULL CONSTRAINT DF_MoodEntries_Created DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX IX_MoodEntries_User_Time ON dbo.MoodEntries(user_id, captured_at DESC);

------------------------------------------------------------
-- 6) Recommendations
------------------------------------------------------------
IF OBJECT_ID('dbo.Recommendations','U') IS NOT NULL DROP TABLE dbo.Recommendations;
CREATE TABLE dbo.Recommendations (
    rec_id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Recommendations PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_Recommendations_Users FOREIGN KEY REFERENCES dbo.Users(user_id),
    mood_id         UNIQUEIDENTIFIER NULL
                      CONSTRAINT FK_Recommendations_MoodEntries FOREIGN KEY REFERENCES dbo.MoodEntries(mood_id) ON DELETE SET NULL,
    rec_type        NVARCHAR(40)     NOT NULL,
    title           NVARCHAR(200)    NOT NULL,
    body            NVARCHAR(MAX)    NOT NULL,
    lang            CHAR(2)          NOT NULL CONSTRAINT DF_Recommendations_Lang DEFAULT ('en') CHECK (lang IN ('ar','he','en')),
    user_action     NVARCHAR(20)     NULL CHECK (user_action IN (N'opened',N'saved',N'dismissed',N'completed')),
    shown_at        DATETIMEOFFSET   NULL,  -- إن رغبتِ بتوثيق وقت العرض
    created_at      DATETIMEOFFSET   NOT NULL CONSTRAINT DF_Recommendations_Created DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX IX_Recommendations_User_Created ON dbo.Recommendations(user_id, created_at DESC);

------------------------------------------------------------
-- 7) MotivationalContent
------------------------------------------------------------
IF OBJECT_ID('dbo.MotivationalContent','U') IS NOT NULL DROP TABLE dbo.MotivationalContent;
CREATE TABLE dbo.MotivationalContent (
    content_id      UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_MotivationalContent PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    lang            CHAR(2)          NOT NULL CHECK (lang IN ('ar','he','en')),
    text            NVARCHAR(MAX)    NOT NULL,
    topic           NVARCHAR(40)     NULL,
    is_active       BIT              NOT NULL CONSTRAINT DF_MotivationalContent_Active DEFAULT (1)
);
CREATE INDEX IX_MotivationalContent_Lang ON dbo.MotivationalContent(lang, is_active);

------------------------------------------------------------
-- 8) MendsCatalog (موصى به كمصدر توصيات ثابتة)
------------------------------------------------------------
IF OBJECT_ID('dbo.MendsCatalog','U') IS NOT NULL DROP TABLE dbo.MendsCatalog;
CREATE TABLE dbo.MendsCatalog (
    mend_id     UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_MendsCatalog PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    rec_type    NVARCHAR(40)     NOT NULL,
    title       NVARCHAR(200)    NOT NULL,
    body        NVARCHAR(MAX)    NOT NULL,
    lang        CHAR(2)          NOT NULL CHECK (lang IN ('ar','he','en')),
    tags        NVARCHAR(200)    NULL,
    is_active   BIT              NOT NULL CONSTRAINT DF_MendsCatalog_Active DEFAULT (1)
);

------------------------------------------------------------
-- 9) AuditLogs
------------------------------------------------------------
IF OBJECT_ID('dbo.AuditLogs','U') IS NOT NULL DROP TABLE dbo.AuditLogs;
CREATE TABLE dbo.AuditLogs (
    audit_id    BIGINT           NOT NULL IDENTITY(1,1) CONSTRAINT PK_AuditLogs PRIMARY KEY,
    user_id     UNIQUEIDENTIFIER NULL
                   CONSTRAINT FK_AuditLogs_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE SET NULL,
    actor       NVARCHAR(40)     NOT NULL,  -- system/api/user
    action      NVARCHAR(80)     NOT NULL,
    resource    NVARCHAR(120)    NULL,
    ts          DATETIMEOFFSET   NOT NULL CONSTRAINT DF_AuditLogs_Ts DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX IX_AuditLogs_User_Ts ON dbo.AuditLogs(user_id, ts DESC);

------------------------------------------------------------
-- 10) NotificationQueue
------------------------------------------------------------
IF OBJECT_ID('dbo.NotificationQueue','U') IS NOT NULL DROP TABLE dbo.NotificationQueue;
CREATE TABLE dbo.NotificationQueue (
    job_id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_NotificationQueue PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_NotificationQueue_Users FOREIGN KEY REFERENCES dbo.Users(user_id),
    token_id        UNIQUEIDENTIFIER NULL
                      CONSTRAINT FK_NotificationQueue_Device FOREIGN KEY REFERENCES dbo.UserDeviceTokens(token_id) ON DELETE SET NULL,
    purpose         NVARCHAR(40)     NOT NULL CHECK (purpose IN (N'checkin_reminder',N'tip',N'weekly_summary')),
    payload_json    NVARCHAR(MAX)    NOT NULL,
    scheduled_at    DATETIMEOFFSET   NOT NULL,
    sent_at         DATETIMEOFFSET   NULL,
    status          NVARCHAR(20)     NOT NULL CONSTRAINT DF_NotificationQueue_Status DEFAULT (N'pending')
                       CHECK (status IN (N'pending',N'sent',N'failed')),
    error           NVARCHAR(500)    NULL
);
CREATE INDEX IX_NotificationQueue_Status_Sched ON dbo.NotificationQueue(status, scheduled_at);

------------------------------------------------------------
-- 11) AdherenceStats
------------------------------------------------------------
IF OBJECT_ID('dbo.AdherenceStats','U') IS NOT NULL DROP TABLE dbo.AdherenceStats;
CREATE TABLE dbo.AdherenceStats (
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT PK_AdherenceStats PRIMARY KEY
                      CONSTRAINT FK_AdherenceStats_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    streak_days     INT              NOT NULL CONSTRAINT DF_AdherenceStats_Streak DEFAULT (0),
    last_checkin_at DATETIMEOFFSET   NULL,
    avg_7d          DECIMAL(4,2)     NULL,
    avg_14d         DECIMAL(4,2)     NULL,
    avg_30d         DECIMAL(4,2)     NULL,
    updated_at      DATETIMEOFFSET   NOT NULL CONSTRAINT DF_AdherenceStats_Updated DEFAULT SYSDATETIMEOFFSET()
);

------------------------------------------------------------
-- 12) Exports
------------------------------------------------------------
IF OBJECT_ID('dbo.Exports','U') IS NOT NULL DROP TABLE dbo.Exports;
CREATE TABLE dbo.Exports (
    export_id       UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Exports PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_Exports_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    format          NVARCHAR(20)     NOT NULL CHECK (format IN (N'pdf',N'csv',N'json')),
    presigned_url   NVARCHAR(512)    NULL,
    status          NVARCHAR(20)     NOT NULL CHECK (status IN (N'requested',N'ready',N'expired')),
    requested_at    DATETIMEOFFSET   NOT NULL,
    ready_at        DATETIMEOFFSET   NULL,
    expires_at      DATETIMEOFFSET   NULL
);
CREATE INDEX IX_Exports_User_Status ON dbo.Exports(user_id, status);

------------------------------------------------------------
-- 13) Consents  (موصى به)
------------------------------------------------------------
IF OBJECT_ID('dbo.Consents','U') IS NOT NULL DROP TABLE dbo.Consents;
CREATE TABLE dbo.Consents (
    consent_id      UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Consents PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_Consents_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    policy_version  NVARCHAR(20)     NOT NULL,
    granted         BIT              NOT NULL,
    granted_at      DATETIMEOFFSET   NOT NULL,
    CONSTRAINT UQ_Consents_UserVersion UNIQUE (user_id, policy_version)
);

------------------------------------------------------------
-- 14) DataDeletionRequests  (موصى به)
------------------------------------------------------------
IF OBJECT_ID('dbo.DataDeletionRequests','U') IS NOT NULL DROP TABLE dbo.DataDeletionRequests;
CREATE TABLE dbo.DataDeletionRequests (
    request_id      UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_DataDeletionRequests PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NOT NULL
                      CONSTRAINT FK_DataDeletionRequests_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE CASCADE,
    status          NVARCHAR(20)     NOT NULL CHECK (status IN (N'open',N'processing',N'done')),
    requested_at    DATETIMEOFFSET   NOT NULL,
    processed_at    DATETIMEOFFSET   NULL,
    notes           NVARCHAR(MAX)    NULL
);
CREATE INDEX IX_DataDeletionRequests_Status ON dbo.DataDeletionRequests(status, requested_at);

------------------------------------------------------------
-- 15) AIInteractions  (موصى به)
------------------------------------------------------------
IF OBJECT_ID('dbo.AIInteractions','U') IS NOT NULL DROP TABLE dbo.AIInteractions;
CREATE TABLE dbo.AIInteractions (
    ai_id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AIInteractions PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id         UNIQUEIDENTIFIER NULL
                      CONSTRAINT FK_AIInteractions_Users FOREIGN KEY REFERENCES dbo.Users(user_id),
    mood_id         UNIQUEIDENTIFIER NULL
                      CONSTRAINT FK_AIInteractions_MoodEntries FOREIGN KEY REFERENCES dbo.MoodEntries(mood_id) ON DELETE SET NULL,
    purpose         NVARCHAR(40)     NOT NULL CHECK (purpose IN (N'recommendation',N'summary')),
    prompt_hash     VARBINARY(32)    NULL,  -- بدلاً من تخزين نص الحسّاس
    input_refs_json NVARCHAR(MAX)    NULL,  -- IDs بدل نصوص
    output_text     NVARCHAR(MAX)    NOT NULL,
    created_at      DATETIMEOFFSET   NOT NULL CONSTRAINT DF_AIInteractions_Created DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX IX_AIInteractions_User_Time ON dbo.AIInteractions(user_id, created_at DESC);

------------------------------------------------------------
-- 16) Feedback  (موصى به)
------------------------------------------------------------
IF OBJECT_ID('dbo.Feedback','U') IS NOT NULL DROP TABLE dbo.Feedback;
CREATE TABLE dbo.Feedback (
    fb_id       UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Feedback PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    user_id     UNIQUEIDENTIFIER NULL
                  CONSTRAINT FK_Feedback_Users FOREIGN KEY REFERENCES dbo.Users(user_id) ON DELETE SET NULL,
    kind        NVARCHAR(30)     NOT NULL CHECK (kind IN (N'bug',N'ux',N'idea')),
    text        NVARCHAR(MAX)    NOT NULL,
    created_at  DATETIMEOFFSET   NOT NULL CONSTRAINT DF_Feedback_Created DEFAULT SYSDATETIMEOFFSET()
);
CREATE INDEX IX_Feedback_User_Time ON dbo.Feedback(user_id, created_at DESC);



/* ===== Seed: Admin User (safe to re-run) ===== */
BEGIN TRY
    BEGIN TRAN;

    -- bcrypt hash for "admin123"
    DECLARE @adminHash NVARCHAR(256) = N'$2b$10$LiqjcT47bk/ycccIoDAOeeoTS8Eko2PTmGK21Bpsa./tLggkeb6U6';

    -- Insert admin if missing; capture the generated user_id (GUID)
    DECLARE @ins TABLE (user_id UNIQUEIDENTIFIER);

    IF NOT EXISTS (
        SELECT 1 FROM dbo.Users
        WHERE Username = N'admin' OR Email = N'admin@gmail.com'
    )
    BEGIN
        INSERT INTO dbo.Users (Username, Email, Password, Age, Gender, is_admin)
        OUTPUT inserted.user_id INTO @ins
        VALUES (N'admin', N'admin@gmail.com', @adminHash, 22, 2, 1); -- Gender=2 (male), is_admin=1
    END
    ELSE
    BEGIN
        -- ensure existing admin account is marked as admin
        UPDATE dbo.Users
        SET is_admin = 1,
            updated_at = SYSDATETIMEOFFSET()
        WHERE (Username = N'admin' OR Email = N'admin@gmail.com') AND is_admin = 0;
    END

    DECLARE @adminId UNIQUEIDENTIFIER =
        COALESCE(
            (SELECT TOP 1 user_id FROM @ins),
            (SELECT TOP 1 user_id FROM dbo.Users WHERE Username = N'admin' OR Email = N'admin@gmail.com')
        );

    -- Optional: ensure a UserSettings row exists for admin (uses defaults)
    IF @adminId IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.UserSettings WHERE user_id = @adminId)
    BEGIN
        INSERT INTO dbo.UserSettings (user_id) VALUES (@adminId);
    END

    -- Optional: log the seed
    IF @adminId IS NOT NULL
    BEGIN
        INSERT INTO dbo.AuditLogs (user_id, actor, action, resource)
        VALUES (@adminId, N'system', N'seed', N'Users.admin');
    END

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
