-- Seed data for rooms

INSERT INTO rooms (name, type, floor) VALUES
  ('Room 1', 'Deluxe Double', 2),
  ('Room 2', 'Deluxe Double', 2),
  ('Room 3', 'Superior Double', 2),
  ('Room 4', 'Deluxe Twin', 2),
  ('Room 5', 'Deluxe Twin', 2),
  ('Room 6', 'Deluxe Double', 2),
  ('Room 7', 'Deluxe Double', 3),
  ('Room 8', 'Deluxe Double', 3),
  ('Room 9', 'Superior Double', 3),
  ('Room 10', 'Deluxe Twin', 3),
  ('Room 11', 'Deluxe Twin', 3),
  ('Room 12', 'Deluxe Double', 3),
  ('S1', 'Honeymoon Suite', 3);

-- Seed data for bookings

INSERT INTO bookings (guest_name, source, room_id, check_in, check_out, status, note) VALUES
  ('Alice Grant', 'Booking.com', 1, '2026-03-18', '2026-03-21', 'ota', 'Late arrival'),
  ('Carlos Rivera', 'Direct', 2, '2026-03-19', '2026-03-22', 'confirmed', ''),
  ('Lisa Wong', 'Airbnb', 7, '2026-03-20', '2026-03-25', 'ota', ''),
  ('Maintenance', 'Internal', 4, '2026-03-21', '2026-03-23', 'blocked', 'Shower repairs');