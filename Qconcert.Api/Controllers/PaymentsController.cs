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
    private readonly IConfiguration _configuration;

    public PaymentsController(IPaymentService paymentService, IConfiguration configuration)
    {
        _paymentService = paymentService;
        _configuration = configuration;
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

    [AllowAnonymous]
    [HttpGet("payos-return")]
    public async Task<IActionResult> PayOSReturn([FromQuery] string? orderCode, [FromQuery] string? status, [FromQuery] string? code)
    {
        try
        {
            Console.WriteLine($"=== PayOS Callback Received ===");
            Console.WriteLine($"OrderCode: {orderCode}");
            Console.WriteLine($"Status: {status}");
            Console.WriteLine($"Code: {code}");
            
            // PayOS returns 'code' parameter with values: '00' = success, others = failed
            if (!string.IsNullOrEmpty(orderCode) && (status == "PAID" || code == "00"))
            {
                var order = await _paymentService.GetOrderByPaymentCodeAsync(orderCode);
                
                if (order != null)
                {
                    Console.WriteLine($"Found order: {order.OrderId}, updating status...");
                    await _paymentService.UpdatePaymentStatusAfterCallbackAsync(order.OrderId, "Paid");
                    Console.WriteLine("Status updated successfully");
                    
                    // Gửi email với QR code vé sau khi thanh toán thành công
                    Console.WriteLine("Sending ticket email with QR codes...");
                    await _paymentService.SendTicketEmailAsync(order.OrderId);
                    Console.WriteLine("Email sent successfully");
                    
                    return Redirect($"{_configuration["FrontendUrl"]}/orders/{order.OrderId}/success?payment=success");
                }
                else
                {
                    Console.WriteLine($"Order not found for orderCode: {orderCode}");
                }
            }
            
            Console.WriteLine("Payment failed or invalid parameters");
            return Redirect($"{_configuration["FrontendUrl"]}/checkout?payment=failed");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"PayOS callback error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return Redirect($"{_configuration["FrontendUrl"]}/checkout?payment=error");
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
