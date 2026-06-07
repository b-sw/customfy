import { useState } from 'react'
import { AuthApi, tokenStorage } from '@/lib/api'

interface LocalLoginFormProps {
  onAuthenticated: () => void
}

const QUICK_USERS = [
  { label: 'User A', email: 'user-a@customfy.dev' },
  { label: 'User B', email: 'user-b@customfy.dev' },
  { label: 'User C', email: 'user-c@customfy.dev' },
]

export function LocalLoginForm({ onAuthenticated }: LocalLoginFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const loginWithEmail = async (loginEmail: string) => {
    setLoading(true)
    try {
      const { token } = await AuthApi.loginLocal(loginEmail)
      tokenStorage.set(token)
      onAuthenticated()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) void loginWithEmail(email.trim())
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoFocus
          className="h-10 flex-1 rounded-md border-[0.5px] border-neutral-700/60 bg-neutral-800/80 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-neutral-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!email.trim() || loading}
          className="h-10 cursor-pointer rounded-md bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Go
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-700/50" />
        <span className="text-xs text-zinc-500">or</span>
        <div className="h-px flex-1 bg-neutral-700/50" />
      </div>

      <div className="flex gap-2">
        {QUICK_USERS.map((user) => (
          <button
            key={user.email}
            type="button"
            disabled={loading}
            onClick={() => void loginWithEmail(user.email)}
            className="flex-1 cursor-pointer rounded-md border-[0.5px] border-neutral-700/60 bg-neutral-800/80 py-2 text-xs text-zinc-200 transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-700/80 disabled:opacity-50"
          >
            {user.label}
          </button>
        ))}
      </div>
    </div>
  )
}
