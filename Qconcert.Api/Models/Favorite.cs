using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Favorite
{
    public int FavoriteId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public int EventId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Event Event { get; set; } = null!;
}
