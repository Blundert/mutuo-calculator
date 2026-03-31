import { useEffect, useState } from 'react'
import { X, Share, MoreVertical, Plus } from 'lucide-react'
import { usePWAInstall } from '../hooks/use-pwa-install'

// iOS Share icon SVG (matches the actual iOS icon)
function IOSShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline-block w-5 h-5 align-text-bottom" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-3"/>
      <path d="M12 3v13"/>
      <path d="M9 6l3-3 3 3"/>
    </svg>
  )
}

function AndroidContent({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <div>
          <p className="font-semibold text-base">Installa Mutuo</p>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Aggiungi l'app alla schermata Home per un accesso rapido, anche offline.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
        >
          Non ora
        </button>
        <button
          onClick={onInstall}
          className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors"
        >
          Installa
        </button>
      </div>
    </>
  )
}

function IOSContent({ onDismiss }: { onDismiss: () => void }) {
  const isChrome = /crios/i.test(navigator.userAgent)

  return (
    <>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <div>
          <p className="font-semibold text-base">Aggiungi alla Home</p>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {isChrome
              ? 'Apri questa pagina in Safari per installare l\'app.'
              : 'Installa Mutuo per un accesso rapido, anche offline.'
            }
          </p>
        </div>
      </div>

      {!isChrome && (
        <ol className="space-y-2 mb-4">
          <li className="flex items-center gap-2.5 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span>
              Tocca{' '}
              <span className="inline-flex items-center gap-1 font-medium">
                <IOSShareIcon /> Condividi
              </span>
              {' '}nella barra di Safari
            </span>
          </li>
          <li className="flex items-center gap-2.5 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span>
              Scorri e tocca{' '}
              <span className="inline-flex items-center gap-1 font-medium">
                <Plus className="w-4 h-4" /> Aggiungi a Home
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2.5 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span>Tocca <strong>Aggiungi</strong> in alto a destra</span>
          </li>
        </ol>
      )}

      <button
        onClick={onDismiss}
        className="w-full py-2 rounded-lg text-sm font-medium border transition-colors"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
      >
        {isChrome ? 'Chiudi' : 'Ho capito'}
      </button>
    </>
  )
}

export function PWAInstallPrompt() {
  const { visible, platform, install, dismiss } = usePWAInstall()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible) {
      // Trigger enter animation
      const t = setTimeout(() => setMounted(true), 10)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [visible])

  if (!visible) return null

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-300"
        style={{ opacity: mounted ? 1 : 0 }}
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto rounded-t-2xl p-5 shadow-2xl transition-transform duration-300"
        style={{
          backgroundColor: 'hsl(var(--background))',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-colors"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />

        {platform === 'ios' ? (
          <IOSContent onDismiss={dismiss} />
        ) : (
          <AndroidContent onInstall={install} onDismiss={dismiss} />
        )}
      </div>
    </>
  )
}
