using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetByEventId(int eventId)
    {
        try
        {
            var tickets = await _ticketService.GetTicketsByEventIdAsync(eventId);
            return Ok(ApiResponse<IEnumerable<Ticket>>.SuccessResult(tickets));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<Ticket>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null)
                return NotFound(ApiResponse<Ticket>.ErrorResult("Không tìm thấy vé"));

            return Ok(ApiResponse<Ticket>.SuccessResult(ticket));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Ticket>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.CreateTicketAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, 
                ApiResponse<Ticket>.SuccessResult(ticket, "Tạo vé thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Ticket>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.UpdateTicketAsync(id, request);
            return Ok(ApiResponse<Ticket>.SuccessResult(ticket, "Cập nhật vé thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<Ticket>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Ticket>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Organizer,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _ticketService.DeleteTicketAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy vé"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa vé thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{id}/check-availability")]
    public async Task<IActionResult> CheckAvailability(int id, [FromQuery] int quantity)
    {
        try
        {
            var isAvailable = await _ticketService.CheckAvailabilityAsync(id, quantity);
            return Ok(ApiResponse<bool>.SuccessResult(isAvailable));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
