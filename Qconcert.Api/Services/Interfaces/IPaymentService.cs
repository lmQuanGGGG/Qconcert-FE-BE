using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponse> CreatePaymentUrlAsync(int orderId, string returnUrl, string cancelUrl);
    Task<bool> VerifyPaymentAsync(string transactionId);
    Task<bool> ConfirmBankTransferAsync(int orderId, string imagePath);
    Task<Models.Order?> GetOrderByPaymentCodeAsync(string orderCode);
    Task<bool> UpdatePaymentStatusAfterCallbackAsync(int orderId, string paymentStatus);
    Task SendTicketEmailAsync(int orderId);
}
