import { useEffect, useRef, useState } from 'react';
import { request } from './api/http';

// ─── helpers ───────────────────────────────────────────────────────────────

function getBookingId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
}

// ─── Image compression ─────────────────────────────────────────────────────
// ย่อรูปบน browser ก่อนส่ง: resize → max 900px wide, JPEG quality 0.72
// ผลลัพธ์: รูป 5MB → ~100-180KB (ลดลง 96%)

function compressImage(file, { maxWidth = 900, maxHeight = 1200, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // scale down ถ้าเกิน max
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', quality);
        // คำนวณขนาดโดยประมาณ (bytes)
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);
        resolve({ base64, sizeKB });
      };
      img.onerror = () => reject(new Error('Cannot read image'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('Cannot read file'));
    reader.readAsDataURL(file);
  });
}

// ─── Photo Upload component ────────────────────────────────────────────────

function PhotoUpload({ onPhotoChange }) {
  const [preview, setPreview]   = useState('');
  const [sizeKB,  setSizeKB]   = useState(null);
  const [loading, setLoading]  = useState(false);
  const [error,   setError]    = useState('');
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const { base64, sizeKB: kb } = await compressImage(file);
      setPreview(base64);
      setSizeKB(kb);
      onPhotoChange(base64);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleClear() {
    setPreview('');
    setSizeKB(null);
    onPhotoChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Passport / ID Photo
          <span className="ml-1 text-gray-400 font-normal normal-case">(optional)</span>
        </span>
        {preview && (
          <button type="button" onClick={handleClear} className="text-xs text-blue-600 hover:underline">
            Remove
          </button>
        )}
      </div>

      {preview ? (
        // Preview หลังอัปโหลด
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={preview}
            alt="ID preview"
            className="w-full object-contain max-h-52"
          />
          <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-white font-medium">
            {sizeKB} KB
          </div>
        </div>
      ) : (
        // Drop zone
        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm text-gray-500">Tap to take photo or upload</span>
              <span className="text-xs text-gray-400">Photo will be compressed automatically</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />
        </label>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// ─── Signature Pad ─────────────────────────────────────────────────────────

function SignaturePad({ onSignatureChange }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);

  function getPos(e, canvas) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing.current  = true;
    lastPos.current  = getPos(e, canvasRef.current);
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    lastPos.current = pos;
  }

  function endDraw(e) {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    onSignatureChange(canvasRef.current.toDataURL('image/png'));
  }

  function clearPad() {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange('');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Guest Signature
        </span>
        <button type="button" onClick={clearPad} className="text-xs text-blue-600 hover:underline">
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={200}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        className="w-full rounded border-2 border-dashed border-gray-300 bg-gray-50 cursor-crosshair touch-none"
        style={{ height: '160px' }}
      />
      <p className="mt-1 text-center text-xs text-gray-400">
        Sign in the box above with your finger or stylus
      </p>
    </div>
  );
}

// ─── Booking Summary Card ───────────────────────────────────────────────────

function BookingSummary({ booking }) {
  const nights = nightCount(booking.check_in, booking.check_out);
  return (
    <div className="rounded-xl bg-[#003580] text-white p-5 shadow-lg mb-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-0.5">
            Le Canal Boutique House
          </p>
          <h2 className="text-xl font-bold leading-tight">{booking.guest_name}</h2>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          Room {booking.room_name}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-white/10 px-2 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-200 mb-0.5">Check-in</div>
          <div className="text-sm font-bold">{formatDate(booking.check_in)}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-2 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-200 mb-0.5">Nights</div>
          <div className="text-2xl font-bold">{nights}</div>
        </div>
        <div className="rounded-lg bg-white/10 px-2 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-200 mb-0.5">Check-out</div>
          <div className="text-sm font-bold">{formatDate(booking.check_out)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-blue-200">
        <span>{booking.room_type}</span>
        <span>·</span>
        <span>Floor {booking.room_floor}</span>
        <span>·</span>
        <span className="capitalize">{booking.source}</span>
      </div>
    </div>
  );
}

// ─── Success Screen ─────────────────────────────────────────────────────────

function SuccessScreen({ booking }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-in Complete!</h1>
        <p className="text-gray-500 mb-1">Welcome to Le Canal Boutique House</p>
        <p className="text-gray-700 font-semibold mb-6">{booking.guest_name}</p>
        <div className="rounded-xl bg-white border border-gray-200 p-4 text-left shadow-sm">
          <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Room</span>
            <span className="font-semibold">{booking.room_name} — {booking.room_type}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Check-out</span>
            <span className="font-semibold">{formatDate(booking.check_out)}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span className="text-gray-500">Nights</span>
            <span className="font-semibold">{nightCount(booking.check_in, booking.check_out)}</span>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          Old City · Chiang Mai, Thailand<br />
          Your key is ready at the front desk.
        </p>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white';
const labelClass = 'block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide';

const ID_TYPES = [
  { value: 'passport',       label: 'Passport' },
  { value: 'national_id',    label: 'National ID' },
  { value: 'driver_license', label: "Driver's License" },
  { value: 'other',          label: 'Other' },
];

export default function CheckinApp() {
  const bookingId = getBookingId();
  const [state,    setState]    = useState('loading'); // loading | error | form | already_done | success
  const [booking,  setBooking]  = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving,   setSaving]   = useState(false);

  const [form, setForm] = useState({
    nationality: '',
    id_type:     'passport',
    id_number:   '',
    phone:       '',
  });
  const [signature,  setSignature]  = useState('');
  const [photoData,  setPhotoData]  = useState('');
  const [formError,  setFormError]  = useState('');

  useEffect(() => {
    if (!bookingId) {
      setState('error');
      setErrorMsg('No booking ID provided. Please ask the front desk for the correct link.');
      return;
    }

    request(`/checkin/${bookingId}`)
      .then(({ booking: b, checkin }) => {
        setBooking(b);
        if (checkin) {
          setForm({
            nationality: checkin.nationality || '',
            id_type:     checkin.id_type     || 'passport',
            id_number:   checkin.id_number   || '',
            phone:       checkin.phone       || '',
          });
          setState('already_done');
        } else {
          setState('form');
        }
      })
      .catch((err) => {
        setState('error');
        setErrorMsg(err.message || 'Could not load booking. Please try again.');
      });
  }, [bookingId]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!form.nationality.trim()) {
      setFormError('Please enter your nationality.');
      return;
    }
    if (!form.id_number.trim()) {
      setFormError('Please enter your passport / ID number.');
      return;
    }
    if (!signature) {
      setFormError('Please sign in the signature box before submitting.');
      return;
    }

    setSaving(true);
    try {
      const { booking: updated } = await request(`/checkin/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          signature_data: signature,
          photo_data:     photoData,
        }),
      });
      setBooking(updated);
      setState('success');
    } catch (err) {
      setFormError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── loading ──
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your reservation…</p>
        </div>
      </div>
    );
  }

  // ── error ──
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Booking not found</h2>
          <p className="text-sm text-gray-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // ── success ──
  if (state === 'success') {
    return <SuccessScreen booking={booking} />;
  }

  const alreadyDone = state === 'already_done';

  // ── main form ──
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#003580] px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm">
          LC
        </div>
        <div>
          <div className="text-xs text-blue-200 font-medium">Le Canal Boutique House</div>
          <div className="text-white font-semibold text-sm">Guest Check-In</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Already-done banner */}
        {alreadyDone && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            You have already checked in. You can update your details below if needed.
          </div>
        )}

        {/* Booking summary */}
        {booking && <BookingSummary booking={booking} />}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Guest info ── */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100">
              Guest Information
            </h3>

            <div>
              <label className={labelClass}>Nationality</label>
              <input
                className={inputClass}
                value={form.nationality}
                onChange={handleChange('nationality')}
                placeholder="e.g. German, French, Thai…"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>ID Type</label>
                <select className={inputClass} value={form.id_type} onChange={handleChange('id_type')}>
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>ID / Passport No.</label>
                <input
                  className={inputClass}
                  value={form.id_number}
                  onChange={handleChange('id_number')}
                  placeholder="Number"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Phone number{' '}
                <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="+66 or international"
              />
            </div>
          </div>

          {/* ── Photo upload ── */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
            <PhotoUpload onPhotoChange={setPhotoData} />
          </div>

          {/* ── Signature ── */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5">
            <SignaturePad onSignatureChange={setSignature} />
          </div>

          {/* Error */}
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#003580] py-3.5 text-sm font-bold text-white shadow hover:bg-blue-900 active:scale-[0.98] transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : alreadyDone ? 'Update Check-in' : 'Complete Check-in →'}
          </button>

          <p className="text-center text-xs text-gray-400 pb-4">
            Le Canal Boutique House · Old City, Chiang Mai<br />
            Your information is kept securely and used for hotel registration only.
          </p>
        </form>
      </div>
    </div>
  );
}
