using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;

    public ReviewService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ReviewResponse>> GetReviewsByEventIdAsync(int eventId, int page = 1, int pageSize = 10)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return reviews.Select(r => new ReviewResponse
        {
            ReviewId = r.ReviewId,
            EventId = r.EventId,
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "Unknown",
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<ReviewResponse?> GetReviewByIdAsync(int reviewId)
    {
        var review = await _context.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.ReviewId == reviewId);

        if (review == null)
            return null;

        return new ReviewResponse
        {
            ReviewId = review.ReviewId,
            EventId = review.EventId,
            UserId = review.UserId,
            UserName = review.User?.FullName ?? "Unknown",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<ReviewResponse> CreateReviewAsync(CreateReviewRequest request, string userId)
    {
        // Check if user already reviewed
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.EventId == request.EventId && r.UserId == userId);

        if (existingReview != null)
            throw new InvalidOperationException("Bạn đã đánh giá sự kiện này rồi");

        var review = new Review
        {
            EventId = request.EventId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Update event average rating
        await UpdateEventRatingAsync(request.EventId);

        var user = await _context.Users.FindAsync(userId);
        return new ReviewResponse
        {
            ReviewId = review.ReviewId,
            EventId = review.EventId,
            UserId = review.UserId,
            UserName = user?.FullName ?? "Unknown",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<ReviewResponse> UpdateReviewAsync(int reviewId, CreateReviewRequest request, string userId)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null)
            throw new KeyNotFoundException("Không tìm thấy đánh giá");

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa đánh giá này");

        review.Rating = request.Rating;
        review.Comment = request.Comment;
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await UpdateEventRatingAsync(review.EventId);

        var user = await _context.Users.FindAsync(userId);
        return new ReviewResponse
        {
            ReviewId = review.ReviewId,
            EventId = review.EventId,
            UserId = review.UserId,
            UserName = user?.FullName ?? "Unknown",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<bool> DeleteReviewAsync(int reviewId, string userId)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null)
            return false;

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa đánh giá này");

        var eventId = review.EventId;
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        await UpdateEventRatingAsync(eventId);

        return true;
    }

    private async Task UpdateEventRatingAsync(int eventId)
    {
        var eventData = await _context.Events.FindAsync(eventId);
        if (eventData == null)
            return;

        var reviews = await _context.Reviews
            .Where(r => r.EventId == eventId)
            .ToListAsync();

        eventData.ReviewCount = reviews.Count;
        eventData.AverageRating = reviews.Any() 
            ? (decimal)reviews.Average(r => r.Rating) 
            : 0;

        await _context.SaveChangesAsync();
    }
}
