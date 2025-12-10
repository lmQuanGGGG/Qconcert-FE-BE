using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetByEventId(int eventId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var reviews = await _reviewService.GetReviewsByEventIdAsync(eventId, page, pageSize);
            return Ok(ApiResponse<IEnumerable<ReviewResponse>>.SuccessResult(reviews));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<ReviewResponse>>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<ReviewResponse>.ErrorResult("Không xác định được người dùng"));

            var review = await _reviewService.CreateReviewAsync(request, userId);
            return Ok(ApiResponse<ReviewResponse>.SuccessResult(review, "Tạo đánh giá thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ReviewResponse>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<ReviewResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpPut("{reviewId}")]
    public async Task<IActionResult> Update(int reviewId, [FromBody] CreateReviewRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<ReviewResponse>.ErrorResult("Không xác định được người dùng"));

            var review = await _reviewService.UpdateReviewAsync(reviewId, request, userId);
            return Ok(ApiResponse<ReviewResponse>.SuccessResult(review, "Cập nhật đánh giá thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<ReviewResponse>.ErrorResult(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<ReviewResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("{reviewId}")]
    public async Task<IActionResult> Delete(int reviewId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var result = await _reviewService.DeleteReviewAsync(reviewId, userId);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy đánh giá"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa đánh giá thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
