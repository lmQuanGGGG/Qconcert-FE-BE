namespace Qconcert.Api.DTOs.Response;

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserResponse User { get; set; } = null!;
}

public class UserResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Avatar { get; set; }
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedAt { get; set; }
    public IEnumerable<string> Roles { get; set; } = new List<string>();
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public object? Errors { get; set; }

    public static ApiResponse<T> SuccessResult(T data, string message = "Success")
    {
        return new ApiResponse<T> { Success = true, Message = message, Data = data };
    }

    public static ApiResponse<T> ErrorResult(string message, object? errors = null)
    {
        return new ApiResponse<T> { Success = false, Message = message, Errors = errors };
    }
}
