using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet("my-favorites")]
    public async Task<IActionResult> GetMyFavorites()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<EventResponse>>.ErrorResult("Không xác định được người dùng"));

            var favorites = await _favoriteService.GetFavoriteEventsByUserAsync(userId);
            return Ok(ApiResponse<IEnumerable<EventResponse>>.SuccessResult(favorites));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<EventResponse>>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("{eventId}")]
    public async Task<IActionResult> AddFavorite(int eventId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var result = await _favoriteService.AddFavoriteAsync(userId, eventId);
            return Ok(ApiResponse<bool>.SuccessResult(result, result ? "Đã thêm vào yêu thích" : "Sự kiện đã có trong danh sách yêu thích"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpDelete("{eventId}")]
    public async Task<IActionResult> RemoveFavorite(int eventId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var result = await _favoriteService.RemoveFavoriteAsync(userId, eventId);
            return Ok(ApiResponse<bool>.SuccessResult(result, result ? "Đã xóa khỏi yêu thích" : "Sự kiện không có trong danh sách yêu thích"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{eventId}/check")]
    public async Task<IActionResult> CheckFavorite(int eventId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var isFavorite = await _favoriteService.IsFavoriteAsync(userId, eventId);
            return Ok(ApiResponse<bool>.SuccessResult(isFavorite));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
