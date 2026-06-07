import { useCallback, useEffect, useState } from 'react'
import { AuthApi, tokenStorage, type User } from '@/lib/api'
import { LoginScreen } from '@/components/LoginScreen'
import { Home } from '@/components/Home'

type Status = 'loading' | 'authenticated' | 'unauthenticated'

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadCurrentUser = useCallback(async () => {
    try {
      const me = await AuthApi.getMe()
      setUser(me)
      setStatus('authenticated')
    } catch {
      tokenStorage.clear()
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    const cleanUrl = () => {
      window.history.replaceState({}, '', import.meta.env.BASE_URL)
    }

    const run = async () => {
      if (code) {
        try {
          const { token } = await AuthApi.loginGoogle(code)
          tokenStorage.set(token)
          cleanUrl()
          await loadCurrentUser()
        } catch {
          cleanUrl()
          setError('Google sign-in failed. Please try again.')
          setStatus('unauthenticated')
        }
        return
      }

      if (tokenStorage.get()) {
        await loadCurrentUser()
        return
      }

      setStatus('unauthenticated')
    }

    void run()
  }, [loadCurrentUser])

  const handleLogout = () => {
    tokenStorage.clear()
    setUser(null)
    setStatus('unauthenticated')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950 text-zinc-400">
        Loading…
      </div>
    )
  }

  if (status === 'authenticated' && user) {
    return <Home user={user} onLogout={handleLogout} />
  }

  return (
    <div className="relative">
      {error ? (
        <div className="absolute inset-x-0 top-0 z-20 bg-red-500/10 py-2 text-center text-sm text-red-400">
          {error}
        </div>
      ) : null}
      <LoginScreen onAuthenticated={loadCurrentUser} />
    </div>
  )
}

export default App
