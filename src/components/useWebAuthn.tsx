import { useState, useEffect, useCallback } from 'react'

export const useWebAuthn = () => {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const checkWebAuthnSupport = async () => {
      if (globalThis.PublicKeyCredential) {
        setIsSupported(true)
      }
    }
    checkWebAuthnSupport()
  }, [])

  const initiateRegistration = useCallback(async () => {
    const publicKey = await fetch('/admin/webauthn/register/start')
      .then((res) => res.json())
      .then((d) => {
        return globalThis.PublicKeyCredential.parseCreationOptionsFromJSON(
          d.publicKey,
        )
      })
    const credential = await navigator.credentials.create({ publicKey })
    if (!credential) {
      throw new Error('No credential returned from WebAuthn API')
    }
    return await fetch('/admin/webauthn/register/finish', {
      method: 'POST',
      body: JSON.stringify((credential as PublicKeyCredential).toJSON()),
    })
  }, [])

  const initiateWebAuthnLogin = useCallback(async () => {
    const publicKey = await fetch('/admin/webauthn/login/start', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((d) => {
        return globalThis.PublicKeyCredential.parseRequestOptionsFromJSON(
          d.publicKey,
        )
      })
    const credential = await navigator.credentials.get({ publicKey })
    if (!credential) {
      throw new Error('No credential returned from WebAuthn API')
    }
    return await fetch('/admin/webauthn/login/finish', {
      method: 'POST',
      body: JSON.stringify((credential as PublicKeyCredential).toJSON()),
    })
  }, [])

  return { isSupported, initiateWebAuthnLogin, initiateRegistration }
}
