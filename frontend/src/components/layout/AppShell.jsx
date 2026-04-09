export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-bcom-gray">
      {/* Booking.com-style top navigation */}
      <header className="bg-bcom-navy">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white tracking-tight">Le Canal</span>
                <span className="rounded bg-bcom-yellow px-1.5 py-0.5 text-[10px] font-bold text-bcom-navy uppercase tracking-wide">
                  Extranet
                </span>
              </div>
              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-1">
                <a href="#" className="rounded px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition font-medium">
                  Calendar
                </a>
                <a href="#" className="rounded px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition">
                  Rates & Availability
                </a>
                <a href="#" className="rounded px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition">
                  Property
                </a>
                <a href="#" className="rounded px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition">
                  Guest Reviews
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="rounded px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition">
                Help
              </button>
              <div className="h-8 w-8 rounded-full bg-bcom-blue flex items-center justify-center text-white text-sm font-bold">
                LC
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-[1400px] px-4 py-5">
        {children}
      </main>
    </div>
  );
}
