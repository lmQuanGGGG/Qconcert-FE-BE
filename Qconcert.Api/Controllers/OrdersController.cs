using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<OrderResponse>.ErrorResult("Không xác định được người dùng"));

            var order = await _orderService.CreateOrderAsync(request, userId);
            return Ok(ApiResponse<OrderResponse>.SuccessResult(order, "Tạo đơn hàng thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<OrderResponse>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<OrderResponse>>.ErrorResult("Không xác định được người dùng"));

            var orders = await _orderService.GetOrdersByUserAsync(userId);
            return Ok(ApiResponse<IEnumerable<OrderResponse>>.SuccessResult(orders));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<OrderResponse>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(int orderId)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return NotFound(ApiResponse<OrderResponse>.ErrorResult("Không tìm thấy đơn hàng"));

            return Ok(ApiResponse<OrderResponse>.SuccessResult(order));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<OrderResponse>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin,Employee")]
    [HttpPut("{orderId}/status")]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] string status)
    {
        try
        {
            var result = await _orderService.UpdateOrderStatusAsync(orderId, status);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy đơn hàng"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Cập nhật trạng thái thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
