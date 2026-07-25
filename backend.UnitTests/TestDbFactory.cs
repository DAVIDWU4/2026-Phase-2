using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.UnitTests;

public static class TestDbFactory
{
    /// <summary>
    /// Creates a brand new isolated in-memory database for each test.
    /// Ensures data isolation between test cases.
    /// Automatically executes OnModelCreating to load badge seed data.
    /// </summary>
    public static AppDbContext CreateCleanDbContext()
    {
        var uniqueDbName = Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(uniqueDbName)
            .Options;

        var dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated(); // Triggers seed data initialization
        return dbContext;
    }
}