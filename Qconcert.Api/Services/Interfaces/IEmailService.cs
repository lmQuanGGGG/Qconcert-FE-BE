namespace Qconcert.Api.Services.Interfaces;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(int orderId);
    Task SendTicketWithQRCodeAsync(int orderId);
    Task SendEventApprovedNotificationAsync(int eventId);
    Task SendEmailAsync(string to, string subject, string body, string? attachmentPath = null);
}
