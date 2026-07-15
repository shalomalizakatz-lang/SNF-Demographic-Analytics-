import type { FacilityRecord, SnfRecord, HospitalRecord } from '../types/facility'
import type { SavedFacilityRow } from '../data/db'
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

export interface PortfolioReportData {
  members: PortfolioMemberResolved[]
  distances: PortfolioDistance[]
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

/** Pairwise straight-line distances between every two portfolio members that both have coordinates. */
export function buildPortfolioReport(members: PortfolioMemberResolved[]): PortfolioReportData {
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

  const statesCovered = [...new Set(members.map((m) => m.facility.state).filter((s): s is string => Boolean(s)))]

  return { members, distances, statesCovered }
}
