using System.ComponentModel.DataAnnotations;

namespace Qconcert.Api.DTOs.Request;

public class CartItemRequest
{
    [Required]
    public int TicketId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}

public class AddToCartRequest
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public List<CartItemRequest> Items { get; set; } = new();
}

public class UpdateCartItemRequest
{
    [Required]
    public int TicketId { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
}

public class UploadImageRequest
{
    [Required]
    public IFormFile Image { get; set; } = null!;
    
    public string? Description { get; set; }
}

public class UpdateEventImagesRequest
{
    public IFormFile? Image9x16 { get; set; }
    public IFormFile? Image16x9 { get; set; }
}

public class UpdateTicketImageRequest
{
    [Required]
    public IFormFile HinhAnhVe { get; set; } = null!;
}

public class SearchEventsRequest
{
    public string? Keyword { get; set; }
    public int? CategoryId { get; set; }
    public string? Province { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsApproved { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class CreatePaymentInfoRequest
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public string BankName { get; set; } = string.Empty;
    
    [Required]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    public string AccountHolder { get; set; } = string.Empty;
    
    public string? Branch { get; set; }
}

public class BulkCreateTicketsRequest
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public List<CreateTicketRequest> Tickets { get; set; } = new();
}
