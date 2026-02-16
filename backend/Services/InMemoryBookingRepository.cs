using BackendApi.Models;

namespace BackendApi.Services;

public class InMemoryBookingRepository : IBookingRepository
{
    private readonly List<Booking> _bookings = new();
    private int _nextId = 1;

    public Task<IEnumerable<Booking>> GetAllBookingsAsync()
    {
        return Task.FromResult<IEnumerable<Booking>>(_bookings.ToList());
    }

    public Task<Booking?> GetBookingByIdAsync(int id)
    {
        return Task.FromResult(_bookings.FirstOrDefault(b => b.Id == id));
    }

    public Task<Booking> CreateBookingAsync(Booking booking)
    {
        booking.Id = _nextId++;
        _bookings.Add(booking);
        return Task.FromResult(booking);
    }

    public Task<Booking> UpdateBookingAsync(Booking booking)
    {
        var existingBooking = _bookings.FirstOrDefault(b => b.Id == booking.Id);
        if (existingBooking != null)
        {
            var index = _bookings.IndexOf(existingBooking);
            _bookings[index] = booking;
        }
        return Task.FromResult(booking);
    }

    public Task<bool> DeleteBookingAsync(int id)
    {
        var booking = _bookings.FirstOrDefault(b => b.Id == id);
        if (booking == null)
            return Task.FromResult(false);

        _bookings.Remove(booking);
        return Task.FromResult(true);
    }
}
