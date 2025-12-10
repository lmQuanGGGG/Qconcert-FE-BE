using Qconcert.Api.Models;

namespace Qconcert.Api.Services.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<Notification>> GetNotificationsByUserAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task CreateNotificationAsync(string userId, string title, string message, string? link = null);
}
