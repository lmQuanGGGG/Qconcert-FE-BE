using Microsoft.AspNetCore.Mvc;
using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(ApiResponse<object>.SuccessResult(new 
        { 
            Status = "Healthy", 
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0"
        }, "Qconcert REST API is running"));
    }
}
