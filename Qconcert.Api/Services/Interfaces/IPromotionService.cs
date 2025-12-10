using Qconcert.Api.Models;

namespace Qconcert.Api.Services.Interfaces;

public interface IPromotionService
{
    Task<IEnumerable<PromotionPackage>> GetPromotionsByEventAsync(int eventId);
    Task<IEnumerable<PromotionPackage>> GetPromotionsByUserAsync(string userId);
    Task<IEnumerable<PromotionPackage>> GetPendingPromotionsAsync();
    Task<PromotionPackage?> GetPromotionByIdAsync(int id);
    Task<PromotionPackage> CreatePromotionRequestAsync(PromotionPackage promotion);
    Task<bool> ApprovePromotionAsync(int id);
    Task<bool> RejectPromotionAsync(int id, string reason);
    Task<bool> ConfirmPaymentAsync(int id, string transactionId);
    Task<IEnumerable<PromotionPackage>> GetActivePromotionsByTypeAsync(PromotionType type);
}
