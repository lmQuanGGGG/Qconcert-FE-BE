using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using Qconcert.Api.Data;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public EmailService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task SendOrderConfirmationAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Ticket)
            .ThenInclude(t => t.Event)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
            return;

        var subject = $"Xác nhận đơn hàng #{order.OrderId} - Qconcert";
        var body = $@"
            <h2>Cảm ơn bạn đã đặt vé!</h2>
            <p>Mã đơn hàng: <strong>#{order.OrderId}</strong></p>
            <p>Sự kiện: <strong>{order.EventName}</strong></p>
            <p>Tổng tiền: <strong>{order.TotalPrice:N0} VNĐ</strong></p>
            <p>Trạng thái: <strong>{order.Status}</strong></p>
            <hr>
            <h3>Chi tiết vé:</h3>
            <ul>
            {string.Join("", order.OrderDetails.Select(od => $"<li>{od.Ticket.TenLoaiVe} - {od.Price:N0} VNĐ x {od.Quantity}</li>"))}
            </ul>
            <p>Vui lòng kiểm tra email để nhận mã QR code vé của bạn.</p>
        ";

        await SendEmailAsync(order.Email, subject, body);
    }

    public async Task SendEventApprovedNotificationAsync(int eventId)
    {
        var eventData = await _context.Events
            .Include(e => e.Creator)
            .FirstOrDefaultAsync(e => e.Id == eventId);

        if (eventData?.Creator == null)
            return;

        var subject = $"Sự kiện '{eventData.Name}' đã được phê duyệt";
        var body = $@"
            <h2>Chúc mừng!</h2>
            <p>Sự kiện <strong>{eventData.Name}</strong> của bạn đã được phê duyệt.</p>
            <p>Ngày diễn ra: {eventData.Date:dd/MM/yyyy HH:mm}</p>
            <p>Địa điểm: {eventData.Province}</p>
            <p>Bạn có thể bắt đầu bán vé ngay bây giờ!</p>
        ";

        await SendEmailAsync(eventData.Creator.Email!, subject, body);
    }

    public async Task SendEmailAsync(string to, string subject, string body, string? attachmentPath = null)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _configuration["EmailSettings:FromName"],
            _configuration["EmailSettings:FromEmail"]
        ));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = body };
        
        if (!string.IsNullOrEmpty(attachmentPath) && File.Exists(attachmentPath))
        {
            builder.Attachments.Add(attachmentPath);
        }

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"],
                int.Parse(_configuration["EmailSettings:SmtpPort"]!),
                SecureSocketOptions.StartTls
            );

            await client.AuthenticateAsync(
                _configuration["EmailSettings:Username"],
                _configuration["EmailSettings:Password"]
            );

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            // Log error
            Console.WriteLine($"Email error: {ex.Message}");
        }
    }
}
