using Qconcert.Api.Models;

namespace Qconcert.Api.Services.Interfaces;

public interface IDiscountService
{
    Task<IEnumerable<Discount>> GetAllDiscountsAsync();
    Task<IEnumerable<Discount>> GetActiveDiscountsAsync();
    Task<Discount?> GetDiscountByIdAsync(int id);
    Task<Discount?> GetDiscountByCodeAsync(string code);
    Task<Discount> CreateDiscountAsync(Discount discount);
    Task<Discount> UpdateDiscountAsync(int id, Discount discount);
    Task<bool> DeleteDiscountAsync(int id);
    Task<decimal> CalculateDiscountAsync(string code, decimal orderAmount);
    Task<bool> ApplyDiscountAsync(string code, int orderId);
}
