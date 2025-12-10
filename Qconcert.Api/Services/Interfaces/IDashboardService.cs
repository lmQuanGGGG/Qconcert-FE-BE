using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponse> GetAdminDashboardAsync();
    Task<OrganizerDashboardResponse> GetOrganizerDashboardAsync(string userId);
    Task<EmployeeDashboardResponse> GetEmployeeDashboardAsync(string userId);
    Task<HomeIndexResponse> GetHomeIndexDataAsync();
    Task<EventDetailResponse> GetEventDetailAsync(int eventId, string? userId = null);
}
