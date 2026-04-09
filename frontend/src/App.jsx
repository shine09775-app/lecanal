import { useEffect, useMemo, useState } from 'react';
import BookingModal from './components/booking/BookingModal';
import CalendarGrid from './components/calendar/CalendarGrid';
import CalendarLegend from './components/calendar/CalendarLegend';
import FiltersBar from './components/filters/FiltersBar';
import AppShell from './components/layout/AppShell';
import { useCalendarData } from './hooks/useCalendarData';
import { DAYS_VISIBLE } from './lib/constants';
import { addDays, formatMonthLabel, todayIso } from './lib/date';

function getInitialStartDate() {
  return addDays(todayIso(), -2);
}

function bookingToPayload(bookingLike) {
  return {
    guest_name: bookingLike.guest_name,
    source: bookingLike.source,
    room_id: Number(bookingLike.room_id),
    check_in: bookingLike.check_in,
    check_out: bookingLike.check_out,
    status: bookingLike.status,
    note: bookingLike.note || '',
  };
}

export default function App() {
  const [viewStartDate, setViewStartDate] = useState(getInitialStartDate);
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [modalState, setModalState] = useState({ open: false, booking: null, draft: null });
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const endDate = addDays(viewStartDate, DAYS_VISIBLE);

  const { rooms, bookings, loading, error, createBooking, updateBooking, deleteBooking, extendStay, refresh } =
    useCalendarData(viewStartDate, endDate);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const roomTypes = useMemo(() => [...new Set(rooms.map((room) => room.type))], [rooms]);
  const floors = useMemo(() => [...new Set(rooms.map((room) => room.floor))], [rooms]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const roomTypeMatch = roomTypeFilter === 'All' || room.type === roomTypeFilter;
        const floorMatch = floorFilter === 'All' || String(room.floor) === floorFilter;
        return roomTypeMatch && floorMatch;
      }),
    [floorFilter, roomTypeFilter, rooms]
  );

  const visibleRoomIds = useMemo(() => new Set(filteredRooms.map((room) => room.id)), [filteredRooms]);
  const filteredBookings = useMemo(
    () => bookings.filter((booking) => visibleRoomIds.has(booking.room_id)),
    [bookings, visibleRoomIds]
  );

  const today = todayIso();
  const guestBookings = bookings.filter((booking) => booking.status !== 'blocked');
  const activeStayCount = guestBookings.filter(
    (booking) => booking.check_in <= today && booking.check_out > today
  ).length;
  const checkInCount = guestBookings.filter((booking) => booking.check_in === today).length;
  const checkOutCount = guestBookings.filter((booking) => booking.check_out === today).length;

  async function commitBooking(action) {
    setBusy(true);
    setModalError('');

    try {
      await action();
      setModalState({ open: false, booking: null, draft: null });
      return true;
    } catch (requestError) {
      const conflictMessage =
        requestError.details?.conflicts?.length
          ? `Conflict with ${requestError.details.conflicts
              .map((item) => `${item.guest_name} (${item.check_in} to ${item.check_out})`)
              .join(', ')}`
          : requestError.message;

      setModalError(conflictMessage);
      setToast(conflictMessage);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(form) {
    const payload = bookingToPayload(form);
    if (modalState.booking) {
      const success = await commitBooking(() => updateBooking(modalState.booking.id, payload));
      if (success) {
        setToast(`Updated ${payload.guest_name}`);
      }
      return;
    }

    const success = await commitBooking(() => createBooking(payload));
    if (success) {
      setToast(`Created ${payload.guest_name}`);
    }
  }

  async function handleDelete(booking) {
    const success = await commitBooking(async () => {
      await deleteBooking(booking.id);
    });
    if (success) {
      setToast(`Deleted ${booking.guest_name}`);
    }
  }

  async function handleExtendStay(booking) {
    const success = await commitBooking(async () => {
      await extendStay(booking.id, 1);
    });
    if (success) {
      setToast(`Extended ${booking.guest_name} by 1 night`);
    }
  }

  async function handleInlineBookingUpdate(booking, partial) {
    try {
      await updateBooking(booking.id, bookingToPayload({ ...booking, ...partial }));
      setToast(partial.room_id !== booking.room_id ? `Moved ${booking.guest_name}` : `Updated ${booking.guest_name}`);
    } catch (requestError) {
      const message =
        requestError.details?.conflicts?.length
          ? `Conflict with ${requestError.details.conflicts
              .map((item) => `${item.guest_name} (${item.check_in} to ${item.check_out})`)
              .join(', ')}`
          : requestError.message;

      setToast(message);
    }
  }

  return (
    <AppShell>
      <div className="grid gap-4 pb-6">

        {/* Property header — Booking.com extranet style */}
        <section className="rounded bg-white border border-bcom-border shadow-card overflow-hidden">
          {/* Blue top strip */}
          <div className="bg-bcom-navy px-5 py-3 flex items-center justify-between">
            <div>
              <span className="text-white font-semibold text-base">Le Canal Hotel</span>
              <span className="ml-2 text-white/60 text-sm">· Room Schedule</span>
            </div>
            <span className="text-bcom-yellow text-xs font-semibold">● Live</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-bcom-border">
            <div className="px-5 py-4 text-center">
              <div className="text-2xl font-bold text-bcom-text">{activeStayCount}</div>
              <div className="text-xs text-bcom-muted mt-0.5">Staying tonight</div>
            </div>
            <div className="px-5 py-4 text-center">
              <div className="text-2xl font-bold text-bcom-green">{checkInCount}</div>
              <div className="text-xs text-bcom-muted mt-0.5">Check-in today</div>
            </div>
            <div className="px-5 py-4 text-center">
              <div className="text-2xl font-bold text-bcom-blue">{checkOutCount}</div>
              <div className="text-xs text-bcom-muted mt-0.5">Check-out today</div>
            </div>
          </div>
        </section>

        {/* Filters + Calendar Nav */}
        <section className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-start">
          <div className="grid gap-3">
            <FiltersBar
              roomTypes={roomTypes}
              selectedRoomType={roomTypeFilter}
              onRoomTypeChange={setRoomTypeFilter}
              floors={floors}
              selectedFloor={floorFilter}
              onFloorChange={setFloorFilter}
            />
            <CalendarLegend />
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-2 rounded bg-white border border-bcom-border shadow-card px-4 py-3">
            <button
              type="button"
              onClick={() => setViewStartDate((current) => addDays(current, -7))}
              className="rounded border border-bcom-border px-3 py-1.5 text-sm font-medium text-bcom-text hover:bg-bcom-gray transition-colors"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={() => setViewStartDate(getInitialStartDate())}
              className="rounded border border-bcom-blue bg-bcom-blue-light px-3 py-1.5 text-sm font-semibold text-bcom-blue hover:bg-bcom-blue hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setViewStartDate((current) => addDays(current, 7))}
              className="rounded border border-bcom-border px-3 py-1.5 text-sm font-medium text-bcom-text hover:bg-bcom-gray transition-colors"
            >
              Next ›
            </button>
            <div className="ml-3 pl-3 border-l border-bcom-border">
              <div className="text-xs text-bcom-muted">Viewing</div>
              <div className="text-sm font-semibold text-bcom-navy">{formatMonthLabel(viewStartDate)}</div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Calendar */}
        <section>
          {loading ? (
            <div className="rounded bg-white border border-bcom-border px-6 py-16 text-center text-sm text-bcom-muted shadow-card">
              Loading room inventory and bookings...
            </div>
          ) : filteredRooms.length ? (
            <CalendarGrid
              rooms={filteredRooms}
              bookings={filteredBookings}
              startDate={viewStartDate}
              daysVisible={DAYS_VISIBLE}
              onCreateSelection={(draft) => {
                setModalError('');
                setModalState({ open: true, booking: null, draft });
              }}
              onOpenBooking={(booking) => {
                setModalError('');
                setModalState({ open: true, booking, draft: null });
              }}
              onUpdateBooking={handleInlineBookingUpdate}
            />
          ) : (
            <div className="rounded border border-dashed border-bcom-border bg-white px-6 py-16 text-center text-sm text-bcom-muted shadow-card">
              No rooms match the current filters.
            </div>
          )}
        </section>

        {/* Action buttons */}
        <section className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setModalError('');
              setModalState({
                open: true,
                booking: null,
                draft: {
                  room_id: filteredRooms[0]?.id || rooms[0]?.id || '',
                  check_in: today,
                  check_out: addDays(today, 1),
                },
              });
            }}
            className="rounded bg-bcom-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bcom-blue-dark transition-colors shadow-sm"
          >
            + New booking
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded border border-bcom-border bg-white px-4 py-2 text-sm font-medium text-bcom-text hover:bg-bcom-gray transition-colors"
          >
            Refresh data
          </button>
        </section>
      </div>

      <BookingModal
        open={modalState.open}
        booking={modalState.booking}
        draft={modalState.draft}
        rooms={rooms}
        error={modalError}
        busy={busy}
        onClose={() => setModalState({ open: false, booking: null, draft: null })}
        onSubmit={(form) => void handleSubmit(form)}
        onDelete={(booking) => void handleDelete(booking)}
        onExtendStay={(booking) => void handleExtendStay(booking)}
      />

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded bg-bcom-navy px-4 py-3 text-sm font-medium text-white shadow-xl border border-white/10">
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
