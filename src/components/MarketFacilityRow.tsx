import type { MarketFacility } from '../lib/portfolioClusters'
import { StarRating } from './StarRating'

export function MarketFacilityRow({
  item,
  onClick
}: {
  item: MarketFacility
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full p-2 text-left text-sm disabled:cursor-default"
    >
      <div className="font-medium">
        {item.name}{' '}
        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
          {item.city}, {item.state}
        </span>
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
        <span>{item.beds != null ? item.beds : 'N/A'} beds</span>
        <span>{item.occupancy != null ? `${item.occupancy}%` : 'N/A'} occ</span>
        <StarRating rating={item.overallStars} />
        <span>
          {item.nearestMemberMiles} mi from {item.nearestMemberName}
        </span>
      </div>
    </button>
  )
}
