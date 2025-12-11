using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? isApproved, [FromQuery] int? categoryId, [FromQuery] string? keyword)
    {
        try
        {
            var events = await _eventService.GetAllEventsAsync(isApproved, categoryId, keyword);
            return Ok(ApiResponse<IEnumerable<EventResponse>>.SuccessResult(events));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<EventResponse>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var eventData = await _eventService.GetEventByIdAsync(id);
            if (eventData == null)
                return NotFound(ApiResponse<EventResponse>.ErrorResult("Không tìm thấy sự kiện"));

            return Ok(ApiResponse<EventResponse>.SuccessResult(eventData));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<EventResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<Event>.ErrorResult("Không xác định được người dùng"));

            var newEvent = await _eventService.CreateEventAsync(request, userId);
            
            // Trả về response nhỏ gọn, KHÔNG bao gồm ảnh
            var response = new { 
                id = newEvent.Id, 
                name = newEvent.Name,
                isApproved = newEvent.IsApproved 
            };
            
            return CreatedAtAction(nameof(GetById), new { id = newEvent.Id }, 
                ApiResponse<object>.SuccessResult(response, "Tạo sự kiện thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEventRequest request)
    {
        try
        {
            var updatedEvent = await _eventService.UpdateEventAsync(id, request);
            return Ok(ApiResponse<Event>.SuccessResult(updatedEvent, "Cập nhật sự kiện thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<Event>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Event>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _eventService.DeleteEventAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy sự kiện"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa sự kiện thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpGet("revenue")]
    public async Task<IActionResult> GetOrganizerRevenue([FromQuery] string timeRange = "month")
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<EventRevenueResponse>>.ErrorResult("Không xác định được người dùng"));

            var revenue = await _eventService.GetOrganizerRevenueAsync(userId, timeRange);
            return Ok(ApiResponse<IEnumerable<EventRevenueResponse>>.SuccessResult(revenue));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<EventRevenueResponse>>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        try
        {
            var result = await _eventService.ApproveEventAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy sự kiện"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Duyệt sự kiện thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer")]
    [HttpGet("my-events")]
    public async Task<IActionResult> GetMyEvents()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<EventResponse>>.ErrorResult("Không xác định được người dùng"));

            var events = await _eventService.GetEventsByUserAsync(userId);
            return Ok(ApiResponse<IEnumerable<EventResponse>>.SuccessResult(events));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<EventResponse>>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("{id}/view")]
    public async Task<IActionResult> IncrementViewCount(int id)
    {
        try
        {
            var result = await _eventService.IncrementViewCountAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy sự kiện"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Đã tăng lượt xem"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
