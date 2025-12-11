using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Qconcert.Api.Data;
using Qconcert.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to accept large request bodies (for image uploads)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 104857600; // 100MB
});

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
    };
});

builder.Services.AddAuthorization();

// Add HttpClient for PayOS
builder.Services.AddHttpClient();

// Register Services
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IUserService, Qconcert.Api.Services.Implementations.UserService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IEventService, Qconcert.Api.Services.Implementations.EventService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.ITicketService, Qconcert.Api.Services.Implementations.TicketService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IOrderService, Qconcert.Api.Services.Implementations.OrderService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IReviewService, Qconcert.Api.Services.Implementations.ReviewService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IPaymentService, Qconcert.Api.Services.Implementations.PaymentService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IFavoriteService, Qconcert.Api.Services.Implementations.FavoriteService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.INotificationService, Qconcert.Api.Services.Implementations.NotificationService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IQRCodeService, Qconcert.Api.Services.Implementations.QRCodeService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IEmailService, Qconcert.Api.Services.Implementations.EmailService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IAdminService, Qconcert.Api.Services.Implementations.AdminService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.ICategoryService, Qconcert.Api.Services.Implementations.CategoryService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IPromotionService, Qconcert.Api.Services.Implementations.PromotionService>();
builder.Services.AddScoped<Qconcert.Api.Services.Interfaces.IDiscountService, Qconcert.Api.Services.Implementations.DiscountService>();

// Add Controllers
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Qconcert API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware to allow large request bodies
app.Use(async (context, next) =>
{
    context.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpMaxRequestBodySizeFeature>()!.MaxRequestBodySize = 104857600; // 100MB
    await next();
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
