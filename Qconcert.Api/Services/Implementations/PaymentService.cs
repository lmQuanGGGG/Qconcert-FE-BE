using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using PayOS;
using PayOS.Models.V2.PaymentRequests;

namespace Qconcert.Api.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly PayOSClient _payOSClient;
    private readonly IEmailService _emailService;

    public PaymentService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        
        // Initialize PayOS Client
        var clientId = _configuration["PayOSSettings:ClientId"];
        var apiKey = _configuration["PayOSSettings:ApiKey"];
        var checksumKey = _configuration["PayOSSettings:ChecksumKey"];
        
        _payOSClient = new PayOSClient(new PayOSOptions
        {
            ClientId = clientId,
            ApiKey = apiKey,
            ChecksumKey = checksumKey
        });
    }

    public async Task<PaymentResponse> CreatePaymentUrlAsync(int orderId, string returnUrl, string cancelUrl)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            throw new KeyNotFoundException("Không tìm thấy đơn hàng");

        // Generate unique order code (must be numeric and unique)
        var orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmss"));
        var transactionId = $"ORD{orderId}_{orderCode}";

        // Create payment request payload for PayOS API v2
        var description = $"Thanh toan don hang #{orderId}";
        var amount = (int)order.TotalPrice;
        var buyerName = order.Email.Split('@')[0]; // Use email prefix as name
        var buyerEmail = order.Email;
        var buyerPhone = "0000000000"; // Default phone if not provided
        
        // Prepare payment items
        var items = new List<PaymentLinkItem>
        {
            new PaymentLinkItem
            {
                Name = "Ve su kien",
                Quantity = 1,
                Price = amount
            }
        };

        // Create payment link request using PayOS SDK
        var paymentRequest = new CreatePaymentLinkRequest
        {
            OrderCode = orderCode,
            Amount = amount,
            Description = description,
            BuyerName = buyerName,
            BuyerEmail = buyerEmail,
            BuyerPhone = buyerPhone,
            BuyerAddress = "",
            Items = items,
            ReturnUrl = returnUrl,
            CancelUrl = cancelUrl
        };

        Console.WriteLine($"=== PayOS Payment Request ===");
        Console.WriteLine($"OrderCode: {orderCode}");
        Console.WriteLine($"Amount: {amount}");
        Console.WriteLine($"Description: {description}");

        try
        {
            // Call PayOS API using SDK - it handles signature automatically
            var result = await _payOSClient.PaymentRequests.CreateAsync(paymentRequest);
            
            Console.WriteLine($"PayOS Success - CheckoutUrl: {result.CheckoutUrl}");
            Console.WriteLine($"PaymentLinkId: {result.PaymentLinkId}");

            // Update order with transaction info
            order.TransactionId = transactionId;
            order.PaymentMethod = "PayOS";
            await _context.SaveChangesAsync();

            return new PaymentResponse
            {
                PaymentUrl = result.CheckoutUrl,
                TransactionId = transactionId,
                Amount = order.TotalPrice,
                PaymentMethod = "PayOS",
                CreatedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi tạo link thanh toán PayOS: {ex.Message}");
        }
    }

    private string CreateHmacSignature(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
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

    public async Task<Models.Order?> GetOrderByPaymentCodeAsync(string orderCode)
    {
        // OrderCode format from PayOS: yyMMddHHmmss
        // We stored it in TransactionId as: ORD{orderId}_{orderCode}
        return await _context.Orders
            .FirstOrDefaultAsync(o => o.TransactionId != null && o.TransactionId.Contains(orderCode));
    }

    public async Task<bool> UpdatePaymentStatusAfterCallbackAsync(int orderId, string paymentStatus)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        order.PaymentStatus = paymentStatus;
        if (paymentStatus == "Paid")
        {
            order.PaymentDate = DateTime.UtcNow;
            order.Status = "Confirmed";
        }
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SendTicketEmailAsync(int orderId)
    {
        try
        {
            await _emailService.SendTicketWithQRCodeAsync(orderId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending ticket email: {ex.Message}");
            // Don't throw - email failure shouldn't break the payment flow
        }
    }
}
