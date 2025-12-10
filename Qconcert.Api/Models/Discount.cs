using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Discount
{
    public int Id { get; set; }
    
    [Required]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [Range(0, 100)]
    public decimal Percentage { get; set; }
    
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }
    
    [Required]
    public DateTime ExpiryDate { get; set; }
    
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
