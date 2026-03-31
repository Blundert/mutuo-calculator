import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type Platform = 'android' | 'ios' | 'other'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua)
  const isAndroid = /android/i.test(ua)
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return 'other'
}

function isAlreadyInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

const DISMISSED_KEY = 'pwa-install-dismissed'

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform] = useState<Platform>(detectPlatform)
  const [installed, setInstalled] = useState(isAlreadyInstalled)
  const [dismissed, setDismissedState] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  )
  const [visible, setVisible] = useState(false)

  // Capture beforeinstallprompt (Android/Chrome/Edge)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Detect when app is installed
  useEffect(() => {
    const handler = () => setInstalled(true)
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  // Show banner after a short delay if applicable
  useEffect(() => {
    if (installed || dismissed) return

    const canShow =
      (platform === 'android' && prompt !== null) ||  // Android: wait for prompt event
      platform === 'ios' ||                            // iOS: always show instructions
      (platform === 'other' && prompt !== null)        // Desktop Chrome

    if (!canShow) return

    const timer = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(timer)
  }, [installed, dismissed, platform, prompt])

  const install = useCallback(async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setVisible(false)
    }
    setPrompt(null)
  }, [prompt])

  const dismiss = useCallback(() => {
    setVisible(false)
    setDismissedState(true)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }, [])

  return { visible, platform, prompt, installed, install, dismiss }
}
