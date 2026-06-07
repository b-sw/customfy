import type { User } from '@/lib/api'

interface HomeProps {
  user: User
  onLogout: () => void
}

export function Home({ user, onLogout }: HomeProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-16 w-16 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <h1 className="text-4xl font-semibold tracking-tight">customfy</h1>
      <p className="text-zinc-400">
        Signed in as {user.email ?? user.displayName}
      </p>
      <button
        onClick={onLogout}
        className="mt-2 cursor-pointer rounded-md border border-neutral-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-neutral-800"
      >
        Log out
      </button>
    </main>
  )
}
