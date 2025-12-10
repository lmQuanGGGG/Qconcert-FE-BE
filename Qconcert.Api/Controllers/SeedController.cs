using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Qconcert.Api.Data;
using Qconcert.Api.Models;

namespace Qconcert.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public SeedController(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpPost("data")]
    public async Task<IActionResult> SeedData()
    {
        try
        {
            // 1. Tạo Roles
            var roles = new[] { "Admin", "Organizer", "Employee", "Customer" };
            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. Tạo Admin user
            var admin = await _userManager.FindByEmailAsync("admin@qconcert.com");
            if (admin == null)
            {
                admin = new User
                {
                    UserName = "admin@qconcert.com",
                    Email = "admin@qconcert.com",
                    FullName = "Admin Qconcert",
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await _userManager.CreateAsync(admin, "Admin@123");
                await _userManager.AddToRoleAsync(admin, "Admin");
            }

            // 3. Tạo Organizer user
            var organizer = await _userManager.FindByEmailAsync("organizer@qconcert.com");
            if (organizer == null)
            {
                organizer = new User
                {
                    UserName = "organizer@qconcert.com",
                    Email = "organizer@qconcert.com",
                    FullName = "Công ty sự kiện ABC",
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await _userManager.CreateAsync(organizer, "Organizer@123");
                await _userManager.AddToRoleAsync(organizer, "Organizer");
            }

            // 4. Tạo Categories
            if (!_context.Categories.Any())
            {
                var categories = new[]
                {
                    new Category { Name = "Âm nhạc", Description = "Sự kiện ca nhạc, hòa nhạc" },
                    new Category { Name = "Thể thao", Description = "Giải đấu thể thao, thi đấu" },
                    new Category { Name = "Hội thảo", Description = "Hội nghị, workshop, seminar" },
                    new Category { Name = "Triển lãm", Description = "Triển lãm nghệ thuật, công nghệ" },
                    new Category { Name = "Lễ hội", Description = "Lễ hội văn hóa, ẩm thực" }
                };
                _context.Categories.AddRange(categories);
                await _context.SaveChangesAsync();
            }

            var musicCategory = _context.Categories.First(c => c.Name == "Âm nhạc");

            // 5. Download ảnh thật từ Unsplash
            var httpClient = new HttpClient();
            var eventImages = new List<byte[]>();
            
            var imageUrls = new[]
            {
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1200&fit=crop", // Concert
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1200&fit=crop", // Rock concert
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=1200&fit=crop", // EDM party
                "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=1200&fit=crop", // Jazz
                "https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=800&h=1200&fit=crop", // K-pop
                "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=1200&fit=crop"  // Stadium concert
            };

            foreach (var url in imageUrls)
            {
                try
                {
                    var imageBytes = await httpClient.GetByteArrayAsync(url);
                    eventImages.Add(imageBytes);
                }
                catch
                {
                    eventImages.Add(CreateColoredImage(800, 1200, new byte[] { 168, 85, 247 }));
                }
            }

            // 6. Tạo Events
            if (!_context.Events.Any())
            {
                var events = new[]
                {
                    new Event
                    {
                        Name = "Đêm nhạc Acoustic Hà Nội 2025",
                        Description = "Đêm nhạc acoustic với những ca khúc bolero, nhạc trẻ quen thuộc",
                        EventInfo = "Chương trình âm nhạc đặc sắc với sự tham gia của nhiều ca sĩ nổi tiếng",
                        Date = DateTime.Now.AddDays(30),
                        CategoryId = musicCategory.Id,
                        Capacity = 500,
                        Province = "Hà Nội",
                        District = "Hoàn Kiếm",
                        Ward = "Hàng Bạc",
                        AddressDetail = "Nhà hát Lớn Hà Nội",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty ABC",
                        OrganizerInfo = "Công ty tổ chức sự kiện hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 1250,
                        AverageRating = 4.8m,
                        ReviewCount = 45,
                        Image9x16 = eventImages[0],
                        Image16x9 = eventImages[0]
                    },
                    new Event
                    {
                        Name = "Rock Festival Sài Gòn 2025",
                        Description = "Lễ hội âm nhạc rock lớn nhất Việt Nam",
                        EventInfo = "3 ngày 2 đêm với hơn 20 ban nhạc rock trong và ngoài nước",
                        Date = DateTime.Now.AddDays(45),
                        CategoryId = musicCategory.Id,
                        Capacity = 5000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 1",
                        Ward = "Bến Nghé",
                        AddressDetail = "Công viên Lê Văn Tám",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty ABC",
                        OrganizerInfo = "Công ty tổ chức sự kiện hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 3420,
                        AverageRating = 4.9m,
                        ReviewCount = 128,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 168, 230, 207 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 168, 230, 207 })
                    },
                    new Event
                    {
                        Name = "EDM Night Party Đà Nẵng",
                        Description = "Bữa tiệc âm nhạc điện tử sôi động với DJ hàng đầu",
                        EventInfo = "Không gian âm nhạc đẳng cấp quốc tế tại bãi biển Đà Nẵng",
                        Date = DateTime.Now.AddDays(60),
                        CategoryId = musicCategory.Id,
                        Capacity = 2000,
                        Province = "Đà Nẵng",
                        District = "Sơn Trà",
                        Ward = "Phước Mỹ",
                        AddressDetail = "Heliostats Beach Club",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty ABC",
                        OrganizerInfo = "Công ty tổ chức sự kiện hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 890,
                        AverageRating = 4.5m,
                        ReviewCount = 32,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 255, 217, 61 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 255, 217, 61 })
                    },
                    new Event
                    {
                        Name = "Jazz in the Park - Hà Nội",
                        Description = "Đêm nhạc Jazz ngoài trời tại công viên",
                        EventInfo = "Thưởng thức nhạc jazz bên ly rượu vang trong không gian xanh mát",
                        Date = DateTime.Now.AddDays(15),
                        CategoryId = musicCategory.Id,
                        Capacity = 300,
                        Province = "Hà Nội",
                        District = "Cầu Giấy",
                        Ward = "Dịch Vọng",
                        AddressDetail = "Công viên Cầu Giấy",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty ABC",
                        OrganizerInfo = "Công ty tổ chức sự kiện hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 567,
                        AverageRating = 4.7m,
                        ReviewCount = 23,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 108, 92, 231 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 108, 92, 231 })
                    },
                    new Event
                    {
                        Name = "K-Pop Fan Meeting 2025",
                        Description = "Gặp gỡ các nghệ sĩ K-Pop nổi tiếng",
                        EventInfo = "Fan meeting đặc biệt với nhiều hoạt động thú vị",
                        Date = DateTime.Now.AddDays(20),
                        CategoryId = musicCategory.Id,
                        Capacity = 1000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 7",
                        Ward = "Tân Phú",
                        AddressDetail = "Crescent Mall",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty ABC",
                        OrganizerInfo = "Công ty tổ chức sự kiện hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 2150,
                        AverageRating = 4.9m,
                        ReviewCount = 87,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 253, 121, 168 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 253, 121, 168 })
                    },
                    new Event
                    {
                        Name = "Live Concert Sơn Tùng M-TP",
                        Description = "Đêm nhạc đặc biệt của Sơn Tùng M-TP",
                        EventInfo = "Sky Tour 2025 - Chặng dừng Hà Nội",
                        Date = DateTime.Now.AddDays(50),
                        CategoryId = musicCategory.Id,
                        Capacity = 10000,
                        Province = "Hà Nội",
                        District = "Nam Từ Liêm",
                        Ward = "Mễ Trì",
                        AddressDetail = "Sân vận động Mỹ Đình",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty ABC",
                        OrganizerInfo = "Công ty tổ chức sự kiện hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 8750,
                        AverageRating = 5.0m,
                        ReviewCount = 256,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 0, 184, 148 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 0, 184, 148 })
                    }
                };
                _context.Events.AddRange(events);
                await _context.SaveChangesAsync();
            }

            // 7. Tạo Tickets cho mỗi event
            foreach (var evt in _context.Events.ToList())
            {
                if (!_context.Tickets.Any(t => t.EventId == evt.Id))
                {
                    var tickets = new[]
                    {
                        new Ticket
                        {
                            EventId = evt.Id,
                            TenLoaiVe = "Vé thường",
                            LoaiVe = "Standard",
                            Gia = 200000,
                            Price = 200000,
                            SoLuongGhe = 200,
                            SoLuongConLai = 150,
                            SoVeToiThieuTrongMotDonHang = 1,
                            SoVeToiDaTrongMotDonHang = 10,
                            ThoiGianBatDauBanVe = DateTime.Now,
                            ThoiGianKetThucBanVe = evt.Date.AddHours(-2),
                            ThongTinVe = "Vé thường - Không bao gồm đồ ăn thức uống",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Ticket
                        {
                            EventId = evt.Id,
                            TenLoaiVe = "Vé VIP",
                            LoaiVe = "VIP",
                            Gia = 500000,
                            Price = 500000,
                            SoLuongGhe = 100,
                            SoLuongConLai = 80,
                            SoVeToiThieuTrongMotDonHang = 1,
                            SoVeToiDaTrongMotDonHang = 5,
                            ThoiGianBatDauBanVe = DateTime.Now,
                            ThoiGianKetThucBanVe = evt.Date.AddHours(-2),
                            ThongTinVe = "Vé VIP - Chỗ ngồi hạng sang, đồ ăn nhẹ + 1 ly nước",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Ticket
                        {
                            EventId = evt.Id,
                            TenLoaiVe = "Vé SVIP",
                            LoaiVe = "SVIP",
                            Gia = 1000000,
                            Price = 1000000,
                            SoLuongGhe = 50,
                            SoLuongConLai = 45,
                            SoVeToiThieuTrongMotDonHang = 1,
                            SoVeToiDaTrongMotDonHang = 4,
                            ThoiGianBatDauBanVe = DateTime.Now,
                            ThoiGianKetThucBanVe = evt.Date.AddHours(-2),
                            ThongTinVe = "Vé SVIP - Chỗ ngồi hạng đặc biệt, buffet, gặp gỡ nghệ sĩ",
                            CreatedAt = DateTime.UtcNow
                        }
                    };
                    _context.Tickets.AddRange(tickets);
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new { 
                success = true, 
                message = "Seed data thành công!",
                data = new {
                    users = 2,
                    categories = 5,
                    events = 6,
                    ticketsPerEvent = 3
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // Tạo ảnh solid color đơn giản
    private byte[] CreateColoredImage(int width, int height, byte[] rgb)
    {
        // Tạo PNG 1x1 pixel và scale lên
        // Magic numbers cho PNG header
        return new byte[] { 
            137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
            0, 0, 0, 13, 73, 72, 68, 82, // IHDR chunk
            0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, // 1x1 RGB
            144, 119, 83, 222, // CRC
            0, 0, 0, 12, 73, 68, 65, 84, // IDAT chunk
            8, 215, 99, rgb[0], rgb[1], rgb[2], 0, 0, 0, 3, 0, 1, // RGB data
            218, 205, 205, 221, // CRC
            0, 0, 0, 0, 73, 69, 78, 68, // IEND chunk
            174, 66, 96, 130 // CRC
        };
    }
}
