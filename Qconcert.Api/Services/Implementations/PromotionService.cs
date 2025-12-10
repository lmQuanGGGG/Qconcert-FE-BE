using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class PromotionService : IPromotionService
{
    private readonly ApplicationDbContext _context;

    public PromotionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PromotionPackage>> GetPromotionsByEventAsync(int eventId)
    {
        return await _context.PromotionPackages
            .Where(p => p.EventId == eventId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PromotionPackage>> GetPromotionsByUserAsync(string userId)
    {
        return await _context.PromotionPackages
            .Include(p => p.Event)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PromotionPackage>> GetPendingPromotionsAsync()
    {
        return await _context.PromotionPackages
            .Include(p => p.Event)
            .Include(p => p.User)
            .Where(p => p.Status == PromotionStatus.Pending)
            .OrderBy(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<PromotionPackage?> GetPromotionByIdAsync(int id)
    {
        return await _context.PromotionPackages
            .Include(p => p.Event)
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PromotionPackage> CreatePromotionRequestAsync(PromotionPackage promotion)
    {
        promotion.Status = PromotionStatus.Pending;
        promotion.IsPaid = false;
        promotion.CreatedAt = DateTime.UtcNow;

        _context.PromotionPackages.Add(promotion);
        await _context.SaveChangesAsync();
        return promotion;
    }

    public async Task<bool> ApprovePromotionAsync(int id)
    {
        var promotion = await _context.PromotionPackages.FindAsync(id);
        if (promotion == null)
            return false;

        promotion.Status = PromotionStatus.Approved;
        promotion.ActualStartDate = promotion.RequestedStartDate;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectPromotionAsync(int id, string reason)
    {
        var promotion = await _context.PromotionPackages.FindAsync(id);
        if (promotion == null)
            return false;

        promotion.Status = PromotionStatus.Rejected;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ConfirmPaymentAsync(int id, string transactionId)
    {
        var promotion = await _context.PromotionPackages.FindAsync(id);
        if (promotion == null || promotion.Status != PromotionStatus.Approved)
            return false;

        promotion.IsPaid = true;
        promotion.Status = PromotionStatus.Paid;
        promotion.TransactionId = transactionId;
        promotion.PaymentDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<PromotionPackage>> GetActivePromotionsByTypeAsync(PromotionType type)
    {
        var now = DateTime.UtcNow;
        return await _context.PromotionPackages
            .Include(p => p.Event)
            .Where(p => p.Type == type 
                && p.Status == PromotionStatus.Paid 
                && p.ActualStartDate <= now
                && p.ActualStartDate!.Value.AddDays(p.DurationInDays) >= now)
            .OrderByDescending(p => p.ActualStartDate)
            .ToListAsync();
    }
}
