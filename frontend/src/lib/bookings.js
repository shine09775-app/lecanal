export function getBookingTone(booking) {
  if (booking.status === 'blocked') {
    return 'bg-gray-400 text-white border-gray-500';
  }

  if (booking.status === 'ota' || ['Booking.com', 'Airbnb', 'Agoda'].includes(booking.source)) {
    return 'bg-bcom-blue text-white border-bcom-blue-dark';
  }

  return 'bg-bcom-green text-white border-green-700';
}

export function sortBookings(list) {
  return [...list].sort((left, right) => {
    if (left.room_id !== right.room_id) {
      return left.room_id - right.room_id;
    }

    if (left.check_in !== right.check_in) {
      return left.check_in.localeCompare(right.check_in);
    }

    return left.id - right.id;
  });
}
