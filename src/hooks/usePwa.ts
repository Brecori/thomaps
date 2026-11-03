import { useCallback, useEffect, useRef, useState } from 'react'
import {
  askWorker,
  installedDisplay,
  installInstructions,
  type InstallPrompt,
} from '@/pwa/client'
import type { OfflineReadiness } from '@/pwa/protocol'

const supported = () =>
  import.meta.env.PROD && window.isSecureContext && 'serviceWorker' in navigator

export function usePwa() {
  const [readiness, setReadiness] = useState<OfflineReadiness>(() =>
    supported() ? 'preparing' : 'unavailable',
  )
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installed, setInstalled] = useState(installedDisplay)
  const [canInstall, setCanInstall] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [installMessage, setInstallMessage] = useState('')
  const [needUpdate, setNeedUpdate] = useState(false)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(false)
  const registration = useRef<ServiceWorkerRegistration | null>(null)
  const prompt = useRef<InstallPrompt | null>(null)
  const applyingRef = useRef(false)
  const updateAccepted = useRef(false)
  const pendingCheck = useRef(false)
  const mounted = useRef(false)
  const registerAgain = useRef<(() => Promise<void>) | null>(null)
  const updateDeadline = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const auditOffline = useCallback(async (repair = false) => {
    const worker =
      registration.current?.active ?? navigator.serviceWorker?.controller
    if (!worker || pendingCheck.current) return
    pendingCheck.current = true
    if (repair) {
      setReadiness('preparing')
      setMessage('')
    }
    try {
      const result = await askWorker(worker, {
        type: repair ? 'REPAIR_OFFLINE' : 'CHECK_OFFLINE',
      })
      if (!mounted.current) return
      if (result.type === 'OFFLINE_STATUS')
        setReadiness(result.ready ? 'ready' : 'incomplete')
      else if (result.type === 'ERROR') {
        setReadiness('error')
        setMessage(
          result.reason === 'storage'
            ? 'Faltou espaço para guardar o mapa. Libere espaço e tente novamente.'
            : 'Não foi possível preparar o mapa offline. Confira a conexão e tente novamente.',
        )
      }
    } catch {
      if (mounted.current) {
        setReadiness('error')
        setMessage(
          'Não foi possível conferir o mapa offline. Tente novamente com conexão.',
        )
      }
    } finally {
      pendingCheck.current = false
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    let disposed = false
    let removeRegistrationListeners = () => {}
    const display = window.matchMedia('(display-mode: standalone)')
    const onDisplay = () => setInstalled(installedDisplay())
    const onPrompt = (event: Event) => {
      if (!supported()) return
      event.preventDefault()
      prompt.current = event as InstallPrompt
      setCanInstall(true)
    }
    const onInstalled = () => {
      prompt.current = null
      setCanInstall(false)
      setInstalled(true)
      setInstallMessage('Thomaps instalado.')
    }
    const onConnection = () => {
      setOnline(navigator.onLine)
      if (supported()) void auditOffline()
    }
    const onFocus = () => {
      if (!document.hidden && supported()) {
        void auditOffline()
        if (navigator.onLine)
          void registration.current?.update().catch(() => {})
      }
    }
    const onController = () => {
      if (applyingRef.current) {
        clearTimeout(updateDeadline.current)
        window.location.reload()
      } else void auditOffline()
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('online', onConnection)
    window.addEventListener('offline', onConnection)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    display.addEventListener('change', onDisplay)
    navigator.serviceWorker?.addEventListener('controllerchange', onController)

    const register = async () => {
      if (!supported()) return
      try {
        const base = import.meta.env.BASE_URL
        const current = await navigator.serviceWorker.register(`${base}sw.js`, {
          scope: base,
          updateViaCache: 'none',
        })
        if (disposed) return
        removeRegistrationListeners()
        registration.current = current
        const workerListeners: Array<() => void> = []
        const refresh = () => {
          setNeedUpdate(Boolean(current.waiting))
          if (current.active) void auditOffline()
        }
        const watchWorker = () => {
          const worker = current.installing
          if (!worker) return
          const onState = () => {
            if (disposed) return
            refresh()
            if (worker.state === 'redundant') {
              if (!current.active) setReadiness('error')
              setMessage(
                'Não foi possível guardar esta versão. Confira a conexão e o espaço disponível para tentar novamente.',
              )
            }
          }
          worker.addEventListener('statechange', onState)
          workerListeners.push(() =>
            worker.removeEventListener('statechange', onState),
          )
        }
        current.addEventListener('updatefound', watchWorker)
        removeRegistrationListeners = () => {
          current.removeEventListener('updatefound', watchWorker)
          workerListeners.forEach((remove) => remove())
        }
        watchWorker()
        refresh()
      } catch {
        if (!disposed) {
          setReadiness('error')
          setMessage(
            'Não foi possível preparar o modo offline neste endereço. Tente novamente com conexão.',
          )
        }
      }
    }
    registerAgain.current = register
    void register()
    const interval = window.setInterval(() => {
      if (!document.hidden && supported()) void auditOffline()
    }, 60_000)
    return () => {
      disposed = true
      mounted.current = false
      clearTimeout(updateDeadline.current)
      registerAgain.current = null
      window.clearInterval(interval)
      removeRegistrationListeners()
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('online', onConnection)
      window.removeEventListener('offline', onConnection)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
      display.removeEventListener('change', onDisplay)
      navigator.serviceWorker?.removeEventListener(
        'controllerchange',
        onController,
      )
    }
  }, [auditOffline])

  const checkForUpdate = async () => {
    setChecking(true)
    setMessage('')
    try {
      if (!registration.current) {
        // A failed first install can leave no active registration to repair.
        await registerAgain.current?.()
      }
      if (!registration.current) throw new Error('registration unavailable')
      await registration.current.update()
      setNeedUpdate(Boolean(registration.current.waiting))
      await auditOffline()
    } catch {
      setMessage(
        'Não foi possível buscar atualizações. Tente novamente com conexão.',
      )
    } finally {
      setChecking(false)
    }
  }
  const prepareOffline = async () => {
    await checkForUpdate()
    if (registration.current?.waiting) {
      setMessage(
        'Há uma versão nova. Atualize quando quiser para preparar o mapa completo.',
      )
      return
    }
    await auditOffline(true)
  }
  const applyUpdate = async () => {
    const worker = registration.current?.waiting
    if (!worker || applyingRef.current) return
    setApplying(true)
    setMessage('')
    applyingRef.current = true
    updateAccepted.current = false
    updateDeadline.current = setTimeout(() => {
      if (updateAccepted.current) {
        // Keep consent to reload if activation finishes after suspension.
        setMessage(
          'A atualização está demorando. Se não concluir, feche e reabra o Thomaps.',
        )
        return
      }
      applyingRef.current = false
      setApplying(false)
      setMessage(
        'A atualização demorou para concluir. Confira a conexão e tente novamente.',
      )
    }, 20_000)
    try {
      const result = await askWorker(worker, { type: 'APPLY_UPDATE' })
      if (result.type === 'UPDATE_ACCEPTED') updateAccepted.current = true
      if (result.type !== 'UPDATE_ACCEPTED') {
        clearTimeout(updateDeadline.current)
        applyingRef.current = false
        setApplying(false)
        setMessage(
          result.type === 'ERROR' && result.reason === 'other-tabs'
            ? 'Feche as outras janelas do Thomaps para atualizar esta versão.'
            : 'Não foi possível aplicar a atualização. Tente novamente.',
        )
      }
    } catch {
      clearTimeout(updateDeadline.current)
      applyingRef.current = false
      setApplying(false)
      setMessage('A atualização não terminou. Tente novamente com conexão.')
    }
  }
  const install = async () => {
    const event = prompt.current
    if (!event) return
    prompt.current = null
    setCanInstall(false)
    setInstalling(true)
    try {
      await event.prompt()
      const choice = await event.userChoice
      setInstallMessage(
        choice.outcome === 'accepted'
          ? 'O navegador está concluindo a instalação.'
          : 'Você pode instalar depois pelo menu do navegador.',
      )
    } catch {
      setInstallMessage(
        'A instalação não foi concluída. Tente pelo menu do navegador.',
      )
    } finally {
      setInstalling(false)
    }
  }

  return {
    readiness,
    online,
    installed,
    canInstall,
    installing,
    installMessage,
    needUpdate,
    applying,
    checking,
    message,
    instructions: installInstructions(),
    available: supported(),
    auditOffline,
    prepareOffline,
    checkForUpdate,
    applyUpdate,
    install,
  }
}
