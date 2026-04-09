import { useCallback, useEffect, useState } from 'react';
import { hotelApi } from '../api/hotelApi';
import { sortBookings } from '../lib/bookings';

export function useCalendarData(startDate, endDate) {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        hotelApi.getRooms(),
        hotelApi.getBookings(startDate, endDate),
      ]);
      setRooms(roomsResponse);
      setBookings(sortBookings(bookingsResponse));
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createBooking = useCallback(async (payload) => {
    const booking = await hotelApi.createBooking(payload);
    setBookings((current) => sortBookings([...current, booking]));
    return booking;
  }, []);

  const updateBooking = useCallback(async (id, payload) => {
    const booking = await hotelApi.updateBooking(id, payload);
    setBookings((current) => sortBookings(current.map((item) => (item.id === id ? booking : item))));
    return booking;
  }, []);

  const deleteBooking = useCallback(async (id) => {
    await hotelApi.deleteBooking(id);
    setBookings((current) => current.filter((item) => item.id !== id));
  }, []);

  const extendStay = useCallback(async (id, nights = 1) => {
    const booking = await hotelApi.extendStay(id, nights);
    setBookings((current) => sortBookings(current.map((item) => (item.id === id ? booking : item))));
    return booking;
  }, []);

  return {
    bookings,
    createBooking,
    deleteBooking,
    error,
    extendStay,
    loading,
    refresh,
    rooms,
    updateBooking,
  };
}
