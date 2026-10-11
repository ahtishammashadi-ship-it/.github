'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })
    if (result.error) setError('Unable to authenticate. Check your details and try again.')
    else { router.push('/'); router.refresh() }
    setPending(false)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {mode === 'sign-up' && <label className="flex flex-col gap-2 text-sm font-medium">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="control" placeholder="Ada Lovelace" /></label>}
      <label className="flex flex-col gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="control" placeholder="you@example.com" /></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="control" placeholder="At least 8 characters" /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="primary-button">{pending ? 'Working…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
    </form>
  )
}
