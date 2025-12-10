using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        try
        {
            var stats = await _adminService.GetStatisticsAsync();
            return Ok(ApiResponse<StatisticsResponse>.SuccessResult(stats));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<StatisticsResponse>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var revenue = await _adminService.GetRevenueByDateAsync(startDate, endDate);
            return Ok(ApiResponse<IEnumerable<RevenueByDateResponse>>.SuccessResult(revenue));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<RevenueByDateResponse>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("top-events")]
    public async Task<IActionResult> GetTopEvents([FromQuery] int top = 10)
    {
        try
        {
            var events = await _adminService.GetTopEventsAsync(top);
            return Ok(ApiResponse<IEnumerable<object>>.SuccessResult(events));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<object>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("pending-events")]
    public async Task<IActionResult> GetPendingEvents()
    {
        try
        {
            var events = await _adminService.GetPendingEventsAsync();
            return Ok(ApiResponse<IEnumerable<object>>.SuccessResult(events));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<object>>.ErrorResult(ex.Message));
        }
    }
}
