using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.Services.Interfaces;
using QRCoder;

namespace Qconcert.Api.Services.Implementations;

public class QRCodeService : IQRCodeService
{
    private readonly ApplicationDbContext _context;

    public QRCodeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateQRCodeAsync(string token)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(token, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(20);
        var base64 = Convert.ToBase64String(qrCodeBytes);
        
        return await Task.FromResult($"data:image/png;base64,{base64}");
    }

    public async Task<bool> ValidateAndCheckInAsync(string qrToken, string employeeId)
    {
        var orderDetail = await _context.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Ticket)
            .ThenInclude(t => t.Event)
            .FirstOrDefaultAsync(od => od.QrCodeToken == qrToken);

        if (orderDetail == null)
            return false;

        if (orderDetail.IsCheckedIn || orderDetail.IsUsed)
            throw new InvalidOperationException("Vé đã được sử dụng rồi");

        if (orderDetail.Order.PaymentStatus != "Paid")
            throw new InvalidOperationException("Đơn hàng chưa thanh toán");

        if (orderDetail.Ticket.Event.Date < DateTime.UtcNow.AddHours(-2))
            throw new InvalidOperationException("Sự kiện đã diễn ra quá 2 giờ");

        orderDetail.IsCheckedIn = true;
        orderDetail.IsUsed = true;
        orderDetail.CheckInTime = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<object?> GetTicketInfoByQRAsync(string qrToken)
    {
        var orderDetail = await _context.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Ticket)
            .ThenInclude(t => t.Event)
            .FirstOrDefaultAsync(od => od.QrCodeToken == qrToken);

        if (orderDetail == null)
            return null;

        return new
        {
            orderDetail.OrderDetailId,
            EventName = orderDetail.Ticket.Event.Name,
            EventDate = orderDetail.Ticket.Event.Date,
            TicketType = orderDetail.Ticket.TenLoaiVe,
            Price = orderDetail.Price,
            orderDetail.IsCheckedIn,
            orderDetail.CheckInTime,
            PaymentStatus = orderDetail.Order.PaymentStatus
        };
    }
}
