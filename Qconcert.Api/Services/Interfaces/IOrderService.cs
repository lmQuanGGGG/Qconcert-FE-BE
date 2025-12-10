using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, string userId);
    Task<IEnumerable<OrderResponse>> GetOrdersByUserAsync(string userId);
    Task<OrderResponse?> GetOrderByIdAsync(int orderId);
    Task<bool> UpdateOrderStatusAsync(int orderId, string status);
    Task<bool> UpdatePaymentStatusAsync(int orderId, string paymentStatus, string? transactionId);
}
