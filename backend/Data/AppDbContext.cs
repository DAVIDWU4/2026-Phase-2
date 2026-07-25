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

        // 7. 可选：种子数据 - 预置3个基础徽章，方便测试
        modelBuilder.Entity<Badge>().HasData(
            new Badge { Id = 1, Name = "初学乍练", Description = "完成第一次学习打卡", Icon = "🌟", RequiredScore = 0 },
            new Badge { Id = 2, Name = "坚持不懈", Description = "连续打卡7天", Icon = "🔥", RequiredScore = 100 },
            new Badge { Id = 3, Name = "学霸降临", Description = "累计获得500积分", Icon = "🏆", RequiredScore = 500 }
        );

        base.OnModelCreating(modelBuilder);
    }
}