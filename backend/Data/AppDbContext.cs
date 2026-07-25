using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ScoreEntry> Scores { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Badge> Badges { get; set; }
    public DbSet<StudyRecord> StudyRecords { get; set; }
    public DbSet<UserBadge> UserBadges { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserBadge>()
            .HasKey(ub => new { ub.UserId, ub.BadgeId });

        modelBuilder.Entity<UserBadge>()
            .HasOne(ub => ub.User)
            .WithMany(u => u.UserBadges)
            .HasForeignKey(ub => ub.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserBadge>()
            .HasOne(ub => ub.Badge)
            .WithMany(b => b.UserBadges)
            .HasForeignKey(ub => ub.BadgeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudyRecord>()
            .HasOne(sr => sr.User)
            .WithMany(u => u.StudyRecords)
            .HasForeignKey(sr => sr.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScoreEntry>()
            .HasOne(se => se.User)
            .WithMany(u => u.Scores)
            .HasForeignKey(se => se.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<Badge>()
            .Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(50);

        // Seed data: 15 badges across 5 progression tracks
        modelBuilder.Entity<Badge>().HasData(
            // ========== 1. Total Score Progression ==========
            new Badge { Id = 1, Name = "First Step", Description = "Complete your first study session", Icon = "🌱", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 2, Name = "Rising Star", Description = "Earn 100 total points", Icon = "⭐", RequiredScore = 100, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 3, Name = "Gaining Momentum", Description = "Earn 300 total points", Icon = "✨", RequiredScore = 300, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 4, Name = "Honor Student", Description = "Earn 500 total points", Icon = "🏆", RequiredScore = 500, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 5, Name = "Top Scholar", Description = "Earn 1000 total points", Icon = "👑", RequiredScore = 1000, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // ========== 2. Study Streak Milestones ==========
            new Badge { Id = 6, Name = "3-Day Streak", Description = "Study for 3 days in a row", Icon = "🔥", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 7, Name = "Week Warrior", Description = "Study for 7 days in a row", Icon = "💪", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 8, Name = "Half-Month Hero", Description = "Study for 15 days in a row", Icon = "📅", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 9, Name = "Monthly Legend", Description = "Study for 30 days in a row", Icon = "🌟", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // ========== 3. Study Time Dedication ==========
            new Badge { Id = 10, Name = "Hour Starter", Description = "Log 60 minutes of total study time", Icon = "⏱️", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 11, Name = "Five-Hour Focus", Description = "Log 300 minutes of total study time", Icon = "⏰", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 12, Name = "Ten-Hour Titan", Description = "Log 600 minutes of total study time", Icon = "🕰️", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // ========== 4. Subject Exploration ==========
            new Badge { Id = 13, Name = "Broad Explorer", Description = "Study 3 different subjects", Icon = "📚", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Badge { Id = 14, Name = "All-Rounder", Description = "Study 5 different subjects", Icon = "🎓", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // ========== 5. Special Milestone ==========
            new Badge { Id = 15, Name = "100-Day Journey", Description = "Check in on 100 total days", Icon = "💯", RequiredScore = 0, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        base.OnModelCreating(modelBuilder);
    }
}