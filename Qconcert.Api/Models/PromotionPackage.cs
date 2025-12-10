using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public enum PromotionType
{
    Banner,
    Highlight,
    Featured
}

public enum PromotionStatus
{
    Pending,
    Approved,
    Rejected,
    Paid,
    Expired
}

public class PromotionPackage
{
    public int Id { get; set; }
    
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    public PromotionType Type { get; set; }
    
    [Required]
    public DateTime RequestedStartDate { get; set; }
    
    public DateTime? ActualStartDate { get; set; }
    
    [Required]
    [Range(1, 365)]
    public int DurationInDays { get; set; }
    
    public string? MediaPath { get; set; }
    public bool IsInQueue { get; set; } = false;
    public bool IsPaid { get; set; } = false;
    
    [Required]
    public decimal TotalCost { get; set; }
    
    public string? TransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public PromotionStatus Status { get; set; } = PromotionStatus.Pending;

    // Navigation properties
    public virtual Event Event { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
