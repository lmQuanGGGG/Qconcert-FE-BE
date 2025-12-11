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

    public async Task SendTicketWithQRCodeAsync(int orderId)
    {
        Console.WriteLine($"[EmailService] Starting to send ticket email for order {orderId}");
        
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Ticket)
            .ThenInclude(t => t.Event)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            Console.WriteLine($"[EmailService] Order {orderId} not found!");
            return;
        }
        
        if (order.PaymentStatus != "Paid")
        {
            Console.WriteLine($"[EmailService] Order {orderId} payment status is {order.PaymentStatus}, not Paid!");
            return;
        }
        
        Console.WriteLine($"[EmailService] Order found, generating QR codes for {order.OrderDetails.Count} tickets");

        // Create email message
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _configuration["EmailSettings:FromName"],
            _configuration["EmailSettings:FromEmail"]
        ));
        message.To.Add(MailboxAddress.Parse(order.Email));
        message.Subject = $"Vé sự kiện #{order.OrderId} - {order.EventName}";

        var builder = new BodyBuilder();
        var qrCodeService = new QRCodeService(_context);
        
        // Generate QR codes and embed as inline images
        var ticketList = new System.Text.StringBuilder();
        int ticketIndex = 0;
        
        foreach (var detail in order.OrderDetails)
        {
            var qrCodeBase64 = await qrCodeService.GenerateQRCodeAsync(detail.QrCodeToken!);
            
            // Extract base64 data from data URI
            var base64Data = qrCodeBase64.Replace("data:image/png;base64,", "");
            var qrBytes = Convert.FromBase64String(base64Data);
            
            // Add as inline image with CID
            var contentId = $"qr{ticketIndex}@qconcert.com";
            var image = builder.LinkedResources.Add($"qr{ticketIndex}.png", qrBytes, ContentType.Parse("image/png"));
            image.ContentId = contentId;
            
            ticketList.Append($@"
                <div style='border: 2px solid #8b5cf6; padding: 20px; margin: 15px 0; border-radius: 12px; background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%);'>
                    <h4 style='color: #8b5cf6; margin: 0 0 10px 0;'>{detail.Ticket.TenLoaiVe}</h4>
                    <p style='margin: 5px 0;'><strong>Giá:</strong> {detail.Price:N0} VNĐ</p>
                    <p style='margin: 5px 0; font-size: 12px; color: #666;'><strong>Mã vé:</strong> <code style='background: #fff; padding: 2px 6px; border-radius: 4px;'>{detail.QrCodeToken}</code></p>
                    <div style='text-align: center; margin: 15px 0;'>
                        <img src='cid:{contentId}' alt='QR Code' style='width: 200px; height: 200px; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'/>
                    </div>
                    <p style='color: #dc2626; font-weight: bold; text-align: center; margin: 10px 0 0 0;'>⚠️ QR code chỉ quét được 1 lần!</p>
                </div>
            ");
            ticketIndex++;
        }

        var eventDetail = order.OrderDetails.FirstOrDefault()?.Ticket.Event;
        builder.HtmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
            </head>
            <body style='margin: 0; padding: 20px; background-color: #f3f4f6; font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                    <div style='background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; text-align: center;'>
                        <h2 style='color: #ffffff; margin: 0; font-size: 28px;'>🎉 Thanh toán thành công!</h2>
                        <p style='color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;'>Qconcert - Vé sự kiện của bạn</p>
                    </div>
                    
                    <div style='padding: 30px;'>
                        <h3 style='color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;'>📋 Thông tin đơn hàng</h3>
                        <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                            <tr>
                                <td style='padding: 8px 0; color: #666;'><strong>Mã đơn hàng:</strong></td>
                                <td style='padding: 8px 0; text-align: right;'>#{order.OrderId.ToString().PadLeft(8, '0')}</td>
                            </tr>
                            <tr style='background: #f9fafb;'>
                                <td style='padding: 8px 0; color: #666;'><strong>Sự kiện:</strong></td>
                                <td style='padding: 8px 0; text-align: right;'>{order.EventName}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px 0; color: #666;'><strong>Ngày diễn ra:</strong></td>
                                <td style='padding: 8px 0; text-align: right;'>{eventDetail?.Date:dd/MM/yyyy HH:mm}</td>
                            </tr>
                            <tr style='background: #f9fafb;'>
                                <td style='padding: 8px 0; color: #666;'><strong>Địa điểm:</strong></td>
                                <td style='padding: 8px 0; text-align: right;'>{eventDetail?.AddressDetail}, {eventDetail?.Ward}, {eventDetail?.District}, {eventDetail?.Province}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px 0; color: #666;'><strong>Tổng tiền:</strong></td>
                                <td style='padding: 8px 0; text-align: right; font-size: 18px; color: #8b5cf6; font-weight: bold;'>{order.TotalPrice:N0} VNĐ</td>
                            </tr>
                            <tr style='background: #f0fdf4;'>
                                <td style='padding: 8px 0; color: #666;'><strong>Trạng thái:</strong></td>
                                <td style='padding: 8px 0; text-align: right; color: #10b981; font-weight: bold;'>✅ Đã thanh toán</td>
                            </tr>
                        </table>
                        
                        <h3 style='color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; margin-top: 30px;'>🎫 Vé của bạn</h3>
                        {ticketList}
                        
                        <div style='background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;'>
                            <p style='margin: 0; color: #92400e;'><strong>⚠️ Lưu ý quan trọng:</strong></p>
                            <ul style='margin: 10px 0 0 0; padding-left: 20px; color: #92400e;'>
                                <li>Vui lòng lưu email này và mang đến sự kiện để check-in</li>
                                <li>Mỗi QR code chỉ được quét 1 lần duy nhất</li>
                                <li>Không chia sẻ QR code với người khác</li>
                                <li>Đến trước 30 phút để check-in thuận lợi</li>
                            </ul>
                        </div>
                        
                        <div style='text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 30px;'>
                            <p style='color: #666; margin: 0; font-size: 14px;'>
                                Cảm ơn bạn đã sử dụng dịch vụ Qconcert!<br>
                                Mọi thắc mắc xin liên hệ: <a href='mailto:{_configuration["EmailSettings:FromEmail"]}' style='color: #8b5cf6;'>{_configuration["EmailSettings:FromEmail"]}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        ";

        message.Body = builder.ToMessageBody();

        // Send email
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
            
            Console.WriteLine($"[EmailService] Email sent successfully to {order.Email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Email error: {ex.Message}");
            throw;
        }
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
