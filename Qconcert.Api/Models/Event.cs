using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Event
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    public string? EventInfo { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    public int? CategoryId { get; set; }
    
    [Required]
    public int Capacity { get; set; }
    
    public byte[]? Image9x16 { get; set; }
    public byte[]? Image16x9 { get; set; }
    
    [Required]
    public string Province { get; set; } = string.Empty;
    
    [Required]
    public string District { get; set; } = string.Empty;
    
    [Required]
    public string Ward { get; set; } = string.Empty;
    
    [Required]
    public string AddressDetail { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public string OrganizerName { get; set; } = string.Empty;
    
    [Required]
    public string OrganizerInfo { get; set; } = string.Empty;
    
    public byte[]? OrganizerLogo { get; set; }
    
    [Required]
    public string CreatedBy { get; set; } = string.Empty;
    
    public bool IsApproved { get; set; } = false;
    public bool IsPaid { get; set; } = false;
    
    // Additional fields for reviews
    public int ViewCount { get; set; } = 0;
    public decimal AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;

    // Navigation properties
    public virtual Category? Category { get; set; }
    public virtual User? Creator { get; set; }
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<PromotionPackage> PromotionPackages { get; set; } = new List<PromotionPackage>();
    public virtual ICollection<PaymentInfo> PaymentInfos { get; set; } = new List<PaymentInfo>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}
