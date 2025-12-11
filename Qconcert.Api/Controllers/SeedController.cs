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

            // 6. Tạo Events (Dữ liệu mẫu cho học tập)
            if (!_context.Events.Any())
            {
                var sportsCategory = _context.Categories.FirstOrDefault(c => c.Name == "Thể thao");
                var conferenceCategory = _context.Categories.FirstOrDefault(c => c.Name == "Hội thảo");
                var festivalCategory = _context.Categories.FirstOrDefault(c => c.Name == "Lễ hội");

                var events = new List<Event>
                {
                    // ÂM NHẠC
                    new Event
                    {
                        Name = "Đêm nhạc Acoustic Hà Nội 2025",
                        Description = "Đêm nhạc acoustic với những ca khúc bolero, nhạc trẻ quen thuộc. Không gian ấm cúng, lãng mạn với ban nhạc acoustic chuyên nghiệp.\n\nChương trình gồm 3 phần:\n- Phần 1: Những ca khúc nhạc trẻ hit\n- Phần 2: Bolero, nhạc vàng\n- Phần 3: Tương tác và giao lưu",
                        EventInfo = "Thời lượng: 3 giờ | Dress code: Smart casual",
                        Date = DateTime.Now.AddDays(30),
                        CategoryId = musicCategory.Id,
                        Capacity = 500,
                        Province = "Hà Nội",
                        District = "Hoàn Kiếm",
                        Ward = "Hàng Bạc",
                        AddressDetail = "Nhà hát Lớn Hà Nội, số 1 Tràng Tiền",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "VietEvents Production",
                        OrganizerInfo = "Đơn vị tổ chức sự kiện âm nhạc hàng đầu Việt Nam với 10 năm kinh nghiệm",
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
                        Name = "Anh Trai Say Hi - Concert Tour 2025",
                        Description = "Concert đình đám của các anh trai đến từ chương trình hot nhất năm. Hơn 30 ca khúc được trình diễn live với dàn dựng hoành tráng.\n\nĐiểm nhấn:\n- Stage 360 độ\n- Hiệu ứng ánh sáng, pháo hoa\n- Gặp gỡ nghệ sĩ (vé SVIP)\n- Quà tặng đặc biệt",
                        EventInfo = "Thời lượng: 4 giờ | Check-in: 17:00 | Bắt đầu: 19:00",
                        Date = DateTime.Now.AddDays(25),
                        CategoryId = musicCategory.Id,
                        Capacity = 15000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 7",
                        Ward = "Tân Phú",
                        AddressDetail = "Crescent Mall, Phường Tân Phú, Quận 7",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Vie Channel Entertainment",
                        OrganizerInfo = "Đơn vị sản xuất show giải trí hàng đầu",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 8920,
                        AverageRating = 4.9m,
                        ReviewCount = 234,
                        Image9x16 = eventImages.Count > 0 ? eventImages[0] : CreateColoredImage(800, 1200, new byte[] { 168, 85, 247 }),
                        Image16x9 = eventImages.Count > 0 ? eventImages[0] : CreateColoredImage(800, 1200, new byte[] { 168, 85, 247 })
                    },
                    new Event
                    {
                        Name = "Đen Vâu Live Concert - Nắng Ấm Xa Dần",
                        Description = "Live concert đầu tiên của Đen Vâu tại Hà Nội sau 2 năm. Trải nghiệm âm nhạc đầy cảm xúc với những ca khúc hit như Bài Này Chill Phết, Đi Về Nhà, Lối Nhỏ...\n\nĐặc biệt:\n- Live band 20 người\n- Guest: Nhiều nghệ sĩ bất ngờ\n- Ánh sáng sân khấu hiện đại\n- Photo booth miễn phí",
                        EventInfo = "Thời lượng: 3.5 giờ | Cấm mang đồ ăn từ bên ngoài",
                        Date = DateTime.Now.AddDays(18),
                        CategoryId = musicCategory.Id,
                        Capacity = 8000,
                        Province = "Hà Nội",
                        District = "Nam Từ Liêm",
                        Ward = "Mễ Trì",
                        AddressDetail = "Nhà thi đấu quốc gia Mỹ Đình",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "1989 Productions",
                        OrganizerInfo = "Công ty giải trí chuyên về âm nhạc Underground và Indie",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 12450,
                        AverageRating = 5.0m,
                        ReviewCount = 456,
                        Image9x16 = eventImages.Count > 1 ? eventImages[1] : CreateColoredImage(800, 1200, new byte[] { 168, 230, 207 }),
                        Image16x9 = eventImages.Count > 1 ? eventImages[1] : CreateColoredImage(800, 1200, new byte[] { 168, 230, 207 })
                    },
                    new Event
                    {
                        Name = "Hoàng Thùy Linh - See Tình Tour 2025",
                        Description = "Concert âm nhạc kết hợp yếu tố văn hóa Việt Nam đương đại. Hoàng Thùy Linh sẽ mang đến những màn trình diễn đẳng cấp với vũ đạo đỉnh cao.\n\nHighlights:\n- 25+ ca khúc hit\n- Vũ đoàn 40 người\n- Thiết kế sân khấu độc đáo\n- Special stage: Văn hóa Việt hiện đại",
                        EventInfo = "Thời lượng: 3 giờ | Dress code: Tự do, trang phục truyền thống được khuyến khích",
                        Date = DateTime.Now.AddDays(40),
                        CategoryId = musicCategory.Id,
                        Capacity = 6000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 10",
                        Ward = "Phường 15",
                        AddressDetail = "Nhà thi đấu Phú Thọ, 1 Lữ Gia, Phường 15",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Golden Stage Entertainment",
                        OrganizerInfo = "Đơn vị tổ chức concert quốc tế với hơn 50 show/năm",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 9800,
                        AverageRating = 4.8m,
                        ReviewCount = 289,
                        Image9x16 = eventImages.Count > 2 ? eventImages[2] : CreateColoredImage(800, 1200, new byte[] { 253, 121, 168 }),
                        Image16x9 = eventImages.Count > 2 ? eventImages[2] : CreateColoredImage(800, 1200, new byte[] { 253, 121, 168 })
                    },
                    new Event
                    {
                        Name = "Sunset EDM Festival Đà Nẵng 2025",
                        Description = "Lễ hội âm nhạc điện tử bên bờ biển với lineup DJ quốc tế hàng đầu. Trải nghiệm âm nhạc, ánh sáng và không gian bãi biển tuyệt vời.\n\nLineup:\n- DJ Snake (France)\n- Alan Walker (Norway)\n- DJ KAKU (Vietnam)\n- Nhiều DJ nổi tiếng khác\n\nĐặc biệt: Pool party, Neon party, Beach camping",
                        EventInfo = "Thời lượng: 2 ngày | Dress code: Beach casual | Check-in từ 14:00",
                        Date = DateTime.Now.AddDays(60),
                        CategoryId = musicCategory.Id,
                        Capacity = 12000,
                        Province = "Đà Nẵng",
                        District = "Ngũ Hành Sơn",
                        Ward = "Khuê Mỹ",
                        AddressDetail = "Bãi biển Mỹ Khê - Khu vực sân khấu bờ biển",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Epizode Vietnam",
                        OrganizerInfo = "Đơn vị tổ chức lễ hội EDM uy tín nhất Việt Nam",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 15670,
                        AverageRating = 4.9m,
                        ReviewCount = 678,
                        Image9x16 = eventImages.Count > 3 ? eventImages[3] : CreateColoredImage(800, 1200, new byte[] { 124, 58, 237 }),
                        Image16x9 = eventImages.Count > 3 ? eventImages[3] : CreateColoredImage(800, 1200, new byte[] { 124, 58, 237 })
                    },
                    new Event
                    {
                        Name = "Jazz on the River - Đêm nhạc Jazz Sài Gòn",
                        Description = "Đêm nhạc Jazz thanh lịch trên du thuyền sang trọng dọc sông Sài Gòn. Thưởng thức âm nhạc jazz cùng buffet cao cấp và view thành phố lung linh.\n\nPerformers:\n- Trần Mạnh Tuấn Quartet\n- Vocalist Lệ Quyên\n- Pianist Xuân Hiếu\n\nMenu: Buffet quốc tế 5 sao + Rượu vang không giới hạn",
                        EventInfo = "Thời lượng: 3 giờ | Dress code: Smart casual | Lên tàu lúc 18:30",
                        Date = DateTime.Now.AddDays(15),
                        CategoryId = musicCategory.Id,
                        Capacity = 200,
                        Province = "Hồ Chí Minh",
                        District = "Quận 1",
                        Ward = "Bến Nghé",
                        AddressDetail = "Bến Bạch Đằng, số 5 Tôn Đức Thắng",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Saigon Princess Cruise",
                        OrganizerInfo = "Công ty du thuyền sang trọng với hơn 15 năm kinh nghiệm",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 2340,
                        AverageRating = 4.8m,
                        ReviewCount = 87,
                        Image9x16 = eventImages.Count > 4 ? eventImages[4] : CreateColoredImage(800, 1200, new byte[] { 108, 92, 231 }),
                        Image16x9 = eventImages.Count > 4 ? eventImages[4] : CreateColoredImage(800, 1200, new byte[] { 108, 92, 231 })
                    },
                    new Event
                    {
                        Name = "BLACKPINK Fan Meeting Vietnam 2025",
                        Description = "Sự kiện fan meeting độc quyền với các thành viên BLACKPINK tại Việt Nam. Cơ hội gặp gỡ, giao lưu và chụp ảnh cùng idol.\n\nHoạt động:\n- Hi-touch với idol\n- Photo session\n- Q&A trực tiếp\n- Mini performance\n- Tặng lightstick chính hãng\n\nLưu ý: Giới hạn 1000 vé duy nhất",
                        EventInfo = "Thời lượng: 2.5 giờ | Check-in: 13:00 | Không cho phép mang theo máy ảnh chuyên nghiệp",
                        Date = DateTime.Now.AddDays(20),
                        CategoryId = musicCategory.Id,
                        Capacity = 1000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 7",
                        Ward = "Tân Phú",
                        AddressDetail = "Crescent Mall, 101 Tôn Dật Tiên, Tân Phú",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "YG Entertainment Vietnam",
                        OrganizerInfo = "Đại diện chính thức của YG Entertainment tại Việt Nam",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 18900,
                        AverageRating = 5.0m,
                        ReviewCount = 892,
                        Image9x16 = eventImages.Count > 5 ? eventImages[5] : CreateColoredImage(800, 1200, new byte[] { 253, 121, 168 }),
                        Image16x9 = eventImages.Count > 5 ? eventImages[5] : CreateColoredImage(800, 1200, new byte[] { 253, 121, 168 })
                    },
                    new Event
                    {
                        Name = "Sơn Tùng M-TP - Sky Tour 2025",
                        Description = "Concert hoành tráng nhất trong sự nghiệp của Sơn Tùng M-TP với quy mô 20,000 khán giả. Hứa hẹn mang đến đêm diễn đầy cảm xúc với công nghệ sân khấu hiện đại.\n\nHighlights:\n- 35+ ca khúc hit\n- Sân khấu 360 độ\n- Hiệu ứng ánh sáng 3D mapping\n- Drone show\n- Bất ngờ đặc biệt từ Sky\n\nPhân khu: Standing | Fan Zone | VIP | VVIP",
                        EventInfo = "Thời lượng: 3.5 giờ | Dress code: Tự do | Check-in: 17:00 - 19:00",
                        Date = DateTime.Now.AddDays(50),
                        CategoryId = musicCategory.Id,
                        Capacity = 20000,
                        Province = "Hà Nội",
                        District = "Nam Từ Liêm",
                        Ward = "Mễ Trì",
                        AddressDetail = "Sân vận động Quốc gia Mỹ Đình",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "M-TP Entertainment",
                        OrganizerInfo = "Công ty giải trí của Sơn Tùng M-TP",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 28750,
                        AverageRating = 5.0m,
                        ReviewCount = 1256,
                        Image9x16 = eventImages.Count > 6 ? eventImages[6] : CreateColoredImage(800, 1200, new byte[] { 0, 184, 148 }),
                        Image16x9 = eventImages.Count > 6 ? eventImages[6] : CreateColoredImage(800, 1200, new byte[] { 0, 184, 148 })
                    },
                    
                    // Sports Events
                    new Event
                    {
                        Name = "V.League 2025 - Hà Nội FC vs Hoàng Anh Gia Lai",
                        Description = "Trận derby hấp dẫn giữa hai đội bóng hàng đầu V.League. Đội chủ nhà Hà Nội FC sẽ đối đầu với đội khách Hoàng Anh Gia Lai trong trận cầu không thể bỏ lỡ.\n\nThông tin:\n- Vòng 15 V.League 2025\n- BLV: Quang Huy, Quang Tùng\n- Đội hình dự kiến công bố trước 2 giờ\n\nDịch vụ: Food court, Fan shop, Bãi đỗ xe miễn phí",
                        EventInfo = "Thời gian: 19:00 | Cổng mở: 17:30 | Không mang pháo sáng",
                        Date = DateTime.Now.AddDays(25),
                        CategoryId = sportsCategory.Id,
                        Capacity = 25000,
                        Province = "Hà Nội",
                        District = "Nam Từ Liêm",
                        Ward = "Mễ Trì",
                        AddressDetail = "Sân vận động Hàng Đẫy",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Công ty Cổ phần Bóng đá Hà Nội",
                        OrganizerInfo = "CLB bóng đá chuyên nghiệp hàng đầu Việt Nam",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 12340,
                        AverageRating = 4.7m,
                        ReviewCount = 456,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 220, 53, 69 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 220, 53, 69 })
                    },
                    new Event
                    {
                        Name = "VnExpress Marathon Quy Nhơn 2025",
                        Description = "Giải chạy marathon quốc tế tại thành phố biển Quy Nhơn. Đường chạy ven biển tuyệt đẹp với cung đường xuyên qua các danh thắng nổi tiếng.\n\nCự ly:\n- 42km Full Marathon\n- 21km Half Marathon\n- 10km Fun Run\n- 5km Family Run\n\nPhần thưởng: Huy chương, áo finisher, gói quà tài trợ trị giá 1 triệu đồng",
                        EventInfo = "Xuất phát: 05:00 | Giới hạn thời gian: 6 giờ | BIB Collection: 02-03/08",
                        Date = DateTime.Now.AddDays(90),
                        CategoryId = sportsCategory.Id,
                        Capacity = 8000,
                        Province = "Bình Định",
                        District = "Quy Nhơn",
                        Ward = "Nhơn Bình",
                        AddressDetail = "Bãi biển Quy Nhơn - Điểm xuất phát TTTDTT Quy Nhơn",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "VnExpress Marathon",
                        OrganizerInfo = "Đơn vị tổ chức giải chạy marathon uy tín nhất Việt Nam",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 6780,
                        AverageRating = 4.8m,
                        ReviewCount = 234,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 34, 197, 94 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 34, 197, 94 })
                    },
                    
                    // Conference Events
                    new Event
                    {
                        Name = "Vietnam Web Summit 2025",
                        Description = "Hội nghị công nghệ lớn nhất Việt Nam với sự tham gia của các chuyên gia hàng đầu trong ngành. Cơ hội networking và học hỏi từ những case study thành công.\n\nSpeakers:\n- Nguyễn Hà Đông (CEO Flappy Bird)\n- Phạm Kim Hùng (CEO Be Group)\n- Trần Hữu Dũng Lâm (CEO Yody)\n\nTopic: AI, Blockchain, Cloud Computing, Startup Ecosystem",
                        EventInfo = "Thời lượng: 2 ngày | Dress code: Business casual | Bao gồm: Lunch, Coffee break",
                        Date = DateTime.Now.AddDays(70),
                        CategoryId = conferenceCategory.Id,
                        Capacity = 2000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 7",
                        Ward = "Tân Phong",
                        AddressDetail = "White Palace, 240 Nguyễn Văn Linh, Tân Phong",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "TechFest Vietnam",
                        OrganizerInfo = "Tổ chức phi lợi nhuận về phát triển công nghệ",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 8450,
                        AverageRating = 4.9m,
                        ReviewCount = 312,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 59, 130, 246 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 59, 130, 246 })
                    },
                    
                    // Festival Events
                    new Event
                    {
                        Name = "Lễ hội Ẩm thực Đường phố Sài Gòn 2025",
                        Description = "Lễ hội ẩm thực đường phố lớn nhất Việt Nam với hơn 200 gian hàng từ các đầu bếp nổi tiếng và food blogger. Trải nghiệm ẩm thực đa dạng từ Bắc chí Nam.\n\nZone:\n- Miền Bắc: Phở, bún chả, bánh cuốn\n- Miền Trung: Bánh xèo, mì Quảng\n- Miền Nam: Bánh mì, hủ tiếu, cơm tấm\n- Quốc tế: Thái, Hàn, Nhật, Âu\n\nĐặc biệt: Live cooking show, Food challenge, Quầy bar cocktail",
                        EventInfo = "Thời gian: 3 ngày | Cổng mở: 14:00-23:00 | Vé gồm voucher 100k",
                        Date = DateTime.Now.AddDays(35),
                        CategoryId = festivalCategory.Id,
                        Capacity = 10000,
                        Province = "Hồ Chí Minh",
                        District = "Quận 1",
                        Ward = "Bến Thành",
                        AddressDetail = "Công viên 23/9, Phạm Ngũ Lão, Phường Phạm Ngũ Lão",
                        CreatedAt = DateTime.UtcNow,
                        OrganizerName = "Saigon Food Festival Co.",
                        OrganizerInfo = "Đơn vị tổ chức sự kiện ẩm thực uy tín với 10 năm kinh nghiệm",
                        CreatedBy = organizer.Id,
                        IsApproved = true,
                        ViewCount = 14560,
                        AverageRating = 4.7m,
                        ReviewCount = 678,
                        Image9x16 = CreateColoredImage(800, 1200, new byte[] { 249, 115, 22 }),
                        Image16x9 = CreateColoredImage(800, 1200, new byte[] { 249, 115, 22 })
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
