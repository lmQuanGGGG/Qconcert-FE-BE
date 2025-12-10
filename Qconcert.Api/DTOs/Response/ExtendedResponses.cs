using Qconcert.Api.Models;

namespace Qconcert.Api.DTOs.Response;

public class CartItemResponse
{
    public int TicketId { get; set; }
    public string TicketName { get; set; } = string.Empty;
    public string EventName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public int AvailableQuantity { get; set; }
}

public class CartResponse
{
    public List<CartItemResponse> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public int TotalItems { get; set; }
}

public class TicketResponse
{
    public int TicketId { get; set; }
    public int EventId { get; set; }
    public string TenLoaiVe { get; set; } = string.Empty;
    public string LoaiVe { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public decimal Price { get; set; }
    public int SoLuongGhe { get; set; }
    public int SoLuongConLai { get; set; }
    public int? SoVeToiThieuTrongMotDonHang { get; set; }
    public int? SoVeToiDaTrongMotDonHang { get; set; }
    public DateTime ThoiGianBatDauBanVe { get; set; }
    public DateTime ThoiGianKetThucBanVe { get; set; }
    public string? ThongTinVe { get; set; }
    public string? HinhAnhVeBase64 { get; set; }
    public bool IsAvailable { get; set; }
}

public class DashboardResponse
{
    public int TotalEvents { get; set; }
    public int ApprovedEvents { get; set; }
    public int PendingEvents { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int CompletedOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public int TotalUsers { get; set; }
    public int NewUsersThisMonth { get; set; }
    public List<RevenueByDateResponse> RecentRevenue { get; set; } = new();
    public List<PopularEventResponse> PopularEvents { get; set; } = new();
}

public class PopularEventResponse
{
    public int EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public int TicketsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class HomeIndexResponse
{
    public List<EventResponse> FeaturedEvents { get; set; } = new();
    public List<EventResponse> UpcomingEvents { get; set; } = new();
    public List<EventResponse> PopularEvents { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
    public List<PromotionPackage> BannerPromotions { get; set; } = new();
}

public class EventDetailResponse
{
    public EventResponse Event { get; set; } = null!;
    public List<TicketResponse> Tickets { get; set; } = new();
    public List<ReviewResponse> Reviews { get; set; } = new();
    public bool IsFavorite { get; set; }
    public bool CanReview { get; set; }
}

public class OrganizerDashboardResponse
{
    public int TotalEvents { get; set; }
    public int ApprovedEvents { get; set; }
    public int PendingEvents { get; set; }
    public int TotalTicketsSold { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<EventRevenueResponse> EventRevenues { get; set; } = new();
}

public class EventRevenueResponse
{
    public int EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public int TicketsSold { get; set; }
    public decimal Revenue { get; set; }
    public DateTime EventDate { get; set; }
}

public class EmployeeDashboardResponse
{
    public int TotalCheckIns { get; set; }
    public int TodayCheckIns { get; set; }
    public List<EventCheckInResponse> RecentCheckIns { get; set; } = new();
}

public class EventCheckInResponse
{
    public int OrderDetailId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string TicketType { get; set; } = string.Empty;
    public DateTime CheckInTime { get; set; }
}

public class ImageUploadResponse
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public bool HasPrevious { get; set; }
    public bool HasNext { get; set; }
}
