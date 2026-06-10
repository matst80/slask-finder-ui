import { useEffect, useState } from 'react'

interface PWAStatus {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  needsUpdate: boolean
}

export const useIsInstalled = () => {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true
      ) {
        setIsInstalled(true)
      }
    }

    checkInstalled()
  }, [])

  return [isInstalled, setIsInstalled] as const
}

export const usePWA = (): PWAStatus => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useIsInstalled()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [needsUpdate, setNeedsUpdate] = useState(false)

  useEffect(() => {
    // Handle install prompt availability
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setIsInstallable(true)
    }

    // Handle app installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Handle service worker updates
    const handleControllerChange = () => {
      setNeedsUpdate(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        handleControllerChange,
      )
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          handleControllerChange,
        )
      }
    }
  }, [setIsInstalled])

  return {
    isInstallable,
    isInstalled,
    isOnline,
    needsUpdate,
  }
}

export default usePWA
