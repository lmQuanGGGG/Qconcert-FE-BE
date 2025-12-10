namespace Qconcert.Api.Services.Interfaces;

public interface IQRCodeService
{
    Task<string> GenerateQRCodeAsync(string token);
    Task<bool> ValidateAndCheckInAsync(string qrToken, string employeeId);
    Task<object?> GetTicketInfoByQRAsync(string qrToken);
}
