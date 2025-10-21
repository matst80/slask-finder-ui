import { useCallback, useEffect, useState } from 'react'
import { getLocation } from '../lib/datalayer/api'
import { cookieObject, setCookie } from '../utils'
import { YourLocation } from './map-utils'

const getStoredLocation = (): YourLocation | null => {
  const { location } = cookieObject()
  if (!location) return null
  const [lat, lng] = location.split(',').map((str) => parseFloat(str))
  if (!isNaN(lat) && !isNaN(lng)) {
    return { coords: { latitude: lat, longitude: lng } }
  }
  return null
}

const storeLocation = (location: YourLocation) => {
  setCookie(
    'location',
    `${location.coords.latitude},${location.coords.longitude}`,
    365,
  )
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<YourLocation | null>(
    getStoredLocation(),
  )

  const getBrowserLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }
          setLocation(newLocation)
          storeLocation(newLocation)
        },
        (error) => console.error('Error getting location:', error),
      )
    }
  }, [])
  const getCoarseLocation = useCallback((zip?: string) => {
    return getLocation(zip).then((loc) => {
      // console.log("got location", loc);
      const baseLocation = { coords: { latitude: loc.lat, longitude: loc.lng } }
      if (loc) {
        setLocation(baseLocation)
        storeLocation(baseLocation)
      }
      return baseLocation
    })
  }, [])
  useEffect(() => {
    if (location == null) {
      getCoarseLocation().catch(() => {
        console.log('unable to get a location')
      })
    }
  }, [getCoarseLocation, location])

  return { location, getBrowserLocation, getCoarseLocation }
}
