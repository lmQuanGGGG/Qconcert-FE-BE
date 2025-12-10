using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace Qconcert.Api.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public PaymentService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<PaymentResponse> CreatePaymentUrlAsync(int orderId, string returnUrl, string cancelUrl)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            throw new KeyNotFoundException("Không tìm thấy đơn hàng");

        // Generate PayOS payment link
        var transactionId = $"ORD{orderId}_{DateTime.UtcNow.Ticks}";
        var clientId = _configuration["PayOSSettings:ClientId"];
        var apiKey = _configuration["PayOSSettings:ApiKey"];
        var checksumKey = _configuration["PayOSSettings:ChecksumKey"];

        // Create checksum
        var data = $"{transactionId}{order.TotalPrice}{returnUrl}{cancelUrl}";
        var checksum = CreateChecksum(data, checksumKey!);

        // In production, call PayOS API here
        var paymentUrl = $"https://payment.payos.vn/payment?transactionId={transactionId}&amount={order.TotalPrice}&checksum={checksum}";

        order.TransactionId = transactionId;
        order.PaymentMethod = "PayOS";
        await _context.SaveChangesAsync();

        return new PaymentResponse
        {
            PaymentUrl = paymentUrl,
            TransactionId = transactionId,
            Amount = order.TotalPrice,
            PaymentMethod = "PayOS",
            CreatedAt = DateTime.UtcNow
        };
    }

    public async Task<bool> VerifyPaymentAsync(string transactionId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.TransactionId == transactionId);

        if (order == null)
            return false;

        // In production, verify with PayOS API here
        order.PaymentStatus = "Paid";
        order.PaymentDate = DateTime.UtcNow;
        order.Status = "Confirmed";
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ConfirmBankTransferAsync(int orderId, string imagePath)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        order.PaymentMethod = "BankTransfer";
        order.BankTransferImage = imagePath;
        order.PaymentStatus = "Pending";
        await _context.SaveChangesAsync();

        return true;
    }

    private string CreateChecksum(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hash);
    }
}
