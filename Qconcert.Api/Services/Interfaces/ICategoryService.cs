using Qconcert.Api.Models;

namespace Qconcert.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(int id);
    Task<Category> CreateCategoryAsync(Category category);
    Task<Category> UpdateCategoryAsync(int id, Category category);
    Task<bool> DeleteCategoryAsync(int id);
}
