import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignInPage() {
  return <main className="auth-shell"><section className="auth-card"><div className="brand-mark">JS</div><p className="eyebrow">Schema Lab</p><h1>Welcome back</h1><p className="muted">Sign in to keep testing your auth payloads.</p><AuthForm mode="sign-in" /><p className="auth-switch">New here? <Link href="/sign-up">Create an account</Link></p></section></main>
}
