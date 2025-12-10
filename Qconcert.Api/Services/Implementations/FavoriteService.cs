using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class FavoriteService : IFavoriteService
{
    private readonly ApplicationDbContext _context;

    public FavoriteService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EventResponse>> GetFavoriteEventsByUserAsync(string userId)
    {
        var favorites = await _context.Favorites
            .Include(f => f.Event)
            .ThenInclude(e => e.Category)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return favorites.Select(f => new EventResponse
        {
            Id = f.Event.Id,
            Name = f.Event.Name,
            Description = f.Event.Description,
            Date = f.Event.Date,
            CategoryId = f.Event.CategoryId,
            CategoryName = f.Event.Category?.Name,
            Capacity = f.Event.Capacity,
            Location = $"{f.Event.AddressDetail}, {f.Event.Ward}, {f.Event.District}, {f.Event.Province}",
            Province = f.Event.Province,
            District = f.Event.District,
            Ward = f.Event.Ward,
            AddressDetail = f.Event.AddressDetail,
            OrganizerName = f.Event.OrganizerName,
            OrganizerInfo = f.Event.OrganizerInfo,
            IsApproved = f.Event.IsApproved,
            AverageRating = f.Event.AverageRating,
            ReviewCount = f.Event.ReviewCount,
            ViewCount = f.Event.ViewCount,
            CreatedAt = f.Event.CreatedAt
        });
    }

    public async Task<bool> AddFavoriteAsync(string userId, int eventId)
    {
        var existing = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.EventId == eventId);

        if (existing != null)
            return false;

        var favorite = new Favorite
        {
            UserId = userId,
            EventId = eventId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveFavoriteAsync(string userId, int eventId)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.EventId == eventId);

        if (favorite == null)
            return false;

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsFavoriteAsync(string userId, int eventId)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.EventId == eventId);
    }
}
