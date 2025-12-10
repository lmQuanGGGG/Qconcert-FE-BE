using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface ICartService
{
    Task<CartResponse> GetCartAsync(string sessionId);
    Task<bool> AddToCartAsync(string sessionId, int ticketId, int quantity);
    Task<bool> UpdateCartItemAsync(string sessionId, int ticketId, int quantity);
    Task<bool> RemoveFromCartAsync(string sessionId, int ticketId);
    Task<bool> ClearCartAsync(string sessionId);
}
