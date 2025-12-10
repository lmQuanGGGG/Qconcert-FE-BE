using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Review
{
    public int ReviewId { get; set; }
    
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }
    
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Event Event { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
