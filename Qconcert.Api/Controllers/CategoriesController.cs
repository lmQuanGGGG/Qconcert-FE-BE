using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Qconcert.Api.DTOs.Response;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(ApiResponse<IEnumerable<Category>>.SuccessResult(categories));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<IEnumerable<Category>>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
                return NotFound(ApiResponse<Category>.ErrorResult("Không tìm thấy danh mục"));

            return Ok(ApiResponse<Category>.SuccessResult(category));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Category>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Category category)
    {
        try
        {
            var result = await _categoryService.CreateCategoryAsync(category);
            return Ok(ApiResponse<Category>.SuccessResult(result, "Tạo danh mục thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Category>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Category category)
    {
        try
        {
            var result = await _categoryService.UpdateCategoryAsync(id, category);
            return Ok(ApiResponse<Category>.SuccessResult(result, "Cập nhật danh mục thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<Category>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<Category>.ErrorResult(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _categoryService.DeleteCategoryAsync(id);
            if (!result)
                return NotFound(ApiResponse<bool>.ErrorResult("Không tìm thấy danh mục"));

            return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa danh mục thành công"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
        }
    }
}
