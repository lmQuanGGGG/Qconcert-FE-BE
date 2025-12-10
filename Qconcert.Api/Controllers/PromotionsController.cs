using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly IPromotionService _promotionService;

    public PromotionsController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetByEventId(int eventId)
    {
        try
        {
            var promotions = await _promotionService.GetPromotionsByEventAsync(eventId);
            return Ok(ApiResponse<IEnumerable<PromotionPackage>>.SuccessResult(promotions));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<PromotionPackage>>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpGet("my-promotions")]
    public async Task<IActionResult> GetMyPromotions()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<PromotionPackage>>.ErrorResult("Không xác định được người dùng"));

            var promotions = await _promotionService.GetPromotionsByUserAsync(userId);
            return Ok(ApiResponse<IEnumerable<PromotionPackage>>.SuccessResult(promotions));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<PromotionPackage>>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        try
        {
            var promotions = await _promotionService.GetPendingPromotionsAsync();
            return Ok(ApiResponse<IEnumerable<PromotionPackage>>.SuccessResult(promotions));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<PromotionPackage>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var promotion = await _promotionService.GetPromotionByIdAsync(id);
            if (promotion == null)
                return NotFound(ApiResponse<PromotionPackage>.ErrorResult("Không tìm thấy gói quảng cáo"));

            return Ok(ApiResponse<PromotionPackage>.SuccessResult(promotion));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<PromotionPackage>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PromotionPackage promotion)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<PromotionPackage>.ErrorResult("Không xác định được người dùng"));

            promotion.UserId = userId;
            var result = await _promotionService.CreatePromotionRequestAsync(promotion);
            return Ok(ApiResponse<PromotionPackage>.SuccessResult(result, "Tạo yêu cầu quảng cáo thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<PromotionPackage>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var result = await _promotionService.ApprovePromotionAsync(id);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Phê duyệt quảng cáo thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] string reason)
    {
        try
        {
            var result = await _promotionService.RejectPromotionAsync(id, reason);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Từ chối quảng cáo thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("{id}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(int id, [FromBody] string transactionId)
    {
        try
        {
            var result = await _promotionService.ConfirmPaymentAsync(id, transactionId);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Xác nhận thanh toán thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("active/{type}")]
    public async Task<IActionResult> GetActiveByType(PromotionType type)
    {
        try
        {
            var promotions = await _promotionService.GetActivePromotionsByTypeAsync(type);
            return Ok(ApiResponse<IEnumerable<PromotionPackage>>.SuccessResult(promotions));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<PromotionPackage>>.ErrorResult(ex.Message));
        }
    }
}
