using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountsController : ControllerBase
{
    private readonly IDiscountService _discountService;

    public DiscountsController(IDiscountService discountService)
    {
        _discountService = discountService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var discounts = await _discountService.GetAllDiscountsAsync();
            return Ok(ApiResponse<IEnumerable<Discount>>.SuccessResult(discounts));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<Discount>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        try
        {
            var discounts = await _discountService.GetActiveDiscountsAsync();
            return Ok(ApiResponse<IEnumerable<Discount>>.SuccessResult(discounts));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<Discount>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var discount = await _discountService.GetDiscountByIdAsync(id);
            if (discount == null)
                return NotFound(ApiResponse<Discount>.ErrorResult("Không tìm thấy mã giảm giá"));

            return Ok(ApiResponse<Discount>.SuccessResult(discount));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Discount>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        try
        {
            var discount = await _discountService.GetDiscountByCodeAsync(code);
            if (discount == null)
                return NotFound(ApiResponse<Discount>.ErrorResult("Không tìm thấy mã giảm giá"));

            return Ok(ApiResponse<Discount>.SuccessResult(discount));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Discount>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Discount discount)
    {
        try
        {
            var result = await _discountService.CreateDiscountAsync(discount);
            return Ok(ApiResponse<Discount>.SuccessResult(result, "Tạo mã giảm giá thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Discount>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Discount discount)
    {
        try
        {
            var result = await _discountService.UpdateDiscountAsync(id, discount);
            return Ok(ApiResponse<Discount>.SuccessResult(result, "Cập nhật mã giảm giá thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<Discount>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Discount>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _discountService.DeleteDiscountAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy mã giảm giá"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa mã giảm giá thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> CalculateDiscount([FromBody] CalculateDiscountDto request)
    {
        try
        {
            var discountAmount = await _discountService.CalculateDiscountAsync(request.Code, request.OrderAmount);
            return Ok(ApiResponse<decimal>.SuccessResult(discountAmount));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<decimal>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<decimal>.ErrorResult(ex.Message));
        }
    }
}

public class CalculateDiscountDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}
