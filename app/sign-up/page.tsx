import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignUpPage() {
  return <main className="auth-shell"><section className="auth-card"><div className="brand-mark">JS</div><p className="eyebrow">Schema Lab</p><h1>Create your workspace</h1><p className="muted">A focused browser lab for authentication JSON.</p><AuthForm mode="sign-up" /><p className="auth-switch">Already have an account? <Link href="/sign-in">Sign in</Link></p></section></main>
}
