namespace Qconcert.Api.DTOs.Response;

public class EventResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int Capacity { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string AddressDetail { get; set; } = string.Empty;
    public string OrganizerName { get; set; } = string.Empty;
    public string OrganizerInfo { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Images as base64 strings
    public string? Image9x16 { get; set; }
    public string? Image16x9 { get; set; }
    public string? OrganizerLogo { get; set; }
}

public class OrderResponse
{
    public int OrderId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentStatus { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? QrCodeUrl { get; set; }
    public List<OrderDetailResponse> OrderDetails { get; set; } = new();
}

public class OrderDetailResponse
{
    public int OrderDetailId { get; set; }
    public int TicketId { get; set; }
    public string TicketName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public bool IsCheckedIn { get; set; }
    public DateTime? CheckInTime { get; set; }
    public string? QrCodeToken { get; set; }
}

public class PaymentResponse
{
    public string PaymentUrl { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ReviewResponse
{
    public int ReviewId { get; set; }
    public int EventId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StatisticsResponse
{
    public int TotalEvents { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalUsers { get; set; }
    public List<RevenueByDateResponse> RevenueByDate { get; set; } = new();
}

public class RevenueByDateResponse
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}
