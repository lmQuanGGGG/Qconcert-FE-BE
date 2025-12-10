using Microsoft.EntityFrameworkCore;
using Qconcert.Api.Data;
using Qconcert.Api.DTOs.Request;
using Qconcert.Api.Models;
using Qconcert.Api.Services.Interfaces;

namespace Qconcert.Api.Services.Implementations;

public class TicketService : ITicketService
{
    private readonly ApplicationDbContext _context;

    public TicketService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Ticket>> GetTicketsByEventIdAsync(int eventId)
    {
        return await _context.Tickets
            .Where(t => t.EventId == eventId)
            .OrderBy(t => t.Gia)
            .ToListAsync();
    }

    public async Task<Ticket?> GetTicketByIdAsync(int id)
    {
        return await _context.Tickets.FindAsync(id);
    }

    public async Task<Ticket> CreateTicketAsync(CreateTicketRequest request)
    {
        var ticket = new Ticket
        {
            EventId = request.EventId,
            TenLoaiVe = request.TenLoaiVe,
            LoaiVe = request.LoaiVe,
            Gia = request.Gia,
            SoLuongGhe = request.SoLuongGhe,
            SoLuongConLai = request.SoLuongGhe,
            SoVeToiThieuTrongMotDonHang = request.SoVeToiThieuTrongMotDonHang,
            SoVeToiDaTrongMotDonHang = request.SoVeToiDaTrongMotDonHang,
            ThoiGianBatDauBanVe = request.ThoiGianBatDauBanVe,
            ThoiGianKetThucBanVe = request.ThoiGianKetThucBanVe,
            ThongTinVe = request.ThongTinVe
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task<Ticket> UpdateTicketAsync(int id, CreateTicketRequest request)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            throw new KeyNotFoundException("Không tìm thấy vé");

        ticket.TenLoaiVe = request.TenLoaiVe;
        ticket.LoaiVe = request.LoaiVe;
        ticket.Gia = request.Gia;
        ticket.SoLuongGhe = request.SoLuongGhe;
        ticket.SoVeToiThieuTrongMotDonHang = request.SoVeToiThieuTrongMotDonHang;
        ticket.SoVeToiDaTrongMotDonHang = request.SoVeToiDaTrongMotDonHang;
        ticket.ThoiGianBatDauBanVe = request.ThoiGianBatDauBanVe;
        ticket.ThoiGianKetThucBanVe = request.ThoiGianKetThucBanVe;
        ticket.ThongTinVe = request.ThongTinVe;

        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task<bool> DeleteTicketAsync(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return false;

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CheckAvailabilityAsync(int ticketId, int quantity)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
            return false;

        var now = DateTime.UtcNow;
        if (now < ticket.ThoiGianBatDauBanVe || now > ticket.ThoiGianKetThucBanVe)
            return false;

        if (ticket.SoLuongConLai < quantity)
            return false;

        if (quantity < ticket.SoVeToiThieuTrongMotDonHang || quantity > ticket.SoVeToiDaTrongMotDonHang)
            return false;

        return true;
    }
}
