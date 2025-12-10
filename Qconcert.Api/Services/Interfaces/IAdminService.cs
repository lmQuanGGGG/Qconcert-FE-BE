using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IAdminService
{
    Task<StatisticsResponse> GetStatisticsAsync();
    Task<IEnumerable<RevenueByDateResponse>> GetRevenueByDateAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<object>> GetTopEventsAsync(int top = 10);
    Task<IEnumerable<object>> GetPendingEventsAsync();
}
