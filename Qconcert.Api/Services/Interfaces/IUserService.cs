using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IUserService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<UserResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> RefreshTokenAsync(string refreshToken);
    Task<UserResponse> GetUserByIdAsync(string userId);
    Task<UserResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
    Task<IEnumerable<UserResponse>> GetAllUsersAsync(int page = 1, int pageSize = 20);
}
