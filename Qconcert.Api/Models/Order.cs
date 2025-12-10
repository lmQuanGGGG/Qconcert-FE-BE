using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Order
{
    public int OrderId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string EventName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public decimal TotalPrice { get; set; }
    
    [Required]
    public string Status { get; set; } = "Pending";
    
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; } = "Chưa thanh toán";
    public string? TransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? BankTransferImage { get; set; }
    public string? QrCodeUrl { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
