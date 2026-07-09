import { useState } from 'react'
import type { FacilityRecord } from '../types/facility'
import { TypeBadge } from './TypeBadge'
import { StarRating } from './StarRating'
import { PlaceholderImage } from './PlaceholderImage'
import { useLazyPlaceInfo } from '../hooks/useLazyPlaceInfo'
import { getOccupancyDisplay, getBedsDisplay, googleMapsDirectionsUrl, googleSearchUrl } from '../lib/facilityDisplay'

export function FacilityRow({
  facility,
  distanceMiles,
  saved,
  onToggleSave
}: {
  facility: FacilityRecord
  distanceMiles: number
  saved: boolean
  onToggleSave: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { ref, info } = useLazyPlaceInfo(facility.ccn, facility.name, facility.city, facility.state)
  const occupancy = getOccupancyDisplay(facility)
  const directionsUrl = googleMapsDirectionsUrl(facility)

  return (
    <div ref={ref} className="border-b border-slate-200 dark:border-slate-800">
      <button
        className="grid w-full grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2">
            <span className="truncate font-medium">{facility.name}</span>
            <TypeBadge facility={facility} />
            {facility.kind === 'snf' && facility.specialFocusFacility && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                SFF
              </span>
            )}
          </span>
          <span className="truncate text-xs text-slate-500 dark:text-slate-400">{facility.city}, {facility.state}</span>
        </span>
        <span className="w-16 text-right tabular-nums">{distanceMiles.toFixed(1)} mi</span>
        <span className="w-14 text-right tabular-nums">{getBedsDisplay(facility)} beds</span>
        <span className="flex w-28 flex-col items-end">
          <span className="tabular-nums">{occupancy.text}</span>
          {occupancy.asOfLabel && (
            <span className={`text-[10px] ${occupancy.historical ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              {occupancy.asOfLabel}
            </span>
          )}
        </span>
        <span className="w-24 text-right">
          <StarRating rating={facility.overallRating} />
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave()
          }}
          className={`px-1 text-lg ${saved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'}`}
          title={saved ? 'Remove from Deal Board' : 'Save to Deal Board'}
        >
          {saved ? '★' : '☆'}
        </button>
      </button>

      {expanded && (
        <div className="flex gap-4 bg-slate-50 px-3 py-3 dark:bg-slate-900/50">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
            {info?.photoUrl ? (
              <img src={info.photoUrl} alt={facility.name} className="h-full w-full object-cover" />
            ) : (
              <PlaceholderImage kind={facility.kind} className="h-full w-full" />
            )}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <div className="text-slate-600 dark:text-slate-300">{facility.address}</div>
            <div className="text-slate-600 dark:text-slate-300">
              {facility.city}, {facility.state} {facility.zip}
            </div>
            {facility.kind === 'snf' && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Health inspection: <StarRating rating={facility.healthInspectionRating} /></span>
                <span>Staffing: <StarRating rating={facility.staffingRating} /></span>
                <span>Quality measures: <StarRating rating={facility.qualityMeasureRating} /></span>
                {facility.ownershipType && <span>Ownership: {facility.ownershipType}</span>}
              </div>
            )}
            {facility.kind === 'hospital' && facility.emergencyServices != null && (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Emergency services: {facility.emergencyServices ? 'Yes' : 'No'}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {info?.website ? (
                <a href={info.website} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">
                  Website ↗
                </a>
              ) : (
                <a
                  href={googleSearchUrl(facility)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:underline dark:text-slate-400"
                >
                  Find online →
                </a>
              )}
              {directionsUrl && (
                <a href={directionsUrl} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">
                  Open in Google Maps ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
