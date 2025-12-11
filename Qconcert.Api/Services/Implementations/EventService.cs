using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class EventService : IEventService
{
    private readonly ApplicationDbContext _context;

    public EventService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EventResponse>> GetAllEventsAsync(bool? isApproved = null, int? categoryId = null, string? keyword = null)
    {
        var query = _context.Events.Include(e => e.Category).AsQueryable();

        if (isApproved.HasValue)
            query = query.Where(e => e.IsApproved == isApproved.Value);

        if (categoryId.HasValue)
            query = query.Where(e => e.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(e =>
                e.Name.ToLower().Contains(lowerKeyword)
                || (e.Description != null && e.Description.ToLower().Contains(lowerKeyword))
                || (e.OrganizerName != null && e.OrganizerName.ToLower().Contains(lowerKeyword))
                || (e.Province != null && e.Province.ToLower().Contains(lowerKeyword))
                || (e.District != null && e.District.ToLower().Contains(lowerKeyword))
                || (e.Ward != null && e.Ward.ToLower().Contains(lowerKeyword))
                || (e.AddressDetail != null && e.AddressDetail.ToLower().Contains(lowerKeyword))
            );
        }

        var events = await query.OrderByDescending(e => e.CreatedAt).ToListAsync();

        return events.Select(e => new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            Date = e.Date,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name,
            Capacity = e.Capacity,
            Location = $"{e.AddressDetail}, {e.Ward}, {e.District}, {e.Province}",
            Province = e.Province,
            District = e.District,
            Ward = e.Ward,
            AddressDetail = e.AddressDetail,
            OrganizerName = e.OrganizerName,
            OrganizerInfo = e.OrganizerInfo,
            IsApproved = e.IsApproved,
            AverageRating = e.AverageRating,
            ReviewCount = e.ReviewCount,
            ViewCount = e.ViewCount,
            CreatedAt = e.CreatedAt,
            Image9x16 = e.Image9x16 != null ? Convert.ToBase64String(e.Image9x16) : null,
            Image16x9 = e.Image16x9 != null ? Convert.ToBase64String(e.Image16x9) : null,
            OrganizerLogo = e.OrganizerLogo != null ? Convert.ToBase64String(e.OrganizerLogo) : null
        });
    }

    public async Task<EventResponse?> GetEventByIdAsync(int id)
    {
        var e = await _context.Events.Include(e => e.Category).FirstOrDefaultAsync(e => e.Id == id);
        if (e == null) return null;

        e.ViewCount++;
        await _context.SaveChangesAsync();

        return new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            Date = e.Date,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name,
            Capacity = e.Capacity,
            Location = $"{e.AddressDetail}, {e.Ward}, {e.District}, {e.Province}",
            Province = e.Province,
            District = e.District,
            Ward = e.Ward,
            AddressDetail = e.AddressDetail,
            OrganizerName = e.OrganizerName,
            OrganizerInfo = e.OrganizerInfo,
            IsApproved = e.IsApproved,
            AverageRating = e.AverageRating,
            ReviewCount = e.ReviewCount,
            ViewCount = e.ViewCount,
            CreatedAt = e.CreatedAt,
            Image9x16 = e.Image9x16 != null ? Convert.ToBase64String(e.Image9x16) : null,
            Image16x9 = e.Image16x9 != null ? Convert.ToBase64String(e.Image16x9) : null,
            OrganizerLogo = e.OrganizerLogo != null ? Convert.ToBase64String(e.OrganizerLogo) : null
        };
    }

    public async Task<Event> CreateEventAsync(CreateEventRequest request, string createdBy)
    {
        var newEvent = new Event
        {
            Name = request.Name,
            Description = request.Description,
            EventInfo = request.EventInfo,
            Date = request.Date,
            CategoryId = request.CategoryId,
            Capacity = request.Capacity,
            Province = request.Province,
            District = request.District,
            Ward = request.Ward,
            AddressDetail = request.AddressDetail,
            OrganizerName = request.OrganizerName,
            OrganizerInfo = request.OrganizerInfo,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            IsApproved = false
        };

        // Convert base64 images to byte arrays
        if (!string.IsNullOrEmpty(request.Image9x16))
        {
            try
            {
                var base64Data = request.Image9x16.Contains(",") 
                    ? request.Image9x16.Split(',')[1] 
                    : request.Image9x16;
                newEvent.Image9x16 = Convert.FromBase64String(base64Data);
            }
            catch { /* Invalid base64, skip */ }
        }

        if (!string.IsNullOrEmpty(request.Image16x9))
        {
            try
            {
                var base64Data = request.Image16x9.Contains(",") 
                    ? request.Image16x9.Split(',')[1] 
                    : request.Image16x9;
                newEvent.Image16x9 = Convert.FromBase64String(base64Data);
            }
            catch { /* Invalid base64, skip */ }
        }

        if (!string.IsNullOrEmpty(request.OrganizerLogo))
        {
            try
            {
                var base64Data = request.OrganizerLogo.Contains(",") 
                    ? request.OrganizerLogo.Split(',')[1] 
                    : request.OrganizerLogo;
                newEvent.OrganizerLogo = Convert.FromBase64String(base64Data);
            }
            catch { /* Invalid base64, skip */ }
        }

        _context.Events.Add(newEvent);
        await _context.SaveChangesAsync();
        
        // Create tickets if provided
        if (request.Tickets != null && request.Tickets.Any())
        {
            foreach (var ticketRequest in request.Tickets)
            {
                var ticket = new Ticket
                {
                    EventId = newEvent.Id,
                    TenLoaiVe = ticketRequest.TenLoaiVe,
                    LoaiVe = ticketRequest.LoaiVe,
                    Gia = ticketRequest.Gia,
                    SoLuongGhe = ticketRequest.SoLuongGhe,
                    SoLuongConLai = ticketRequest.SoLuongGhe,
                    ThongTinVe = ticketRequest.ThongTinVe,
                    ThoiGianBatDauBanVe = DateTime.UtcNow,
                    ThoiGianKetThucBanVe = newEvent.Date,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Tickets.Add(ticket);
            }
            await _context.SaveChangesAsync();
        }
        
        return newEvent;
    }

    public async Task<Event> UpdateEventAsync(int id, UpdateEventRequest request)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null)
            throw new KeyNotFoundException("Không tìm thấy sự kiện");

        if (!string.IsNullOrEmpty(request.Name))
            existingEvent.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description))
            existingEvent.Description = request.Description;
        if (!string.IsNullOrEmpty(request.EventInfo))
            existingEvent.EventInfo = request.EventInfo;
        if (request.Date.HasValue)
            existingEvent.Date = request.Date.Value;
        if (request.CategoryId.HasValue)
            existingEvent.CategoryId = request.CategoryId.Value;
        if (request.Capacity.HasValue)
            existingEvent.Capacity = request.Capacity.Value;
        if (!string.IsNullOrEmpty(request.Province))
            existingEvent.Province = request.Province;
        if (!string.IsNullOrEmpty(request.District))
            existingEvent.District = request.District;
        if (!string.IsNullOrEmpty(request.Ward))
            existingEvent.Ward = request.Ward;
        if (!string.IsNullOrEmpty(request.AddressDetail))
            existingEvent.AddressDetail = request.AddressDetail;
        if (!string.IsNullOrEmpty(request.OrganizerName))
            existingEvent.OrganizerName = request.OrganizerName;
        if (!string.IsNullOrEmpty(request.OrganizerInfo))
            existingEvent.OrganizerInfo = request.OrganizerInfo;

        // Update images if provided
        if (!string.IsNullOrEmpty(request.Image9x16))
        {
            try
            {
                var base64Data = request.Image9x16.Contains(",") 
                    ? request.Image9x16.Split(',')[1] 
                    : request.Image9x16;
                existingEvent.Image9x16 = Convert.FromBase64String(base64Data);
            }
            catch { /* Invalid base64, skip */ }
        }

        if (!string.IsNullOrEmpty(request.Image16x9))
        {
            try
            {
                var base64Data = request.Image16x9.Contains(",") 
                    ? request.Image16x9.Split(',')[1] 
                    : request.Image16x9;
                existingEvent.Image16x9 = Convert.FromBase64String(base64Data);
            }
            catch { /* Invalid base64, skip */ }
        }

        if (!string.IsNullOrEmpty(request.OrganizerLogo))
        {
            try
            {
                var base64Data = request.OrganizerLogo.Contains(",") 
                    ? request.OrganizerLogo.Split(',')[1] 
                    : request.OrganizerLogo;
                existingEvent.OrganizerLogo = Convert.FromBase64String(base64Data);
            }
            catch { /* Invalid base64, skip */ }
        }

        await _context.SaveChangesAsync();
        return existingEvent;
    }

    public async Task<bool> DeleteEventAsync(int id)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null)
            return false;

        _context.Events.Remove(existingEvent);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveEventAsync(int id)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null)
            return false;

        existingEvent.IsApproved = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<EventResponse>> GetEventsByUserAsync(string userId)
    {
        var events = await _context.Events
            .Include(e => e.Category)
            .Where(e => e.CreatedBy == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return events.Select(e => new EventResponse
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            Date = e.Date,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name,
            Capacity = e.Capacity,
            Location = $"{e.AddressDetail}, {e.Ward}, {e.District}, {e.Province}",
            Province = e.Province,
            District = e.District,
            Ward = e.Ward,
            AddressDetail = e.AddressDetail,
            OrganizerName = e.OrganizerName,
            OrganizerInfo = e.OrganizerInfo,
            IsApproved = e.IsApproved,
            AverageRating = e.AverageRating,
            ReviewCount = e.ReviewCount,
            ViewCount = e.ViewCount,
            CreatedAt = e.CreatedAt
        });
    }

    public async Task<bool> IncrementViewCountAsync(int eventId)
    {
        var eventData = await _context.Events.FindAsync(eventId);
        if (eventData == null)
            return false;

        eventData.ViewCount++;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<EventRevenueResponse>> GetOrganizerRevenueAsync(string userId, string timeRange)
    {
        DateTime startDate = timeRange switch
        {
            "week" => DateTime.UtcNow.AddDays(-7),
            "month" => DateTime.UtcNow.AddMonths(-1),
            "year" => DateTime.UtcNow.AddYears(-1),
            _ => DateTime.UtcNow.AddMonths(-1)
        };

        // Query từ OrderDetails, join với Ticket và Event
        var revenue = await _context.OrderDetails
            .Include(od => od.Ticket)
                .ThenInclude(t => t.Event)
            .Include(od => od.Order)
            .Where(od => od.Ticket.Event.CreatedBy == userId 
                      && od.Order.PaymentStatus == "Paid" 
                      && od.Order.CreatedAt >= startDate)
            .GroupBy(od => new { 
                EventId = od.Ticket.EventId, 
                EventName = od.Ticket.Event.Name, 
                EventDate = od.Ticket.Event.Date 
            })
            .Select(g => new EventRevenueResponse
            {
                EventId = g.Key.EventId,
                EventName = g.Key.EventName,
                TicketsSold = g.Sum(od => od.Quantity),
                Revenue = g.Sum(od => od.Price * od.Quantity),
                EventDate = g.Key.EventDate
            })
            .OrderByDescending(r => r.Revenue)
            .ToListAsync();

        return revenue;
    }
}
