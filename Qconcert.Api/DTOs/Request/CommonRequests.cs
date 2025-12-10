using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.DTOs.Request;

public class CreateEventRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? EventInfo { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    public int? CategoryId { get; set; }
    
    [Required]
    public int Capacity { get; set; }
    
    [Required]
    public string Province { get; set; } = string.Empty;
    
    [Required]
    public string District { get; set; } = string.Empty;
    
    [Required]
    public string Ward { get; set; } = string.Empty;
    
    [Required]
    public string AddressDetail { get; set; } = string.Empty;
    
    [Required]
    public string OrganizerName { get; set; } = string.Empty;
    
    [Required]
    public string OrganizerInfo { get; set; } = string.Empty;
    
    // Base64 encoded images
    public string? Image9x16 { get; set; }
    public string? Image16x9 { get; set; }
    public string? OrganizerLogo { get; set; }
    
    // Tickets data
    public List<CreateTicketInEventRequest>? Tickets { get; set; }
}

public class CreateTicketInEventRequest
{
    [Required]
    public string TenLoaiVe { get; set; } = string.Empty;
    
    [Required]
    public string LoaiVe { get; set; } = "Standard";
    
    [Required]
    public decimal Gia { get; set; }
    
    [Required]
    public int SoLuongGhe { get; set; }
    
    public string? ThongTinVe { get; set; }
}

public class UpdateEventRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? EventInfo { get; set; }
    public DateTime? Date { get; set; }
    public int? CategoryId { get; set; }
    public int? Capacity { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string? AddressDetail { get; set; }
    public string? OrganizerName { get; set; }
    public string? OrganizerInfo { get; set; }
    
    // Base64 encoded images - only send if changed
    public string? Image9x16 { get; set; }
    public string? Image16x9 { get; set; }
    public string? OrganizerLogo { get; set; }
}

public class CreateTicketRequest
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string TenLoaiVe { get; set; } = string.Empty;
    
    [Required]
    public string LoaiVe { get; set; } = "Standard";
    
    [Required]
    public decimal Gia { get; set; }
    
    [Required]
    public int SoLuongGhe { get; set; }
    
    public int? SoVeToiThieuTrongMotDonHang { get; set; }
    public int? SoVeToiDaTrongMotDonHang { get; set; }
    
    [Required]
    public DateTime ThoiGianBatDauBanVe { get; set; }
    
    [Required]
    public DateTime ThoiGianKetThucBanVe { get; set; }
    
    public string? ThongTinVe { get; set; }
    
    public byte[]? HinhAnhVe { get; set; }
}

public class CreateOrderRequest
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public List<OrderDetailRequest> OrderDetails { get; set; } = new();
    
    public string? DiscountCode { get; set; }
}

public class OrderDetailRequest
{
    [Required]
    public int TicketId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}

public class CreateReviewRequest
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }
    
    public string? Comment { get; set; }
}

public class CreatePaymentRequest
{
    [Required]
    public int OrderId { get; set; }
    
    [Required]
    public string PaymentMethod { get; set; } = string.Empty;
    
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
}
