/**
 * Best-effort, free, keyless photo lookup via Wikipedia's public REST API — no
 * billing, no API key, generous rate limits for this kind of light client use.
 * Coverage is real but limited: most large/notable hospitals have a page with
 * an infobox photo, but the great majority of small SNFs do not, so this will
 * frequently come back empty (callers fall back to an initials avatar).
 *
 * Matching is a plain text search, not an exact lookup, so an unusual/generic
 * facility name occasionally risks matching an unrelated article. A light
 * heuristic below (requiring the matched title to contain the facility's
 * first significant word) filters out the most obvious false positives.
 */

interface WikiSearchResponse {
  query?: { search?: Array<{ title: string }> }
}

interface WikiSummaryResponse {
  thumbnail?: { source?: string }
  originalimage?: { source?: string }
}

function firstSignificantWord(name: string): string | null {
  const words = name.split(/\s+/).filter((w) => w.length > 3)
  return words[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? null
}

export async function lookupWikipediaPhoto(name: string, city: string, state: string): Promise<string | null> {
  try {
    const query = `${name} ${city} ${state}`
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch=${encodeURIComponent(query)}`
    const searchRes = await fetch(searchUrl)
    if (!searchRes.ok) return null
    const searchJson = (await searchRes.json()) as WikiSearchResponse
    const title = searchJson.query?.search?.[0]?.title
    if (!title) return null

    const keyword = firstSignificantWord(name)
    if (keyword && !title.toLowerCase().includes(keyword)) return null

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const summaryRes = await fetch(summaryUrl)
    if (!summaryRes.ok) return null
    const summaryJson = (await summaryRes.json()) as WikiSummaryResponse
    return summaryJson.thumbnail?.source ?? summaryJson.originalimage?.source ?? null
  } catch {
    return null
  }
}
