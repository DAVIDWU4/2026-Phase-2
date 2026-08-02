using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace backend.UnitTests;

public class CoreBusinessTests
{
    [Fact]
    public async Task BadgeSeedData_ShouldLoadFifteenBadges()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();

        // Act
        var badges = await db.Badges.ToListAsync();

        // Assert
        Assert.Equal(15, badges.Count);
    }

    [Fact]
    public async Task SubmitStudyRecord_AddsScoreEntryAndUpdatesUserTotalScore()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new StudyGameService(db);

        var user = new User
        {
            Username = "UnitTestUser",
            Email = "unittest@example.com",
            PasswordHash = "hashedpass",
            TotalScore = 0
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        const int durationMinutes = 60;
        const int expectedPoints = durationMinutes / 10;
        var record = new StudyRecord
        {
            UserId = user.Id,
            Subject = ".NET Testing",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = durationMinutes
        };

        // Act: Call official implemented service method from your backend project
        await service.SubmitStudyRecordAsync(record);

        // Assert
        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.Equal(expectedPoints, updatedUser!.TotalScore);
        Assert.Equal(expectedPoints, record.EarnedScore);

        var scoreEntries = await db.Scores.Where(s => s.UserId == user.Id).ToListAsync();
        Assert.Single(scoreEntries);
        Assert.Equal(expectedPoints, scoreEntries[0].Amount);
    }

    [Fact]
    public async Task UserReachesScoreTarget_UnlockNewBadge_NoDuplicateUnlock()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new StudyGameService(db);

        var user = new User
        {
            Username = "BadgeTester",
            Email = "badge@test.com",
            PasswordHash = "passhash",
            TotalScore = 96
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Act: 40 minutes = 4 points, reaches 100 total and unlocks Rising Star
        var record = new StudyRecord
        {
            UserId = user.Id,
            Subject = "Badge Test",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = 40
        };
        await service.SubmitStudyRecordAsync(record);

        // Submit a second session to trigger duplicate check logic
        var secondRecord = new StudyRecord
        {
            UserId = user.Id,
            Subject = "Badge Test Again",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = 40
        };
        await service.SubmitStudyRecordAsync(secondRecord);

        // Assert: User total score increased twice (4 + 4)
        var targetUser = await db.Users.FindAsync(user.Id);
        Assert.Equal(104, targetUser!.TotalScore);

        // Assert: Only one "Rising Star" badge unlocked (duplicate blocked)
        var targetBadge = await db.Badges.FirstAsync(b => b.Name == "Rising Star");
        var ownedBadges = await db.UserBadges
            .Where(ub => ub.UserId == user.Id && ub.BadgeId == targetBadge.Id)
            .ToListAsync();

        Assert.Single(ownedBadges);
    }

    [Fact]
    public async Task User_CompleteCRUDOperations_Succeeds()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();
        var newUser = new User
        {
            Username = "CrudTestUser",
            Email = "crud@test.com",
            PasswordHash = "securehash",
            TotalScore = 0
        };

        // Create
        db.Users.Add(newUser);
        await db.SaveChangesAsync();
        var createdId = newUser.Id;

        // Read
        var readUser = await db.Users.FindAsync(createdId);
        Assert.NotNull(readUser);
        Assert.Equal("CrudTestUser", readUser.Username);

        // Update
        readUser.Username = "UpdatedCrudUser";
        readUser.TotalScore = 200;
        db.Users.Update(readUser);
        await db.SaveChangesAsync();

        var updatedUser = await db.Users.FindAsync(createdId);
        Assert.Equal("UpdatedCrudUser", updatedUser!.Username);
        Assert.Equal(200, updatedUser.TotalScore);

        // Delete
        db.Users.Remove(updatedUser);
        await db.SaveChangesAsync();

        var deletedCheck = await db.Users.FindAsync(createdId);
        Assert.Null(deletedCheck);
    }
    [Fact]
    public async Task Badge_CompleteCRUDOperations_Succeeds()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();
        var newBadge = new Badge
        {
            Name = "Test Badge",
            Description = "Unit test badge",
            RequiredScore = 500
        };

        // Create
        db.Badges.Add(newBadge);
        await db.SaveChangesAsync();
        var createdId = newBadge.Id;

        // Read
        var readBadge = await db.Badges.FindAsync(createdId);
        Assert.NotNull(readBadge);
        Assert.Equal("Test Badge", readBadge.Name);

        // Update
        readBadge.Name = "Updated Badge";
        readBadge.RequiredScore = 600;
        db.Badges.Update(readBadge);
        await db.SaveChangesAsync();

        var updatedBadge = await db.Badges.FindAsync(createdId);
        Assert.Equal("Updated Badge", updatedBadge!.Name);
        Assert.Equal(600, updatedBadge.RequiredScore);

        // Delete
        db.Badges.Remove(updatedBadge);
        await db.SaveChangesAsync();

        var deletedCheck = await db.Badges.FindAsync(createdId);
        Assert.Null(deletedCheck);
    }
    [Fact]
    public async Task ScoreEntry_CompleteCRUDOperations_Succeeds()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();

        var user = new User
        {
            Username = "ScoreTestUser",
            Email = "score@test.com",
            PasswordHash = "hash",
            TotalScore = 0
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var entry = new ScoreEntry
        {
            UserId = user.Id,
            Amount = 200,
            CreatedAt = DateTime.UtcNow,
            Reason = "Test reward"
        };

        // Create
        db.Scores.Add(entry);
        await db.SaveChangesAsync();
        var entryId = entry.Id;

        // Read
        var readEntry = await db.Scores.FindAsync(entryId);
        Assert.NotNull(readEntry);
        Assert.Equal(200, readEntry.Amount);

        // Update
        readEntry.Amount = 250;
        readEntry.Reason = "Updated reward";
        db.Scores.Update(readEntry);
        await db.SaveChangesAsync();

        var updatedEntry = await db.Scores.FindAsync(entryId);
        Assert.Equal(250, updatedEntry!.Amount);

        // Delete
        db.Scores.Remove(updatedEntry);
        await db.SaveChangesAsync();

        var deletedCheck = await db.Scores.FindAsync(entryId);
        Assert.Null(deletedCheck);
    }
    [Fact]
    public async Task StudyRecord_ServiceCRUD_Succeeds()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new StudyGameService(db);

        var user = new User
        {
            Username = "CRUDUser",
            Email = "crudstudy@test.com",
            PasswordHash = "pass",
            TotalScore = 0
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var record = new StudyRecord
        {
            UserId = user.Id,
            Subject = "Initial Subject",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = 30
        };

        // Create via service business method
        var saved = await service.SubmitStudyRecordAsync(record);
        var recordId = saved.Id;

        // Read
        var fetched = await service.GetStudyRecordByIdAsync(recordId);
        Assert.NotNull(fetched);
        Assert.Equal("Initial Subject", fetched.Subject);

        // Update
        fetched.Subject = "Updated Subject";
        bool updateResult = await service.UpdateStudyRecordAsync(recordId, fetched);
        Assert.True(updateResult);

        var afterUpdate = await service.GetStudyRecordByIdAsync(recordId);
        Assert.Equal("Updated Subject", afterUpdate!.Subject);

        // Delete
        bool deleteResult = await service.DeleteStudyRecordAsync(recordId);
        Assert.True(deleteResult);

        var afterDelete = await service.GetStudyRecordByIdAsync(recordId);
        Assert.Null(afterDelete);
    }
    [Fact]
    public async Task UserBadge_CompleteCRUDOperations_Succeeds()
    {
        // Arrange
        using var db = TestDbFactory.CreateCleanDbContext();

        // Create dependent user and badge first
        var user = new User
        {
            Username = "UserBadgeTester",
            Email = "userbadge@test.com",
            PasswordHash = "testhash",
            TotalScore = 100
        };
        db.Users.Add(user);

        var badge = new Badge
        {
            Name = "Test Achievement",
            Description = "Test badge entity",
            RequiredScore = 50
        };
        db.Badges.Add(badge);
        await db.SaveChangesAsync();

        var userBadge = new UserBadge
        {
            UserId = user.Id,
            BadgeId = badge.Id,
            UnlockedAt = DateTime.UtcNow
        };

        // Create
        db.UserBadges.Add(userBadge);
        await db.SaveChangesAsync();

        // Read — use composite key instead of single Id
        var fetchedUserBadge = await db.UserBadges
            .FirstOrDefaultAsync(ub => ub.UserId == user.Id && ub.BadgeId == badge.Id);
        
        Assert.NotNull(fetchedUserBadge);
        Assert.Equal(user.Id, fetchedUserBadge.UserId);
        Assert.Equal(badge.Id, fetchedUserBadge.BadgeId);

        // Update (modify unlock timestamp)
        fetchedUserBadge.UnlockedAt = new DateTime(2026, 1, 1);
        db.UserBadges.Update(fetchedUserBadge);
        await db.SaveChangesAsync();

        var updatedUserBadge = await db.UserBadges
            .FirstOrDefaultAsync(ub => ub.UserId == user.Id && ub.BadgeId == badge.Id);
        
        Assert.Equal(new DateTime(2026, 1, 1), updatedUserBadge!.UnlockedAt);

        // Delete
        db.UserBadges.Remove(updatedUserBadge);
        await db.SaveChangesAsync();

        var deletedCheck = await db.UserBadges
            .FirstOrDefaultAsync(ub => ub.UserId == user.Id && ub.BadgeId == badge.Id);
        
        Assert.Null(deletedCheck);
    }

    [Fact]
    public async Task CheckinRecord_DoesNotUnlockSpecialBadges()
    {
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new StudyGameService(db);

        var user = new User
        {
            Username = "CheckinUser",
            Email = "checkin@test.com",
            PasswordHash = "hash",
            TotalScore = 0
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        await service.SubmitStudyRecordAsync(new StudyRecord
        {
            UserId = user.Id,
            Subject = "Math",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = 1,
            Notes = StudyGameService.CheckinNote
        });

        var unlocked = await db.UserBadges.Where(ub => ub.UserId == user.Id).ToListAsync();
        Assert.Empty(unlocked);
    }

    [Fact]
    public async Task ThirtyMinutes_DoesNotUnlockHourStarterBadge()
    {
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new StudyGameService(db);

        var user = new User
        {
            Username = "TimeUser",
            Email = "time@test.com",
            PasswordHash = "hash",
            TotalScore = 0
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        await service.SubmitStudyRecordAsync(new StudyRecord
        {
            UserId = user.Id,
            Subject = "Physics",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = 30
        });

        var hourBadge = await db.Badges.FirstAsync(b => b.Id == 10);
        var hasHourBadge = await db.UserBadges
            .AnyAsync(ub => ub.UserId == user.Id && ub.BadgeId == hourBadge.Id);
        Assert.False(hasHourBadge);
    }

    [Fact]
    public async Task DeleteStudyRecord_RevokesScoreBadge()
    {
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new StudyGameService(db);

        var user = new User
        {
            Username = "RevokeUser",
            Email = "revoke@test.com",
            PasswordHash = "hash",
            TotalScore = 96
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var record = await service.SubmitStudyRecordAsync(new StudyRecord
        {
            UserId = user.Id,
            Subject = "Revoke Test",
            StudyDate = DateTime.UtcNow,
            DurationMinutes = 40
        });

        var risingStar = await db.Badges.FirstAsync(b => b.Name == "Rising Star");
        Assert.True(await db.UserBadges.AnyAsync(ub => ub.UserId == user.Id && ub.BadgeId == risingStar.Id));

        await service.DeleteStudyRecordAsync(record.Id);

        Assert.False(await db.UserBadges.AnyAsync(ub => ub.UserId == user.Id && ub.BadgeId == risingStar.Id));
        var updatedUser = await db.Users.FindAsync(user.Id);
        Assert.Equal(96, updatedUser!.TotalScore);
    }

    [Fact]
    public async Task PasswordResetToken_ValidateAndConsume()
    {
        using var db = TestDbFactory.CreateCleanDbContext();
        var service = new PasswordResetService(db, new ConfigurationBuilder().Build(), new TestHostEnvironment());

        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            Email = "user@test.com",
            Code = "654321",
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var valid = await service.ValidateResetCodeAsync("user@test.com", "654321");
        Assert.True(valid);
        Assert.Empty(await db.PasswordResetTokens.ToListAsync());
    }

    private sealed class TestHostEnvironment : Microsoft.Extensions.Hosting.IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;
        public string ApplicationName { get; set; } = "Test";
        public string ContentRootPath { get; set; } = Directory.GetCurrentDirectory();
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; }
            = new Microsoft.Extensions.FileProviders.NullFileProvider();
    }
}