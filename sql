CREATE PROCEDURE GetOriginalUrlAndUpdateCount
    @shortCode NVARCHAR(50),
    @originalUrl NVARCHAR(2048) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Fetch the original URL and update the access count
        SELECT @originalUrl = originalUrl
        FROM urlshortner
        WHERE shortCode = @shortCode;

        IF @originalUrl IS NOT NULL
        BEGIN
            UPDATE urlshortner
            SET accessCount = accessCount + 1
            WHERE shortCode = @shortCode;

            COMMIT TRANSACTION;
        END
        ELSE
        BEGIN
            ROLLBACK TRANSACTION;
        END
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
