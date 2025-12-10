using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("create-payment")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto request)
    {
        try
        {
            var payment = await _paymentService.CreatePaymentUrlAsync(
                request.OrderId, 
                request.ReturnUrl, 
                request.CancelUrl
            );
            return Ok(ApiResponse<PaymentResponse>.SuccessResult(payment, "Tạo link thanh toán thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<PaymentResponse>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<PaymentResponse>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("verify/{transactionId}")]
    public async Task<IActionResult> VerifyPayment(string transactionId)
    {
        try
        {
            var result = await _paymentService.VerifyPaymentAsync(transactionId);
            return Ok(ApiResponse<bool>.SuccessResult(result, result ? "Thanh toán thành công" : "Thanh toán thất bại"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("confirm-bank-transfer")]
    public async Task<IActionResult> ConfirmBankTransfer([FromBody] BankTransferDto request)
    {
        try
        {
            var result = await _paymentService.ConfirmBankTransferAsync(request.OrderId, request.ImagePath);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Xác nhận chuyển khoản thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}

public class CreatePaymentDto
{
    public int OrderId { get; set; }
    public string ReturnUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}

public class BankTransferDto
{
    public int OrderId { get; set; }
    public string ImagePath { get; set; } = string.Empty;
}
