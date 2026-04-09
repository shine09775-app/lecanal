function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-3 py-1.5 text-sm font-medium border transition-colors ${
        active
          ? 'bg-bcom-blue-light border-bcom-blue text-bcom-blue font-semibold'
          : 'bg-white border-bcom-border text-bcom-text hover:bg-bcom-gray hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  );
}

export default function FiltersBar({
  roomTypes,
  selectedRoomType,
  onRoomTypeChange,
  floors,
  selectedFloor,
  onFloorChange,
}) {
  return (
    <div className="rounded bg-white border border-bcom-border shadow-card p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-bcom-muted uppercase tracking-wide w-20 shrink-0">Room type</span>
          <FilterButton active={selectedRoomType === 'All'} onClick={() => onRoomTypeChange('All')}>
            All types
          </FilterButton>
          {roomTypes.map((type) => (
            <FilterButton
              key={type}
              active={selectedRoomType === type}
              onClick={() => onRoomTypeChange(type)}
            >
              {type}
            </FilterButton>
          ))}
        </div>

        <div className="border-t border-bcom-border" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-bcom-muted uppercase tracking-wide w-20 shrink-0">Floor</span>
          <FilterButton active={selectedFloor === 'All'} onClick={() => onFloorChange('All')}>
            All floors
          </FilterButton>
          {floors.map((floor) => (
            <FilterButton
              key={floor}
              active={selectedFloor === String(floor)}
              onClick={() => onFloorChange(String(floor))}
            >
              Floor {floor}
            </FilterButton>
          ))}
        </div>
      </div>
    </div>
  );
}
