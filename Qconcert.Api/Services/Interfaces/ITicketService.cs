using Qconcert.Api.DTOs.Request;
using Qconcert.Api.Models;

namespace Qconcert.Api.Services.Interfaces;

public interface ITicketService
{
    Task<IEnumerable<Ticket>> GetTicketsByEventIdAsync(int eventId);
    Task<Ticket?> GetTicketByIdAsync(int id);
    Task<Ticket> CreateTicketAsync(CreateTicketRequest request);
    Task<Ticket> UpdateTicketAsync(int id, CreateTicketRequest request);
    Task<bool> DeleteTicketAsync(int id);
    Task<bool> CheckAvailabilityAsync(int ticketId, int quantity);
}
