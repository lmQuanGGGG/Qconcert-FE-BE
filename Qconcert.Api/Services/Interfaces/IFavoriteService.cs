using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IFavoriteService
{
    Task<IEnumerable<EventResponse>> GetFavoriteEventsByUserAsync(string userId);
    Task<bool> AddFavoriteAsync(string userId, int eventId);
    Task<bool> RemoveFavoriteAsync(string userId, int eventId);
    Task<bool> IsFavoriteAsync(string userId, int eventId);
}
