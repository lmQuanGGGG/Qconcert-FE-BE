using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<Notification>>.ErrorResult("Không xác định được người dùng"));

            var notifications = await _notificationService.GetNotificationsByUserAsync(userId);
            return Ok(ApiResponse<IEnumerable<Notification>>.SuccessResult(notifications));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<Notification>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<int>.ErrorResult("Không xác định được người dùng"));

            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(ApiResponse<int>.SuccessResult(count));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<int>.ErrorResult(ex.Message));
        }
    }

    [HttpPut("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var result = await _notificationService.MarkAsReadAsync(notificationId, userId);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Đánh dấu đã đọc thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var result = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Đánh dấu tất cả đã đọc thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
