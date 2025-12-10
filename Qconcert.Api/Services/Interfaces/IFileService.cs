using Qconcert.Api.DTOs.Response;

namespace Qconcert.Api.Services.Interfaces;

public interface IFileService
{
    Task<ImageUploadResponse> UploadImageAsync(IFormFile file, string folder);
    Task<bool> DeleteImageAsync(string filePath);
    Task<byte[]> GetImageBytesAsync(string filePath);
    string GetImageBase64(byte[] imageBytes);
}
