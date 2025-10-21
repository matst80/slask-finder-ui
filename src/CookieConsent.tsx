import { atom, useAtom } from 'jotai'
import { MouseEvent, useEffect, useState } from 'react'
import { Button } from './components/ui/button'
import { Dialog } from './components/ui/dialog'
import { cookieObject, setCookie } from './utils'

type CookieAcceptanceLevel = 'none' | 'all' | 'essential'

const getCookieAcceptance = () => {
  const cookie = cookieObject()
  if (cookie.ca == null) {
    return null
  }
  if (cookie.ca === 'all') {
    return 'all'
  }
  if (cookie.ca === 'none') {
    return 'none'
  }
  return 'essential'
}

const cookieAcceptanceAtom = atom<CookieAcceptanceLevel | null>(
  getCookieAcceptance(),
)

export const useCookieAcceptance = () => {
  const [accepted, setAccepted] = useAtom(cookieAcceptanceAtom)
  const manageConsent = () => {
    setAccepted(null)
  }
  const updateAccept = (value: CookieAcceptanceLevel | null) => {
    // console.log("updateAccept", value);
    if (value === 'none') {
      setCookie('ca', '', -10)
      setCookie('sfadmin', '', -10)
      setCookie('locale', '', -10)
      setCookie('cartid', '', -10)
    }
    if (value === 'essential') {
      setCookie('sid', '', -1)
    }
    setCookie(
      'ca',
      value ?? '',
      value == null || value === 'none' ? undefined : 365 * 5,
    )
    setAccepted(value)
  }
  return { accepted, updateAccept, manageConsent }
}

export const CookieConsent = () => {
  const { accepted, updateAccept } = useCookieAcceptance()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [open, setOpen] = useState<boolean>(accepted == null)
  const handleAccept = (value: CookieAcceptanceLevel) => (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateAccept(value)
    setOpen(false)
  }
  const handleReject = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateAccept('none')
    setOpen(false)
  }
  useEffect(() => {
    if (accepted == null) {
      setOpen(true)
    }
  }, [accepted])

  return (
    <Dialog open={open} setOpen={setOpen} attached="bottom">
      <div className="flex items-center justify-between p-6 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="flex flex-col gap-2">
            <p>
              This site uses cookies, basic function cookies and also optional
              for improving search results for you and others,{' '}
              <a
                href="#details"
                onClick={() => setDetailsOpen((p) => !p)}
                className="underline hover:no-underline"
              >
                details
              </a>
              .
            </p>
            {detailsOpen && (
              <p className="my-2 text-gray-700 animate-pop-slow">
                "cartid" if you use the cart, "sid" for session tracking,
                "locale" for language selection and "sfadmin" if you login and
                "ca" for consent.
              </p>
            )}
            <p className="text-sm text-gray-500">
              By clicking "Accept" you consent to the use of cookies. You can
              also choose to reject cookies.
            </p>
          </div>
          <form className="flex gap-2 items-center" method="dialog">
            <Button
              variant="default"
              type="submit"
              autoFocus
              onClick={handleAccept('all')}
              tabIndex={1}
            >
              Accept all
            </Button>
            <Button
              variant="outline"
              onClick={handleAccept('essential')}
              tabIndex={2}
            >
              Accept essential
            </Button>
            <Button variant="secondary" onClick={handleReject} tabIndex={3}>
              Reject
            </Button>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
