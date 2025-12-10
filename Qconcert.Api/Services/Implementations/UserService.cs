using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Qconcert.Api.Services.Implementations;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public UserService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _context = context;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = GenerateAccessToken(user, roles);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        var expirationMinutes = _configuration.GetValue<int>("JwtSettings:ExpirationInMinutes");
        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
            User = new UserResponse
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Avatar = user.Avatar,
                LoyaltyPoints = user.LoyaltyPoints,
                CreatedAt = user.CreatedAt,
                Roles = roles
            }
        };
    }

    public async Task<UserResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email đã được sử dụng");

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            LoyaltyPoints = 0
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, "Customer");
        var roles = await _userManager.GetRolesAsync(user);

        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Avatar = user.Avatar,
            LoyaltyPoints = user.LoyaltyPoints,
            CreatedAt = user.CreatedAt,
            Roles = roles
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh token không hợp lệ");

        var roles = await _userManager.GetRolesAsync(user);
        var newAccessToken = GenerateAccessToken(user, roles);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        var expirationMinutes = _configuration.GetValue<int>("JwtSettings:ExpirationInMinutes");
        return new LoginResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
            User = new UserResponse
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Avatar = user.Avatar,
                LoyaltyPoints = user.LoyaltyPoints,
                CreatedAt = user.CreatedAt,
                Roles = roles
            }
        };
    }

    public async Task<UserResponse> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy người dùng");

        var roles = await _userManager.GetRolesAsync(user);
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Avatar = user.Avatar,
            LoyaltyPoints = user.LoyaltyPoints,
            CreatedAt = user.CreatedAt,
            Roles = roles
        };
    }

    public async Task<UserResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy người dùng");

        if (!string.IsNullOrEmpty(request.FullName))
            user.FullName = request.FullName;
        if (!string.IsNullOrEmpty(request.PhoneNumber))
            user.PhoneNumber = request.PhoneNumber;
        if (!string.IsNullOrEmpty(request.Avatar))
            user.Avatar = request.Avatar;

        await _userManager.UpdateAsync(user);
        var roles = await _userManager.GetRolesAsync(user);

        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Avatar = user.Avatar,
            LoyaltyPoints = user.LoyaltyPoints,
            CreatedAt = user.CreatedAt,
            Roles = roles
        };
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("Không tìm thấy người dùng");

        var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return true;
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync(int page = 1, int pageSize = 20)
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userResponses = new List<UserResponse>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userResponses.Add(new UserResponse
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Avatar = user.Avatar,
                LoyaltyPoints = user.LoyaltyPoints,
                CreatedAt = user.CreatedAt,
                Roles = roles
            });
        }

        return userResponses;
    }

    private string GenerateAccessToken(User user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expirationMinutes = _configuration.GetValue<int>("JwtSettings:ExpirationInMinutes");

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
