namespace Qconcert.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
}
