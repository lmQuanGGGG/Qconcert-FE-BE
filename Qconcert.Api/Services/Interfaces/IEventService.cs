using Qconcert.Api.DTOs.Request;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;

namespace Qconcert.Api.Services.Interfaces;

public interface IEventService
{
    Task<IEnumerable<EventResponse>> GetAllEventsAsync(bool? isApproved = null, int? categoryId = null);
    Task<EventResponse?> GetEventByIdAsync(int id);
    Task<Event> CreateEventAsync(CreateEventRequest request, string createdBy);
    Task<Event> UpdateEventAsync(int id, UpdateEventRequest request);
    Task<bool> DeleteEventAsync(int id);
    Task<bool> ApproveEventAsync(int id);
    Task<IEnumerable<EventResponse>> GetEventsByUserAsync(string userId);
}
