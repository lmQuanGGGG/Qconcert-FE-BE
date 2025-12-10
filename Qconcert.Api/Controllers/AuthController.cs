using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _userService.RegisterAsync(request);
            return Ok(ApiResponse<UserResponse>.SuccessResult(result, "Đăng ký thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _userService.LoginAsync(request);
            return Ok(ApiResponse<LoginResponse>.SuccessResult(result, "Đăng nhập thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<LoginResponse>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<LoginResponse>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _userService.RefreshTokenAsync(request.RefreshToken);
            return Ok(ApiResponse<LoginResponse>.SuccessResult(result, "Làm mới token thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<LoginResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<UserResponse>.ErrorResult("Không xác định được người dùng"));

            var result = await _userService.GetUserByIdAsync(userId);
            return Ok(ApiResponse<UserResponse>.SuccessResult(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<UserResponse>.ErrorResult("Không xác định được người dùng"));

            var result = await _userService.UpdateProfileAsync(userId, request);
            return Ok(ApiResponse<UserResponse>.SuccessResult(result, "Cập nhật thông tin thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResult("Không xác định được người dùng"));

            var result = await _userService.ChangePasswordAsync(userId, request);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Đổi mật khẩu thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
