'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Activity, ArrowUpRight, Check, ChevronDown, CircleDollarSign, Copy, CreditCard, LockKeyhole, LogOut, MessageSquare, Radio, ShieldCheck, Smartphone, Terminal, Wifi, Zap } from 'lucide-react'

type Event = { time: string; title: string; detail: string; kind: 'success' | 'info' | 'warning' }

const events: Event[] = [
  { time: '10:42:18', title: 'Payment intent authorized', detail: 'pi_3Qx...8f9 · $48.00 USD', kind: 'success' },
  { time: '10:42:17', title: 'OTP verified', detail: 'Session ws_8a2...c13 · 6-digit challenge', kind: 'success' },
  { time: '10:42:15', title: 'WebSocket connected', detail: 'wss://api.nimbus.dev/payments', kind: 'info' },
  { time: '10:41:58', title: 'OTP challenge sent', detail: '+1 (•••) •••-0192 · expires in 04:59', kind: 'warning' },
]

export function JsonWorkbench({ email }: { email: string }) {
  const [connected, setConnected] = useState(true)
  const [otp, setOtp] = useState('')
  const [verified, setVerified] = useState(true)
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('48.00')
  const [loading, setLoading] = useState(false)

  const checkout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: 'payment-authorization', amount: Number(amount) }) })
      const data = await response.json()
      if (data.url) window.location.href = data.url
    } finally { setLoading(false) }
  }

  const copyToken = async () => { await navigator.clipboard.writeText('ws_live_••••••••••••8f9c'); setCopied(true); setTimeout(() => setCopied(false), 1400) }

  return (
    <div className="nimbus-shell">
      <header className="nimbus-topbar">
        <div className="nimbus-brand"><span className="nimbus-logo"><Zap /></span><span>Nimbus Pay</span><span className="nimbus-badge">DEVELOPER</span></div>
        <div className="nimbus-top-actions"><span className="live-indicator"><i /> All systems operational</span><button className="nimbus-icon-btn" aria-label="Open notifications"><Activity /></button><div className="nimbus-profile"><span className="nimbus-avatar">{email.slice(0, 1).toUpperCase()}</span><span>{email.split('@')[0]}</span><ChevronDown /></div><button className="nimbus-logout" onClick={() => authClient.signOut().then(() => location.href = '/sign-in')}><LogOut /> Sign out</button></div>
      </header>
      <div className="nimbus-layout">
        <aside className="nimbus-sidebar"><div className="side-section"><span className="side-label">WORKSPACE</span><button className="side-link active"><CircleDollarSign /> Payments</button><button className="side-link"><Radio /> WebSocket channels <span className="side-count">3</span></button><button className="side-link"><MessageSquare /> Event logs</button></div><div className="side-section"><span className="side-label">DEVELOPMENT</span><button className="side-link"><Terminal /> API keys</button><button className="side-link"><LockKeyhole /> Security</button></div><div className="side-bottom"><div className="usage-card"><div className="usage-row"><span>Monthly volume</span><strong>$12,840 <small>/ $25k</small></strong></div><div className="usage-bar"><span /></div><p>Resets in 12 days</p></div><a href="#docs" className="docs-link">View documentation <ArrowUpRight /></a></div></aside>
        <main className="nimbus-main">
          <div className="nimbus-heading"><div><p className="nimbus-eyebrow">PAYMENTS / OVERVIEW</p><h1>Payment authorization</h1><p className="nimbus-subtitle">Secure checkout with real-time WebSocket verification.</p></div><div className="connection-pill"><span className={connected ? 'connection-dot' : 'connection-dot off'} /> <span>{connected ? 'WebSocket connected' : 'Disconnected'}</span><button onClick={() => setConnected(!connected)}>{connected ? 'Disconnect' : 'Connect'}</button></div></div>
          <section className="metric-grid"><div className="metric-card"><span className="metric-icon mint"><CreditCard /></span><div><p>Total processed</p><strong>$12,840.52</strong><span className="metric-up">+18.4% <small>vs last month</small></span></div></div><div className="metric-card"><span className="metric-icon blue"><Check /></span><div><p>Success rate</p><strong>98.7%</strong><span className="metric-up">+2.1% <small>vs last month</small></span></div></div><div className="metric-card"><span className="metric-icon violet"><Wifi /></span><div><p>Active sockets</p><strong>24</strong><span className="metric-neutral">3 new today</span></div></div><div className="metric-card"><span className="metric-icon orange"><Smartphone /></span><div><p>OTP verifications</p><strong>1,284</strong><span className="metric-up">+12.8% <small>vs last month</small></span></div></div></section>
          <div className="nimbus-content-grid"><section className="nimbus-panel checkout-panel"><div className="panel-header"><div><span className="panel-kicker">TEST CHECKOUT</span><h2>Authorize a payment</h2></div><span className="test-pill">TEST MODE</span></div><p className="panel-copy">Create a secure payment session. The OTP challenge is always required before authorization.</p><label className="nimbus-label" htmlFor="amount">Amount</label><div className="amount-input"><span>$</span><input id="amount" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" /><span>USD</span></div><div className="checkout-note"><ShieldCheck /><span>Stripe-hosted checkout · PCI compliant</span></div><button className="primary-cta" onClick={checkout} disabled={loading || !connected}>{loading ? 'Opening secure checkout...' : 'Create payment session'} <ArrowUpRight /></button><p className="fine-print">You&apos;ll be redirected to Stripe&apos;s secure payment page.</p></section>
          <section className="nimbus-panel otp-panel"><div className="panel-header"><div><span className="panel-kicker">AUTHENTICATION GATE</span><h2>OTP verification</h2></div><span className="verified-pill"><Check /> Always true</span></div><p className="panel-copy">Every payment must pass a one-time password challenge over the authenticated socket.</p><div className="otp-status"><div className="otp-status-icon"><LockKeyhole /></div><div><strong>{verified ? 'Identity verified' : 'Verification required'}</strong><span>{verified ? 'OTP challenge passed for this session' : 'Enter the 6-digit code to continue'}</span></div></div><label className="nimbus-label" htmlFor="otp">One-time password</label><input className="otp-input" id="otp" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerified(e.target.value.length === 6) }} placeholder="000000" inputMode="numeric" aria-describedby="otp-help" /><p id="otp-help" className="otp-help">Demo code: <button onClick={() => { setOtp('482901'); setVerified(true) }}>482901</button> · Expires in 04:59</p><div className="socket-row"><span className="connection-dot" /><span>Bound to authenticated WebSocket</span><code>ws_8a2...c13</code></div></section></div>
          <section className="nimbus-panel activity-panel"><div className="panel-header"><div><span className="panel-kicker">LIVE ACTIVITY</span><h2>Recent events</h2></div><button className="ghost-cta" onClick={copyToken}>{copied ? <><Check /> Copied</> : <><Copy /> Copy session token</>}</button></div><div className="event-list">{events.map((event, index) => <div className="event-row" key={event.time}><div className={`event-marker ${event.kind}`}><Check /></div><div className="event-detail"><strong>{event.title}</strong><span>{event.detail}</span></div><time>{event.time}</time>{index === 0 && <span className="event-live">LIVE</span>}</div>)}</div></section>
        </main>
      </div>
    </div>
  )
}

export default JsonWorkbench
