import { db } from './db'
import { lookupWikipediaPhoto } from './wikipedia'

const PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined

export interface PlaceInfo {
  website: string | null
  photoUrl: string | null
}

let sdkLoadPromise: Promise<typeof google | null> | null = null

function loadPlacesSdk(): Promise<typeof google | null> {
  if (!PLACES_KEY) return Promise.resolve(null)
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise((resolve) => {
    if (typeof google !== 'undefined' && google.maps?.places) {
      resolve(google)
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_KEY}&libraries=places&loading=async`
    script.async = true
    script.onload = () => resolve(typeof google !== 'undefined' ? google : null)
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
  return sdkLoadPromise
}

/** Website + real cover photo via the paid Google Places API — only attempted if a key is configured. */
async function lookupViaGooglePlaces(name: string, city: string, state: string): Promise<PlaceInfo | null> {
  const g = await loadPlacesSdk()
  if (!g?.maps?.places) return null

  return new Promise((resolve) => {
    const div = document.createElement('div')
    const service = new g.maps.places.PlacesService(div)
    service.textSearch({ query: `${name} ${city} ${state}` }, (results, status) => {
      if (status !== g.maps.places.PlacesServiceStatus.OK || !results?.[0]?.place_id) {
        resolve(null)
        return
      }
      service.getDetails(
        { placeId: results[0].place_id, fields: ['website', 'photos'] },
        (place, detailStatus) => {
          if (detailStatus !== g.maps.places.PlacesServiceStatus.OK || !place) {
            resolve(null)
            return
          }
          resolve({
            website: place.website ?? null,
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 480 }) ?? null
          })
        }
      )
    })
  })
}

/**
 * Looks up a cover photo (and website, if the optional paid Google Places key is
 * configured) for a facility. Cached in IndexedDB by CCN so each facility is only
 * ever looked up once per browser. Prefers Google Places (real facility photo)
 * when available, otherwise tries Wikipedia (free, no key) before giving up.
 */
export async function lookupPlaceInfo(
  ccn: string,
  name: string,
  city: string,
  state: string
): Promise<PlaceInfo | null> {
  const cached = await db.places.get(ccn)
  if (cached) return { website: cached.website, photoUrl: cached.photoUrl }

  let result: PlaceInfo | null = null
  if (PLACES_KEY) {
    result = await lookupViaGooglePlaces(name, city, state)
  }
  if (!result?.photoUrl) {
    const wikiPhoto = await lookupWikipediaPhoto(name, city, state)
    result = { website: result?.website ?? null, photoUrl: wikiPhoto }
  }

  await db.places.put({ ccn, website: result.website, photoUrl: result.photoUrl, fetchedAt: new Date().toISOString() })
  return result
}

export const placesEnabled = Boolean(PLACES_KEY)
