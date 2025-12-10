using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class DiscountService : IDiscountService
{
    private readonly ApplicationDbContext _context;

    public DiscountService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Discount>> GetAllDiscountsAsync()
    {
        return await _context.Discounts
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Discount>> GetActiveDiscountsAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.Discounts
            .Where(d => d.IsActive 
                && d.ExpiryDate > now
                && (d.UsageLimit == null || d.UsageCount < d.UsageLimit))
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<Discount?> GetDiscountByIdAsync(int id)
    {
        return await _context.Discounts.FindAsync(id);
    }

    public async Task<Discount?> GetDiscountByCodeAsync(string code)
    {
        return await _context.Discounts
            .FirstOrDefaultAsync(d => d.Code == code.ToUpper());
    }

    public async Task<Discount> CreateDiscountAsync(Discount discount)
    {
        discount.Code = discount.Code.ToUpper();
        discount.UsageCount = 0;
        discount.CreatedAt = DateTime.UtcNow;

        _context.Discounts.Add(discount);
        await _context.SaveChangesAsync();
        return discount;
    }

    public async Task<Discount> UpdateDiscountAsync(int id, Discount discount)
    {
        var existing = await _context.Discounts.FindAsync(id);
        if (existing == null)
            throw new KeyNotFoundException("Không tìm thấy mã giảm giá");

        existing.Percentage = discount.Percentage;
        existing.MaxDiscountAmount = discount.MaxDiscountAmount;
        existing.MinOrderAmount = discount.MinOrderAmount;
        existing.ExpiryDate = discount.ExpiryDate;
        existing.UsageLimit = discount.UsageLimit;
        existing.IsActive = discount.IsActive;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteDiscountAsync(int id)
    {
        var discount = await _context.Discounts.FindAsync(id);
        if (discount == null)
            return false;

        _context.Discounts.Remove(discount);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> CalculateDiscountAsync(string code, decimal orderAmount)
    {
        var discount = await GetDiscountByCodeAsync(code);
        
        if (discount == null || !discount.IsActive)
            throw new InvalidOperationException("Mã giảm giá không hợp lệ");

        if (discount.ExpiryDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Mã giảm giá đã hết hạn");

        if (discount.UsageLimit.HasValue && discount.UsageCount >= discount.UsageLimit.Value)
            throw new InvalidOperationException("Mã giảm giá đã hết lượt sử dụng");

        if (orderAmount < discount.MinOrderAmount)
            throw new InvalidOperationException($"Đơn hàng phải từ {discount.MinOrderAmount:N0} VNĐ trở lên");

        var discountAmount = orderAmount * discount.Percentage / 100;
        
        if (discount.MaxDiscountAmount.HasValue && discountAmount > discount.MaxDiscountAmount.Value)
            discountAmount = discount.MaxDiscountAmount.Value;

        return discountAmount;
    }

    public async Task<bool> ApplyDiscountAsync(string code, int orderId)
    {
        var discount = await GetDiscountByCodeAsync(code);
        if (discount == null)
            return false;

        discount.UsageCount++;
        await _context.SaveChangesAsync();
        return true;
    }
}
