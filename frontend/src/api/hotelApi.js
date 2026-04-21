import { request } from './http';

export const hotelApi = {
  getRooms(filters = {}) {
    const search = new URLSearchParams(filters);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return request(`/rooms${suffix}`);
  },
  getBookings(startDate, endDate) {
    const search = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    return request(`/bookings?${search.toString()}`);
  },
  createBooking(payload) {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateBooking(id, payload) {
    return request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteBooking(id) {
    return request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
  extendStay(id, nights = 1) {
    return request(`/bookings/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ nights }),
    });
  },
  syncCalendar() {
    return request('/ota/sync', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // ── Digital Check-in ─────────────────────────────────────────────────
  getCheckin(bookingId) {
    return request(`/checkin/${bookingId}`);
  },
  saveCheckin(bookingId, payload) {
    return request(`/checkin/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
