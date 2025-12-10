using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Models;

namespace Qconcert.Api.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderDetail> OrderDetails { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<PromotionPackage> PromotionPackages { get; set; }
    public DbSet<PaymentInfo> PaymentInfos { get; set; }
    public DbSet<Discount> Discounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal precision
        modelBuilder.Entity<Event>()
            .Property(e => e.AverageRating)
            .HasPrecision(3, 2);

        modelBuilder.Entity<Ticket>()
            .Property(t => t.Gia)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderDetail>()
            .Property(od => od.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PromotionPackage>()
            .Property(pp => pp.TotalCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Discount>()
            .Property(d => d.Percentage)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Discount>()
            .Property(d => d.MaxDiscountAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Discount>()
            .Property(d => d.MinOrderAmount)
            .HasPrecision(18, 2);

        // Configure relationships
        modelBuilder.Entity<Event>()
            .HasOne(e => e.Creator)
            .WithMany(u => u.CreatedEvents)
            .HasForeignKey(e => e.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Event)
            .WithMany(e => e.Reviews)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.Event)
            .WithMany(e => e.Favorites)
            .HasForeignKey(f => f.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique indexes
        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.EventId, r.UserId })
            .IsUnique();

        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.EventId })
            .IsUnique();

        modelBuilder.Entity<Discount>()
            .HasIndex(d => d.Code)
            .IsUnique();
    }
}
