using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class PaymentInfo
{
    public int Id { get; set; }
    
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string BankName { get; set; } = string.Empty;
    
    [Required]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    public string AccountHolder { get; set; } = string.Empty;
    
    public string? Branch { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Event Event { get; set; } = null!;
}
