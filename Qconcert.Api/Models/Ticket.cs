using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.Models;

public class Ticket
{
    public int TicketId { get; set; }
    public int Id => TicketId;
    
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string TenLoaiVe { get; set; } = string.Empty;
    
    [Required]
    public string LoaiVe { get; set; } = "Standard";
    
    [Required]
    [Range(0, double.MaxValue)]
    public decimal Gia { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int SoLuongGhe { get; set; }
    
    public int SoLuongConLai { get; set; }
    
    public int? SoVeToiThieuTrongMotDonHang { get; set; }
    public int? SoVeToiDaTrongMotDonHang { get; set; }
    
    public DateTime? ThoiGianBatDauBanVe { get; set; }
    public DateTime? ThoiGianKetThucBanVe { get; set; }
    
    public string? ThongTinVe { get; set; }
    public byte[]? HinhAnhVe { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Event Event { get; set; } = null!;
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
