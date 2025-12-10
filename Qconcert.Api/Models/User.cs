using Microsoft.AspNetCore.Identity;

namespace Qconcert.Api.Models;

public class User : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public int LoyaltyPoints { get; set; } = 0;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Navigation properties
    public virtual ICollection<Event> CreatedEvents { get; set; } = new List<Event>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
