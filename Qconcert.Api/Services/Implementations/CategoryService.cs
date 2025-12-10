using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(int id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<Category> CreateCategoryAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateCategoryAsync(int id, Category category)
    {
        var existing = await _context.Categories.FindAsync(id);
        if (existing == null)
            throw new KeyNotFoundException("Không tìm thấy danh mục");

        existing.Name = category.Name;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
