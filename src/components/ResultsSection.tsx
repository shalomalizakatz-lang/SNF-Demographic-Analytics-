import { useMemo, useState } from 'react'
import type { FacilityRecord, FacilityWithDistance } from '../types/facility'
import { FacilityRow } from './FacilityRow'

type SortKey = 'distance' | 'name' | 'beds' | 'occupancy' | 'rating'

export function ResultsSection({
  title,
  items,
  savedIds,
  onToggleSave
}: {
  title: string
  items: FacilityWithDistance<FacilityRecord>[]
  savedIds: Set<string>
  onToggleSave: (facility: FacilityRecord) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('distance')
  const [asc, setAsc] = useState(true)

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      let diff = 0
      switch (sortKey) {
        case 'distance':
          diff = a.distanceMiles - b.distanceMiles
          break
        case 'name':
          diff = a.facility.name.localeCompare(b.facility.name)
          break
        case 'beds':
          diff = (a.facility.certifiedBeds ?? -1) - (b.facility.certifiedBeds ?? -1)
          break
        case 'occupancy':
          diff = (a.facility.occupancyPct ?? -1) - (b.facility.occupancyPct ?? -1)
          break
        case 'rating':
          diff = (a.facility.overallRating ?? -1) - (b.facility.overallRating ?? -1)
          break
      }
      return asc ? diff : -diff
    })
    return copy
  }, [items, sortKey, asc])

  function handleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v)
    else {
      setSortKey(key)
      setAsc(true)
    }
  }

  const sortBtn = (key: SortKey, label: string, extraClass = '') => (
    <button
      onClick={() => handleSort(key)}
      className={`text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 ${extraClass}`}
    >
      {label}
      {sortKey === key ? (asc ? ' ▲' : ' ▼') : ''}
    </button>
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <h2 className="border-b border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-800">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">None within this radius</p>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 border-b border-slate-100 px-3 py-1.5 dark:border-slate-800">
            {sortBtn('name', 'Name')}
            {sortBtn('distance', 'Distance', 'w-16 text-right')}
            {sortBtn('beds', 'Beds', 'w-14 text-right')}
            {sortBtn('occupancy', 'Occupancy', 'w-28 text-right')}
            {sortBtn('rating', 'Rating', 'w-24 text-right')}
            <span className="w-6" />
          </div>
          <div>
            {sorted.map(({ facility, distanceMiles }) => (
              <FacilityRow
                key={facility.ccn}
                facility={facility}
                distanceMiles={distanceMiles}
                saved={savedIds.has(`${facility.kind}:${facility.ccn}`)}
                onToggleSave={() => onToggleSave(facility)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
