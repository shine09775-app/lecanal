import { useEffect, useState } from 'react';
import { addDays } from '../../lib/date';

const defaultForm = {
  guest_name: '',
  source: 'Direct',
  room_id: '',
  check_in: '',
  check_out: '',
  status: 'confirmed',
  note: '',
};

function buildFormValue(booking, draft) {
  if (booking) {
    return {
      guest_name: booking.guest_name,
      source: booking.source,
      room_id: String(booking.room_id),
      check_in: booking.check_in,
      check_out: booking.check_out,
      status: booking.status,
      note: booking.note || '',
    };
  }

  if (draft) {
    return {
      ...defaultForm,
      room_id: String(draft.room_id),
      check_in: draft.check_in,
      check_out: draft.check_out || addDays(draft.check_in, 1),
    };
  }

  return defaultForm;
}

const inputClass =
  'w-full rounded border border-bcom-border px-3 py-2 text-sm text-bcom-text outline-none transition focus:border-bcom-blue focus:ring-2 focus:ring-bcom-blue/20 bg-white';

const labelClass = 'block text-xs font-semibold text-bcom-muted mb-1 uppercase tracking-wide';

export default function BookingModal({
  open,
  booking,
  draft,
  rooms,
  error,
  busy,
  onClose,
  onSubmit,
  onDelete,
  onExtendStay,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (open) {
      setForm(buildFormValue(booking, draft));
    }
  }, [booking, draft, open]);

  if (!open) {
    return null;
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      room_id: Number(form.room_id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center">
      <div className="w-full max-w-2xl rounded bg-white shadow-panel overflow-hidden">

        {/* Modal header — booking.com style */}
        <div className="bg-bcom-navy px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/60 uppercase tracking-wide">
              {booking ? 'Edit reservation' : 'New reservation'}
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {booking ? booking.guest_name : 'Create booking'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Guest name</label>
                <input
                  className={inputClass}
                  value={form.guest_name}
                  onChange={handleChange('guest_name')}
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Source</label>
                <select
                  className={inputClass}
                  value={form.source}
                  onChange={handleChange('source')}
                >
                  <option>Direct</option>
                  <option>Walk-in</option>
                  <option>Booking.com</option>
                  <option>Airbnb</option>
                  <option>Agoda</option>
                  <option>Internal</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Room</label>
                <select
                  className={inputClass}
                  value={form.room_id}
                  onChange={handleChange('room_id')}
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} — {room.type} — Floor {room.floor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={handleChange('status')}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="ota">OTA</option>
                  <option value="blocked">Blocked / Maintenance</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Check-in date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.check_in}
                  onChange={handleChange('check_in')}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Check-out date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.check_out}
                  onChange={handleChange('check_out')}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                rows="3"
                className={inputClass}
                value={form.note}
                onChange={handleChange('note')}
                placeholder="Optional notes about this booking..."
              />
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-bcom-border">
              <div className="flex flex-wrap gap-2">
                {booking ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onExtendStay(booking)}
                      className="rounded border border-bcom-border px-3 py-2 text-sm font-medium text-bcom-text hover:bg-bcom-gray transition-colors disabled:opacity-50"
                      disabled={busy}
                    >
                      +1 Night
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(booking)}
                      className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-bcom-border px-4 py-2 text-sm font-medium text-bcom-text hover:bg-bcom-gray transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-bcom-blue px-4 py-2 text-sm font-semibold text-white hover:bg-bcom-blue-dark transition-colors disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? 'Saving...' : booking ? 'Save changes' : 'Create booking'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
