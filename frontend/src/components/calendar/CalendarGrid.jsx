import { useEffect, useMemo, useRef, useState } from 'react';
import { getBookingTone } from '../../lib/bookings';
import {
  addDays,
  buildDateRange,
  clamp,
  diffDays,
  formatDayNumber,
  formatLongDate,
  formatMonthLabel,
  formatWeekday,
  isWeekend,
  todayIso,
} from '../../lib/date';
import { DAY_WIDTH, ROOM_COLUMN_WIDTH, ROW_HEIGHT } from '../../lib/constants';

function getRowBookingSpan(booking, startDate, daysVisible) {
  const start = Math.max(0, diffDays(startDate, booking.check_in));
  const end = Math.min(daysVisible, diffDays(startDate, booking.check_out));
  const length = end - start;

  if (length <= 0) {
    return null;
  }

  return { start, length };
}

export default function CalendarGrid({
  rooms,
  bookings,
  startDate,
  daysVisible,
  onCreateSelection,
  onOpenBooking,
  onUpdateBooking,
}) {
  const dates = useMemo(() => buildDateRange(startDate, daysVisible), [daysVisible, startDate]);
  const contentRef = useRef(null);
  const bodyRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const [interaction, setInteraction] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const today = todayIso();
  const timelineWidth = dates.length * DAY_WIDTH;

  const bookingsByRoom = useMemo(() => {
    const grouped = new Map();
    rooms.forEach((room) => grouped.set(room.id, []));
    bookings.forEach((booking) => {
      if (grouped.has(booking.room_id)) {
        grouped.get(booking.room_id).push(booking);
      }
    });
    return grouped;
  }, [bookings, rooms]);

  useEffect(() => {
    if (!selection) {
      return undefined;
    }

    const handlePointerUp = () => {
      onCreateSelection({
        room_id: selection.roomId,
        check_in: selection.start <= selection.end ? selection.start : selection.end,
        check_out: addDays(selection.start <= selection.end ? selection.end : selection.start, 1),
      });
      setSelection(null);
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [onCreateSelection, selection]);

  useEffect(() => {
    if (!interaction) {
      return undefined;
    }

    function getPointerTarget(clientX, clientY) {
      if (!contentRef.current || !bodyRef.current) {
        return null;
      }

      const contentRect = contentRef.current.getBoundingClientRect();
      const bodyRect = bodyRef.current.getBoundingClientRect();

      if (clientX < contentRect.left + ROOM_COLUMN_WIDTH || clientY < bodyRect.top) {
        return null;
      }

      const dateIndex = clamp(
        Math.floor(
          (clientX - contentRect.left - ROOM_COLUMN_WIDTH + contentRef.current.scrollLeft) / DAY_WIDTH
        ),
        0,
        dates.length - 1
      );
      const rowIndex = clamp(Math.floor((clientY - bodyRect.top) / ROW_HEIGHT), 0, rooms.length - 1);
      const room = rooms[rowIndex];

      return {
        dateIndex,
        roomId: room?.id,
      };
    }

    const handlePointerMove = (event) => {
      const target = getPointerTarget(event.clientX, event.clientY);
      if (!target) {
        return;
      }

      if (interaction.type === 'move') {
        const nextCheckIn = addDays(startDate, target.dateIndex - interaction.anchorOffset);
        const nextCheckOut = addDays(nextCheckIn, interaction.duration);
        setInteraction((current) => ({
          ...current,
          moved: true,
          preview: {
            ...current.preview,
            room_id: target.roomId || current.preview.room_id,
            check_in: nextCheckIn,
            check_out: nextCheckOut,
          },
        }));
      }

      if (interaction.type === 'resize-start') {
        const nextCheckIn = addDays(startDate, target.dateIndex);
        const maxCheckIn = addDays(interaction.booking.check_out, -1);
        setInteraction((current) => ({
          ...current,
          moved: true,
          preview: {
            ...current.preview,
            check_in: nextCheckIn < maxCheckIn ? nextCheckIn : maxCheckIn,
          },
        }));
      }

      if (interaction.type === 'resize-end') {
        const nextCheckOut = addDays(addDays(startDate, target.dateIndex), 1);
        const minCheckout = addDays(interaction.booking.check_in, 1);
        setInteraction((current) => ({
          ...current,
          moved: true,
          preview: {
            ...current.preview,
            check_out: nextCheckOut > minCheckout ? nextCheckOut : minCheckout,
          },
        }));
      }
    };

    const handlePointerUp = () => {
      if (!interaction.moved && interaction.type === 'move') {
        onOpenBooking(interaction.booking);
      } else if (interaction.moved) {
        void onUpdateBooking(interaction.booking, interaction.preview);
      }
      setInteraction(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dates.length, interaction, onOpenBooking, onUpdateBooking, rooms, startDate]);

  const previewBooking = interaction?.preview
    ? {
        ...interaction.booking,
        ...interaction.preview,
      }
    : null;

  return (
    <div className="relative overflow-hidden rounded bg-white border border-bcom-border shadow-card">
      <div className="max-h-[70vh] overflow-auto" ref={contentRef}>
        <div style={{ minWidth: ROOM_COLUMN_WIDTH + timelineWidth }}>

          {/* Header row */}
          <div className="sticky top-0 z-30 flex border-b border-bcom-border bg-bcom-navy">
            <div
              className="sticky left-0 z-40 flex shrink-0 flex-col justify-center border-r border-white/20 bg-bcom-navy px-4 py-3"
              style={{ width: ROOM_COLUMN_WIDTH }}
            >
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">Rooms</span>
              <span className="mt-0.5 text-sm font-bold text-white">{formatMonthLabel(startDate)}</span>
            </div>

            {dates.map((date) => (
              <div
                key={date}
                className={`shrink-0 border-r border-white/10 px-1 py-3 text-center ${
                  date === today ? 'bg-bcom-yellow/20' : isWeekend(date) ? 'bg-white/5' : ''
                }`}
                style={{ width: DAY_WIDTH }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
                  {formatWeekday(date)}
                </div>
                <div className={`mt-0.5 text-sm font-bold ${date === today ? 'text-bcom-yellow' : 'text-white'}`}>
                  {formatDayNumber(date)}
                </div>
              </div>
            ))}
          </div>

          {/* Body rows */}
          <div ref={bodyRef}>
            {rooms.map((room, idx) => (
              <div
                key={room.id}
                className={`flex border-b border-bcom-border last:border-b-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-bcom-gray/40'}`}
              >
                <div
                  className="sticky left-0 z-10 flex shrink-0 flex-col justify-center border-r border-bcom-border bg-white px-4"
                  style={{ width: ROOM_COLUMN_WIDTH, height: ROW_HEIGHT }}
                >
                  <div className="text-sm font-semibold text-bcom-navy">{room.name}</div>
                  <div className="text-xs text-bcom-muted mt-0.5">
                    {room.type} · Floor {room.floor}
                  </div>
                </div>

                <div className="relative" style={{ width: timelineWidth, height: ROW_HEIGHT }}>
                  <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${dates.length}, ${DAY_WIDTH}px)` }}
                  >
                    {dates.map((date) => (
                      <button
                        type="button"
                        key={`${room.id}-${date}`}
                        className={`border-r border-bcom-border/50 transition hover:bg-bcom-blue-light/60 ${
                          date === today ? 'bg-bcom-yellow/8' : isWeekend(date) ? 'bg-bcom-gray/60' : ''
                        }`}
                        onPointerDown={() => {
                          setSelection({
                            roomId: room.id,
                            start: date,
                            end: date,
                          });
                        }}
                        onPointerEnter={() => {
                          if (selection?.roomId === room.id) {
                            setSelection((current) => ({
                              ...current,
                              end: date,
                            }));
                          }
                        }}
                        aria-label={`Create booking for ${room.name} on ${formatLongDate(date)}`}
                      />
                    ))}
                  </div>

                  {/* Selection preview */}
                  {selection?.roomId === room.id ? (
                    <div
                      className="absolute top-1.5 rounded border-2 border-dashed border-bcom-blue bg-bcom-blue-light/60"
                      style={{
                        left:
                          Math.min(diffDays(startDate, selection.start), diffDays(startDate, selection.end)) *
                            DAY_WIDTH +
                          3,
                        width:
                          (Math.abs(diffDays(selection.start, selection.end)) + 1) * DAY_WIDTH - 6,
                        height: ROW_HEIGHT - 12,
                      }}
                    />
                  ) : null}

                  {/* Booking blocks */}
                  {(bookingsByRoom.get(room.id) || []).map((booking) => {
                    const span = getRowBookingSpan(booking, startDate, daysVisible);
                    if (!span) {
                      return null;
                    }

                    const isActive = interaction?.booking.id === booking.id;
                    return (
                      <div
                        key={booking.id}
                        className={`absolute top-1.5 flex items-center rounded border transition ${
                          getBookingTone(booking)
                        } ${isActive ? 'opacity-30' : 'opacity-100'}`}
                        style={{
                          left: span.start * DAY_WIDTH + 3,
                          width: span.length * DAY_WIDTH - 6,
                          height: ROW_HEIGHT - 12,
                        }}
                        onMouseEnter={(event) => {
                          setTooltip({
                            booking,
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }}
                        onMouseMove={(event) => {
                          setTooltip((current) =>
                            current
                              ? {
                                  ...current,
                                  x: event.clientX,
                                  y: event.clientY,
                                }
                              : null
                          );
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {/* Resize left handle */}
                        <button
                          type="button"
                          className="h-full w-2.5 cursor-ew-resize rounded-l bg-black/10 shrink-0"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            setInteraction({
                              type: 'resize-start',
                              booking,
                              moved: false,
                              preview: {
                                room_id: booking.room_id,
                                check_in: booking.check_in,
                                check_out: booking.check_out,
                              },
                            });
                          }}
                          aria-label={`Resize start of ${booking.guest_name}`}
                        />

                        {/* Booking content */}
                        <button
                          type="button"
                          className="flex h-full flex-1 items-center gap-1.5 overflow-hidden px-2 text-left"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            const anchorOffset = clamp(
                              Math.floor((event.clientX - event.currentTarget.getBoundingClientRect().left) / DAY_WIDTH),
                              0,
                              diffDays(booking.check_in, booking.check_out) - 1
                            );
                            setInteraction({
                              type: 'move',
                              booking,
                              moved: false,
                              duration: diffDays(booking.check_in, booking.check_out),
                              anchorOffset,
                              preview: {
                                room_id: booking.room_id,
                                check_in: booking.check_in,
                                check_out: booking.check_out,
                              },
                            });
                          }}
                        >
                          <span className="truncate text-xs font-semibold leading-tight">{booking.guest_name}</span>
                          <span className="hidden shrink-0 rounded bg-black/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide md:inline-flex">
                            {booking.source}
                          </span>
                        </button>

                        {/* Resize right handle */}
                        <button
                          type="button"
                          className="h-full w-2.5 cursor-ew-resize rounded-r bg-black/10 shrink-0"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            setInteraction({
                              type: 'resize-end',
                              booking,
                              moved: false,
                              preview: {
                                room_id: booking.room_id,
                                check_in: booking.check_in,
                                check_out: booking.check_out,
                              },
                            });
                          }}
                          aria-label={`Resize end of ${booking.guest_name}`}
                        />
                      </div>
                    );
                  })}

                  {/* Drag preview */}
                  {previewBooking?.room_id === room.id ? (
                    (() => {
                      const span = getRowBookingSpan(previewBooking, startDate, daysVisible);
                      if (!span) {
                        return null;
                      }

                      return (
                        <div
                          className="pointer-events-none absolute top-1.5 rounded border-2 border-dashed border-bcom-blue bg-bcom-blue-light/50"
                          style={{
                            left: span.start * DAY_WIDTH + 3,
                            width: span.length * DAY_WIDTH - 6,
                            height: ROW_HEIGHT - 12,
                          }}
                        />
                      );
                    })()
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded border border-bcom-border bg-white px-3 py-2.5 text-sm shadow-panel"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y + 16,
          }}
        >
          <div className="font-semibold text-bcom-navy">{tooltip.booking.guest_name}</div>
          <div className="mt-1 text-bcom-muted text-xs">
            {tooltip.booking.room_name} · {tooltip.booking.source}
          </div>
          <div className="mt-0.5 text-bcom-muted text-xs">
            {formatLongDate(tooltip.booking.check_in)} → {formatLongDate(addDays(tooltip.booking.check_out, -1))}
          </div>
          {tooltip.booking.note ? (
            <div className="mt-1.5 border-t border-bcom-border pt-1.5 text-xs text-bcom-text">
              {tooltip.booking.note}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
