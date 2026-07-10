import { getAvatarColor, getInitials } from '../lib/initialsAvatar'

export function PlaceholderImage({ name, className }: { name: string; className?: string }) {
  const color = getAvatarColor(name)
  const initials = getInitials(name)
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`${name} placeholder image`}>
      <rect width="64" height="64" rx="8" fill={color} />
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="22" fontWeight="600" fontFamily="system-ui, sans-serif">
        {initials}
      </text>
    </svg>
  )
}
