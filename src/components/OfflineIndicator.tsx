import { WifiOff, Wifi } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export const OfflineIndicator = () => {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        <span>You're offline - some features may be limited</span>
      </div>
    </div>
  )
}

export const OnlineStatusIndicator = () => {
  const { isOnline, isInstalled } = usePWA()

  return (
    <div className="flex items-center space-x-2">
      {isOnline ? (
        <span title="Online">
          <Wifi className="w-4 h-4 text-green-500" />
        </span>
      ) : (
        <span title="Offline">
          <WifiOff className="w-4 h-4 text-orange-500" />
        </span>
      )}
      {isInstalled && (
        <div
          className="w-2 h-2 bg-blue-500 rounded-full"
          title="PWA Installed"
        />
      )}
    </div>
  )
}

export default OfflineIndicator
