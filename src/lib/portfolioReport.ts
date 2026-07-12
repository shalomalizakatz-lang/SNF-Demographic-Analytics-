import type { FacilityRecord, FacilityKind, SnfRecord, HospitalRecord } from '../types/facility'
import type { SavedFacilityRow } from '../data/db'
import { withinRadius } from './market'
import { haversineMiles, roundMile } from './geo'

export interface PortfolioMemberResolved {
  row: SavedFacilityRow
  facility: FacilityRecord
}

export interface PortfolioDistance {
  a: PortfolioMemberResolved
  b: PortfolioMemberResolved
  distanceMiles: number
}

export interface SharedNear {
  member: PortfolioMemberResolved
  distanceMiles: number
}

export interface SharedFacility<T extends FacilityRecord> {
  facility: T
  near: SharedNear[]
}

export interface PortfolioReportData {
  members: PortfolioMemberResolved[]
  distances: PortfolioDistance[]
  competitorsByMemberId: Map<string, { facility: SnfRecord; distanceMiles: number }[]>
  sharedCompetitors: SharedFacility<SnfRecord>[]
  uniqueCompetitorCount: number
  hospitalsByMemberId: Map<string, { facility: HospitalRecord; distanceMiles: number }[]>
  sharedHospitals: SharedFacility<HospitalRecord>[]
  uniqueHospitalCount: number
  statesCovered: string[]
}

export function resolvePortfolioMembers(
  memberIds: string[],
  saved: SavedFacilityRow[],
  snfs: SnfRecord[],
  hospitals: HospitalRecord[]
): PortfolioMemberResolved[] {
  const members: PortfolioMemberResolved[] = []
  for (const id of memberIds) {
    const row = saved.find((s) => s.id === id)
    if (!row) continue
    const facility: FacilityRecord | undefined =
      row.kind === 'snf' ? snfs.find((s) => s.ccn === row.ccn) : hospitals.find((h) => h.ccn === row.ccn)
    if (facility) members.push({ row, facility })
  }
  return members
}

/**
 * For every portfolio member, finds nearby facilities from `pool` (within that member's own
 * saved radius), excluding any pool facility that is itself a portfolio member. Returns both the
 * per-member lists and the subset found near 2+ members ("shared").
 */
function buildProximity<T extends FacilityRecord>(
  members: PortfolioMemberResolved[],
  pool: T[],
  poolKind: FacilityKind,
  excludeCcns: Set<string>
): {
  byMemberId: Map<string, { facility: T; distanceMiles: number }[]>
  shared: SharedFacility<T>[]
  uniqueCount: number
} {
  const byMemberId = new Map<string, { facility: T; distanceMiles: number }[]>()
  const hits = new Map<string, SharedFacility<T>>()

  for (const member of members) {
    const memberId = `${member.facility.kind}:${member.facility.ccn}`
    if (member.facility.latitude == null || member.facility.longitude == null) {
      byMemberId.set(memberId, [])
      continue
    }
    const nearby = withinRadius(
      { latitude: member.facility.latitude, longitude: member.facility.longitude },
      pool,
      member.row.radiusMiles,
      member.facility.kind === poolKind ? member.facility.ccn : undefined
    ).filter((r) => !excludeCcns.has(r.facility.ccn))

    byMemberId.set(
      memberId,
      nearby.map((r) => ({ facility: r.facility, distanceMiles: r.distanceMiles }))
    )

    for (const r of nearby) {
      const entry = hits.get(r.facility.ccn) ?? { facility: r.facility, near: [] }
      entry.near.push({ member, distanceMiles: r.distanceMiles })
      hits.set(r.facility.ccn, entry)
    }
  }

  const shared = [...hits.values()]
    .filter((c) => c.near.length >= 2)
    .sort((x, y) => {
      if (y.near.length !== x.near.length) return y.near.length - x.near.length
      return Math.min(...x.near.map((n) => n.distanceMiles)) - Math.min(...y.near.map((n) => n.distanceMiles))
    })

  return { byMemberId, shared, uniqueCount: hits.size }
}

export function buildPortfolioReport(
  members: PortfolioMemberResolved[],
  snfs: SnfRecord[],
  hospitals: HospitalRecord[]
): PortfolioReportData {
  const memberSnfCcns = new Set(members.filter((m) => m.facility.kind === 'snf').map((m) => m.facility.ccn))
  const memberHospitalCcns = new Set(members.filter((m) => m.facility.kind === 'hospital').map((m) => m.facility.ccn))

  const distances: PortfolioDistance[] = []
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]
      const b = members[j]
      if (a.facility.latitude == null || a.facility.longitude == null) continue
      if (b.facility.latitude == null || b.facility.longitude == null) continue
      const distanceMiles = roundMile(
        haversineMiles(a.facility.latitude, a.facility.longitude, b.facility.latitude, b.facility.longitude)
      )
      distances.push({ a, b, distanceMiles })
    }
  }
  distances.sort((x, y) => x.distanceMiles - y.distanceMiles)

  const competitors = buildProximity(members, snfs, 'snf', memberSnfCcns)
  const hospitalProximity = buildProximity(members, hospitals, 'hospital', memberHospitalCcns)

  const statesCovered = [...new Set(members.map((m) => m.facility.state).filter((s): s is string => Boolean(s)))]

  return {
    members,
    distances,
    competitorsByMemberId: competitors.byMemberId,
    sharedCompetitors: competitors.shared,
    uniqueCompetitorCount: competitors.uniqueCount,
    hospitalsByMemberId: hospitalProximity.byMemberId,
    sharedHospitals: hospitalProximity.shared,
    uniqueHospitalCount: hospitalProximity.uniqueCount,
    statesCovered
  }
}
