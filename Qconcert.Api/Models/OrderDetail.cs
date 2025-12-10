using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class OrderDetail
{
    public int OrderDetailId { get; set; }
    
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public int TicketId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    public bool IsCheckedIn { get; set; } = false;
    public DateTime? CheckInTime { get; set; }
    public string? QrCodeToken { get; set; }
    public bool IsUsed { get; set; } = false;
    public string? QrCodeUrl { get; set; }

    // Navigation properties
    public virtual Order Order { get; set; } = null!;
    public virtual Ticket Ticket { get; set; } = null!;
}
