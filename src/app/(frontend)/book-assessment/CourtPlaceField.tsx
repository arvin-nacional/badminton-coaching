'use client'

import { CheckCircle2, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type GooglePlace = {
  displayName?: string
  formattedAddress?: string
  fetchFields: (options: { fields: string[] }) => Promise<void>
}

type PlacePredictionSelectEvent = Event & {
  placePrediction: { toPlace: () => GooglePlace }
}

type PlaceAutocompleteElement = HTMLElement & {
  description: string
  includedRegionCodes: string[]
  locationBias: { center: { lat: number; lng: number }; radius: number }
  maxlength: number
  placeholder: string
  requestedLanguage: string
  requestedRegion: string
  value: string
}

type PlacesLibrary = {
  PlaceAutocompleteElement: new () => PlaceAutocompleteElement
}

type GoogleMapsWindow = Window & {
  __nextShotGoogleMapsReady?: () => void
  google?: {
    maps?: {
      importLibrary: (library: 'places') => Promise<PlacesLibrary>
    }
  }
}

const mapsScriptID = 'google-maps-places-api'
const mapsCallback = '__nextShotGoogleMapsReady'
const metroManila = { lat: 14.5995, lng: 120.9842 }
let mapsLoaderPromise: Promise<void> | undefined

const loadGoogleMaps = (apiKey: string) => {
  const mapsWindow = window as GoogleMapsWindow
  if (mapsWindow.google?.maps?.importLibrary) return Promise.resolve()
  if (mapsLoaderPromise) return mapsLoaderPromise

  mapsLoaderPromise = new Promise<void>((resolve, reject) => {
    document.getElementById(mapsScriptID)?.remove()

    const script = document.createElement('script')
    const cleanup = () => {
      delete mapsWindow.__nextShotGoogleMapsReady
      script.onerror = null
    }

    mapsWindow.__nextShotGoogleMapsReady = () => {
      cleanup()
      resolve()
    }
    script.id = mapsScriptID
    script.async = true
    script.onerror = () => {
      cleanup()
      reject(new Error('Google Maps could not be loaded.'))
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=places&v=weekly&language=en&region=PH&callback=${mapsCallback}`
    document.head.appendChild(script)
  }).catch((error) => {
    mapsLoaderPromise = undefined
    throw error
  })

  return mapsLoaderPromise
}

const formatLocation = (place: GooglePlace) => {
  const name = place.displayName?.trim() || ''
  const address = place.formattedAddress?.trim() || ''

  if (!name) return address.slice(0, 200)
  if (!address || address.toLocaleLowerCase().includes(name.toLocaleLowerCase())) {
    return (address || name).slice(0, 200)
  }

  return `${name}, ${address}`.slice(0, 200)
}

export function CourtPlaceField({
  apiKey,
  onChange,
  value,
}: {
  apiKey?: string
  onChange: (value: string) => void
  value: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsFailed, setMapsFailed] = useState(false)
  const useManualInput = !apiKey || mapsFailed

  useEffect(() => {
    if (!apiKey) return
    let active = true

    void loadGoogleMaps(apiKey)
      .then(() => {
        if (active) setMapsReady(true)
      })
      .catch(() => {
        if (active) setMapsFailed(true)
      })

    return () => {
      active = false
    }
  }, [apiKey])

  useEffect(() => {
    if (!mapsReady || !apiKey || mapsFailed || !containerRef.current) return

    let active = true
    let autocomplete: PlaceAutocompleteElement | undefined
    let selectedWidgetValue = ''

    const initialize = async () => {
      try {
        const maps = (window as GoogleMapsWindow).google?.maps
        if (!maps?.importLibrary) throw new Error('Google Maps did not initialize.')

        const { PlaceAutocompleteElement } = await maps.importLibrary('places')
        if (!active || !containerRef.current) return

        autocomplete = new PlaceAutocompleteElement()
        autocomplete.description = 'Search for the badminton court you reserved'
        autocomplete.includedRegionCodes = ['ph']
        autocomplete.locationBias = { center: metroManila, radius: 50_000 }
        autocomplete.maxlength = 200
        autocomplete.placeholder = 'Search court name, branch or address'
        autocomplete.requestedLanguage = 'en'
        autocomplete.requestedRegion = 'ph'
        autocomplete.className = 'block min-h-[50px] w-full text-[#092c59]'

        const handleInput = () => {
          if (autocomplete && autocomplete.value !== selectedWidgetValue) onChange('')
        }
        const handleSelect = async (event: Event) => {
          if (!autocomplete) return
          const inputAtSelection = autocomplete.value
          const place = (event as PlacePredictionSelectEvent).placePrediction.toPlace()

          try {
            await place.fetchFields({ fields: ['displayName', 'formattedAddress'] })
            if (!active || !autocomplete || autocomplete.value !== inputAtSelection) return

            const location = formatLocation(place)
            if (!location) throw new Error('The selected place has no usable address.')
            selectedWidgetValue = autocomplete.value
            onChange(location)
          } catch {
            if (active) {
              onChange('')
              setMapsFailed(true)
            }
          }
        }

        autocomplete.addEventListener('input', handleInput)
        autocomplete.addEventListener('gmp-select', handleSelect)
        containerRef.current.replaceChildren(autocomplete)

        return () => {
          autocomplete?.removeEventListener('input', handleInput)
          autocomplete?.removeEventListener('gmp-select', handleSelect)
        }
      } catch {
        if (active) setMapsFailed(true)
      }
    }

    let removeListeners: (() => void) | undefined
    void initialize().then((cleanup) => {
      removeListeners = cleanup
    })

    return () => {
      active = false
      removeListeners?.()
      autocomplete?.remove()
    }
  }, [apiKey, mapsFailed, mapsReady, onChange])

  return (
    <label className="grid gap-2 text-sm font-bold">
      Court you booked
      {useManualInput ? (
        <input
          required
          name="location"
          maxLength={200}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Court name, branch, address and court number"
          className="rounded-xl border border-[#092c59]/20 px-4 py-3 font-normal"
        />
      ) : (
        <>
          <div
            ref={containerRef}
            className="min-h-[52px] overflow-visible rounded-xl border border-[#092c59]/20 bg-white px-2 py-1"
          >
            {!mapsReady ? (
              <span className="flex min-h-[42px] items-center px-2 font-normal text-[#718399]">
                Loading Google court search…
              </span>
            ) : null}
          </div>
          <input name="location" type="hidden" value={value} />
          {value ? (
            <span
              aria-live="polite"
              className="flex items-start gap-2 rounded-xl bg-[#eef8f2] px-3 py-2 text-xs font-semibold leading-5 text-[#24734b]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {value}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs font-normal text-[#718399]">
              <MapPin className="h-3.5 w-3.5 text-[#1677ff]" /> Select a Google suggestion to
              confirm the exact venue.
            </span>
          )}
        </>
      )}
      <span className="text-xs font-normal leading-5 text-[#718399]">
        Coordinate and reserve the venue directly. Your coach will use this location to meet you.
      </span>
      {useManualInput ? (
        <span className="text-xs font-normal leading-5 text-[#8b6a31]">
          Google court search is unavailable, so enter the complete venue details manually.
        </span>
      ) : null}
    </label>
  )
}
