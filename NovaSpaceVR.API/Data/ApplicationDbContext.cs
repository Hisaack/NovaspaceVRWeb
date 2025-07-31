using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseModule> CourseModules { get; set; }
    public DbSet<VirtualUser> VirtualUsers { get; set; }
    public DbSet<TrainingData> TrainingData { get; set; }
    public DbSet<TrainingStep> TrainingSteps { get; set; }
    public DbSet<GraduatedUser> GraduatedUsers { get; set; }
    public DbSet<Device> Devices { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<OtpCode> OtpCodes { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Course relationships
        builder.Entity<Course>()
            .HasOne(c => c.Organization)
            .WithMany(u => u.Courses)
            .HasForeignKey(c => c.OrganizationId)
            .OnDelete(DeleteBehavior.SetNull);

        // CourseModule relationships
        builder.Entity<CourseModule>()
            .HasOne(cm => cm.Course)
            .WithMany(c => c.Modules)
            .HasForeignKey(cm => cm.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // VirtualUser relationships
        builder.Entity<VirtualUser>()
            .HasOne(vu => vu.Account)
            .WithMany(u => u.VirtualUsers)
            .HasForeignKey(vu => vu.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // TrainingData relationships
        builder.Entity<TrainingData>()
            .HasOne(td => td.VirtualUser)
            .WithMany(vu => vu.TrainingData)
            .HasForeignKey(td => td.VirtualUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TrainingData>()
            .HasOne(td => td.Course)
            .WithMany(c => c.TrainingData)
            .HasForeignKey(td => td.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TrainingData>()
            .HasOne(td => td.Account)
            .WithMany()
            .HasForeignKey(td => td.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // TrainingStep relationships
        builder.Entity<TrainingStep>()
            .HasOne(ts => ts.TrainingData)
            .WithMany(td => td.TrainingSteps)
            .HasForeignKey(ts => ts.TrainingDataId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TrainingStep>()
            .HasOne(ts => ts.Account)
            .WithMany()
            .HasForeignKey(ts => ts.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // GraduatedUser relationships
        builder.Entity<GraduatedUser>()
            .HasOne(gu => gu.VirtualUser)
            .WithMany(vu => vu.GraduatedCourses)
            .HasForeignKey(gu => gu.VirtualUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GraduatedUser>()
            .HasOne(gu => gu.Course)
            .WithMany()
            .HasForeignKey(gu => gu.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enrollment relationships
        builder.Entity<Enrollment>()
            .HasOne(e => e.VirtualUser)
            .WithMany(vu => vu.Enrollments)
            .HasForeignKey(e => e.VirtualUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Enrollment>()
            .HasOne(e => e.Account)
            .WithMany()
            .HasForeignKey(e => e.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Device relationships
        builder.Entity<Device>()
            .HasOne(d => d.Account)
            .WithMany()
            .HasForeignKey(d => d.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Alert relationships
        builder.Entity<Alert>()
            .HasOne(a => a.Account)
            .WithMany(u => u.Alerts)
            .HasForeignKey(a => a.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.Entity<VirtualUser>()
            .HasIndex(vu => vu.UserCode)
            .IsUnique();

        builder.Entity<VirtualUser>()
            .HasIndex(vu => vu.Email)
            .IsUnique();

        builder.Entity<Course>()
            .HasIndex(c => c.Code)
            .IsUnique();

        builder.Entity<OtpCode>()
            .HasIndex(o => new { o.Email, o.Code, o.Purpose });

        // Performance indexes for account-based queries
        builder.Entity<TrainingData>()
            .HasIndex(td => td.AccountId);

        builder.Entity<TrainingStep>()
            .HasIndex(ts => ts.AccountId);

        builder.Entity<Device>()
            .HasIndex(d => d.AccountId);

        builder.Entity<Enrollment>()
            .HasIndex(e => e.AccountId);
    }
}