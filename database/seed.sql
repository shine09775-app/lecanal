TRUNCATE TABLE bookings, rooms RESTART IDENTITY CASCADE;

INSERT INTO rooms (name, type, floor) VALUES
    ('Room 1', 'Deluxe Double', 2),
    ('Room 2', 'Deluxe Double', 2),
    ('Room 6', 'Deluxe Double', 2),
    ('Room 7', 'Deluxe Double', 3),
    ('Room 8', 'Deluxe Double', 3),
    ('Room 12', 'Deluxe Double', 3),
    ('Room 4', 'Deluxe Twin', 2),
    ('Room 5', 'Deluxe Twin', 2),
    ('Room 10', 'Deluxe Twin', 3),
    ('Room 11', 'Deluxe Twin', 3),
    ('Room 3', 'Superior Double', 2),
    ('Room 9', 'Superior Double', 3),
    ('Room S1', 'Honeymoon Suite', 3);

INSERT INTO bookings (guest_name, source, room_id, check_in, check_out, status, note) VALUES
    ('John Carter', 'Direct', 1, '2026-03-20', '2026-03-23', 'confirmed', 'Late arrival around 21:00'),
    ('Mira Tan', 'Booking.com', 2, '2026-03-21', '2026-03-25', 'ota', 'Airport transfer requested'),
    ('Maintenance Block', 'Internal', 3, '2026-03-22', '2026-03-26', 'blocked', 'Air conditioning repair'),
    ('Emma Wood', 'Airbnb', 4, '2026-03-19', '2026-03-22', 'ota', 'Needs twin setup'),
    ('Daniel Ross', 'Walk-in', 5, '2026-03-24', '2026-03-27', 'confirmed', 'Pay at hotel'),
    ('Sofia Lin', 'Direct', 7, '2026-03-20', '2026-03-24', 'confirmed', 'Birthday stay'),
    ('Noah Patel', 'Booking.com', 9, '2026-03-23', '2026-03-28', 'ota', 'Quiet room preferred'),
    ('Honeymoon Block', 'Direct', 13, '2026-03-21', '2026-03-26', 'confirmed', 'Flower package included'),
    ('Deep Cleaning', 'Internal', 10, '2026-03-26', '2026-03-28', 'blocked', 'Post-group departure'),
    ('Olivia Green', 'Airbnb', 12, '2026-03-27', '2026-03-31', 'ota', 'Early check-in requested');
