using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewResponse>> GetReviewsByEventIdAsync(int eventId, int page = 1, int pageSize = 10);
    Task<ReviewResponse?> GetReviewByIdAsync(int reviewId);
    Task<ReviewResponse> CreateReviewAsync(CreateReviewRequest request, string userId);
    Task<ReviewResponse> UpdateReviewAsync(int reviewId, CreateReviewRequest request, string userId);
    Task<bool> DeleteReviewAsync(int reviewId, string userId);
}
