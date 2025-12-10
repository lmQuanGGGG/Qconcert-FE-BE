using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Notification
{
    public int NotificationId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    public string? Link { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
}
