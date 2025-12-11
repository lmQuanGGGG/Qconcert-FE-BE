using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employee,Admin,Organizer")]
public class QRCodeController : ControllerBase
{
    private readonly IQRCodeService _qrCodeService;

    public QRCodeController(IQRCodeService qrCodeService)
    {
        _qrCodeService = qrCodeService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateQRCode([FromBody] string token)
    {
        try
        {
            var qrCode = await _qrCodeService.GenerateQRCodeAsync(token);
            return Ok(ApiResponse<string>.SuccessResult(qrCode));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInDto request)
    {
        try
        {
            var employeeId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(employeeId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được nhân viên"));

            var result = await _qrCodeService.ValidateAndCheckInAsync(request.QrToken, employeeId);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Check-in thành công"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("ticket-info/{qrToken}")]
    public async Task<IActionResult> GetTicketInfo(string qrToken)
    {
        try
        {
            var info = await _qrCodeService.GetTicketInfoByQRAsync(qrToken);
            if (info == null)
                return NotFound(ApiResponse<object>.ErrorResult("Không tìm thấy vé"));

            return Ok(ApiResponse<object>.SuccessResult(info));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }
}

public class CheckInDto
{
    public string QrToken { get; set; } = string.Empty;
}
