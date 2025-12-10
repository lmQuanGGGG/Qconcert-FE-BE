using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StatisticsResponse> GetStatisticsAsync()
    {
        var totalEvents = await _context.Events.CountAsync(e => e.IsApproved);
        var totalOrders = await _context.Orders.CountAsync();
        var totalRevenue = await _context.Orders
            .Where(o => o.PaymentStatus == "Paid")
            .SumAsync(o => o.TotalPrice);
        var totalUsers = await _context.Users.CountAsync();

        var last30Days = DateTime.UtcNow.AddDays(-30);
        var revenueByDate = await _context.Orders
            .Where(o => o.PaymentStatus == "Paid" && o.PaymentDate >= last30Days)
            .GroupBy(o => o.PaymentDate!.Value.Date)
            .Select(g => new RevenueByDateResponse
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalPrice),
                OrderCount = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToListAsync();

        return new StatisticsResponse
        {
            TotalEvents = totalEvents,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            TotalUsers = totalUsers,
            RevenueByDate = revenueByDate
        };
    }

    public async Task<IEnumerable<RevenueByDateResponse>> GetRevenueByDateAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Orders
            .Where(o => o.PaymentStatus == "Paid" 
                && o.PaymentDate >= startDate 
                && o.PaymentDate <= endDate)
            .GroupBy(o => o.PaymentDate!.Value.Date)
            .Select(g => new RevenueByDateResponse
            {
                Date = g.Key,
                Revenue = g.Sum(o => o.TotalPrice),
                OrderCount = g.Count()
            })
            .OrderBy(r => r.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<object>> GetTopEventsAsync(int top = 10)
    {
        return await _context.Events
            .Where(e => e.IsApproved)
            .OrderByDescending(e => e.ViewCount)
            .Take(top)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.ViewCount,
                e.AverageRating,
                e.ReviewCount,
                TicketsSold = _context.OrderDetails
                    .Where(od => od.Ticket.EventId == e.Id && od.Order.PaymentStatus == "Paid")
                    .Sum(od => od.Quantity),
                Revenue = _context.OrderDetails
                    .Where(od => od.Ticket.EventId == e.Id && od.Order.PaymentStatus == "Paid")
                    .Sum(od => od.Price * od.Quantity)
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<object>> GetPendingEventsAsync()
    {
        return await _context.Events
            .Where(e => !e.IsApproved)
            .Include(e => e.Creator)
            .Include(e => e.Category)
            .OrderBy(e => e.CreatedAt)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Description,
                e.Date,
                CategoryName = e.Category!.Name,
                OrganizerName = e.Creator!.FullName,
                OrganizerEmail = e.Creator.Email,
                e.CreatedAt
            })
            .ToListAsync();
    }
}
