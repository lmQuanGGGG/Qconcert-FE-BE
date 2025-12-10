using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;
using QRCoder;

namespace Qconcert.Api.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, string userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Lấy thông tin event
            var eventData = await _context.Events.FindAsync(request.EventId);
            if (eventData == null)
                throw new Exception("Không tìm thấy sự kiện");

            // Tính tổng tiền
            decimal totalPrice = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var item in request.OrderDetails)
            {
                var ticket = await _context.Tickets.FindAsync(item.TicketId);
                if (ticket == null)
                    throw new Exception($"Không tìm thấy vé ID {item.TicketId}");

                if (ticket.SoLuongConLai < item.Quantity)
                    throw new Exception($"Không đủ vé cho loại {ticket.TenLoaiVe}");

                totalPrice += ticket.Gia * item.Quantity;

                // Cập nhật số lượng vé
                ticket.SoLuongConLai -= item.Quantity;

                // Tạo order detail
                for (int i = 0; i < item.Quantity; i++)
                {
                    orderDetails.Add(new OrderDetail
                    {
                        TicketId = item.TicketId,
                        Quantity = 1,
                        Price = ticket.Gia,
                        QrCodeToken = Guid.NewGuid().ToString()
                    });
                }
            }

            // Tạo order
            var order = new Order
            {
                UserId = userId,
                EventId = request.EventId,
                EventName = eventData.Name,
                Email = request.Email,
                TotalPrice = totalPrice,
                Status = "Pending",
                PaymentStatus = "Pending",
                CreatedAt = DateTime.UtcNow,
                OrderDetails = orderDetails
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new OrderResponse
            {
                OrderId = order.OrderId,
                EventName = order.EventName,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                PaymentStatus = order.PaymentStatus,
                CreatedAt = order.CreatedAt,
                OrderDetails = orderDetails.Select(od => new OrderDetailResponse
                {
                    OrderDetailId = od.OrderDetailId,
                    TicketId = od.TicketId,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList()
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<OrderResponse>> GetOrdersByUserAsync(string userId)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Ticket)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new OrderResponse
        {
            OrderId = o.OrderId,
            EventName = o.EventName,
            TotalPrice = o.TotalPrice,
            Status = o.Status,
            PaymentStatus = o.PaymentStatus,
            CreatedAt = o.CreatedAt,
            OrderDetails = o.OrderDetails.Select(od => new OrderDetailResponse
            {
                OrderDetailId = od.OrderDetailId,
                TicketId = od.TicketId,
                Quantity = od.Quantity,
                Price = od.Price,
                IsCheckedIn = od.IsCheckedIn,
                CheckInTime = od.CheckInTime
            }).ToList()
        });
    }

    public async Task<OrderResponse?> GetOrderByIdAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Ticket)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
            return null;

        return new OrderResponse
        {
            OrderId = order.OrderId,
            EventName = order.EventName,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            PaymentMethod = order.PaymentMethod,
            TransactionId = order.TransactionId,
            CreatedAt = order.CreatedAt,
            OrderDetails = order.OrderDetails.Select(od => new OrderDetailResponse
            {
                OrderDetailId = od.OrderDetailId,
                TicketId = od.TicketId,
                Quantity = od.Quantity,
                Price = od.Price,
                IsCheckedIn = od.IsCheckedIn,
                CheckInTime = od.CheckInTime,
                QrCodeToken = od.QrCodeToken
            }).ToList()
        };
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        order.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdatePaymentStatusAsync(int orderId, string paymentStatus, string? transactionId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        order.PaymentStatus = paymentStatus;
        if (paymentStatus == "Paid")
        {
            order.PaymentDate = DateTime.UtcNow;
            order.TransactionId = transactionId;
        }
        await _context.SaveChangesAsync();
        return true;
    }
}
