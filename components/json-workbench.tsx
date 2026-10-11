'use client'

import { useMemo, useState } from 'react'
import { authClient } from '@/lib/auth-client'

const schemes = ['3DS2 / EMV 3-D Secure', 'AVS + CVV', 'Network token', 'Wallet authentication'] as const
type SchemeName = typeof schemes[number]
type Mode = 'standard' | 'inverted'
type Runtime = 'offline' | 'online'

const examples: Record<SchemeName, string> = {
  '3DS2 / EMV 3-D Secure': '{"transactionId":"txn_123","authenticated":true,"otpRequired":true,"otpCode":"123456"}',
  'AVS + CVV': '{"cardLast4":"4242","avsResult":"Y","cvvResult":"M","authenticated":true}',
  'Network token': '{"tokenRequestorId":"501100000000000","cryptogram":"AgAAAAA...","tokenAuthenticated":true}',
  'Wallet authentication': '{"wallet":"apple_pay","network":"visa","authenticated":true}',
}

export function JsonWorkbench({ email }: { email: string }) {
  const [scheme, setScheme] = useState<SchemeName>(schemes[0])
  const [mode, setMode] = useState<Mode>('standard')
  const [runtime, setRuntime] = useState<Runtime>('offline')
  const [input, setInput] = useState(examples[schemes[0]])
  const [url, setUrl] = useState('https://merchant.example/3ds/callback?transactionId=txn_123&otpRequired=true')
  const [output, setOutput] = useState('Ready to validate input.')
  const [security, setSecurity] = useState({ https: true, redact: true, origin: true, otp: true })
  const [copied, setCopied] = useState(false)
  const stats = useMemo(() => ({ input: input.length, output: output.length }), [input, output])

  function run() {
    try {
      const payload = JSON.parse(input) as Record<string, unknown>
      const params = new URL(url).searchParams
      const errors: string[] = []
      if (security.https && !url.startsWith('https://')) errors.push('URL must use HTTPS')
      if (security.origin && !url.includes('example')) errors.push('URL origin is not allowlisted')
      if (security.otp && payload.otpRequired === true && !/^\d{6}$/.test(String(payload.otpCode ?? ''))) errors.push('OTP required: enter otpCode as a 6-digit value in JSON input')
      const authenticated = mode === 'standard' ? payload.authenticated === true || payload.tokenAuthenticated === true : payload.authenticated === false || payload.tokenAuthenticated === false
      const result = { status: errors.length ? 'rejected' : 'processed', runtime, scheme, mode, input: payload, url: { received: url, parameters: Object.fromEntries(params) }, authentication: { authenticated, meaning: mode === 'standard' ? 'true = authenticated, false = rejected' : 'false = authenticated, true = rejected' }, otp: payload.otpRequired === true ? 'Input otpCode in JSON body; do not put the OTP in the URL.' : 'No OTP required.', security: { ...security, cardData: 'Never send PAN or CVV; use token and last4 only.' }, errors }
      setOutput(JSON.stringify(result, null, 2))
    } catch { setOutput(JSON.stringify({ status: 'rejected', errors: ['Input must be valid JSON.'], hint: 'Use the JSON input editor, then run again.' }, null, 2)) }
  }

  async function copy() { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  function selectScheme(value: SchemeName) { setScheme(value); setInput(examples[value]); setOutput('Preset loaded. Run the process to generate output.') }
  function downloadExtension() { const manifest = { manifest_version: 3, name: 'Schema Lab Auth Inspector', version: '1.0.0', permissions: ['storage', 'activeTab'], action: { default_title: 'Validate authentication JSON' } }; const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'schema-lab-extension-manifest.json'; a.click(); URL.revokeObjectURL(a.href) }

  return <div className="workspace"><header className="topbar"><div className="brand"><span className="brand-mark small">JS</span><span>Schema Lab</span></div><div className="user-area"><span className="user-email">{email}</span><button className="ghost-button" onClick={() => authClient.signOut().then(() => location.href = '/sign-in')}>Sign out</button></div></header><main className="workspace-main"><div className="intro"><div><p className="eyebrow">Authentication JSON toolkit</p><h1>Operate online or offline.</h1><p className="muted">Process payment authentication payloads, callback URLs, OTP instructions, and secure browser-ready outputs.</p></div><span className="status-pill"><i /> {runtime === 'offline' ? 'Offline-safe' : 'Online-ready'}</span></div><section className="scheme-strip"><div><p className="panel-kicker">Payment scheme</p><h2>Choose an authentication flow</h2></div><div className="scheme-list">{schemes.map((name) => <button key={name} className={name === scheme ? 'scheme-chip active' : 'scheme-chip'} onClick={() => selectScheme(name)}>{name}</button>)}</div></section><section className="flow-controls"><div><span className="panel-kicker">Runtime and boolean contract</span><strong>{mode === 'standard' ? 'True = authenticated' : 'False = authenticated'}</strong><p>{mode === 'standard' ? 'Use a normal pass/fail response.' : 'Inverted plan: false means passed; true means rejected.'}</p></div><div className="mode-buttons"><button className={runtime === 'offline' ? 'mode-button active' : 'mode-button'} onClick={() => setRuntime('offline')}>Offline</button><button className={runtime === 'online' ? 'mode-button active' : 'mode-button'} onClick={() => setRuntime('online')}>Online</button><button className={mode === 'standard' ? 'mode-button active' : 'mode-button'} onClick={() => setMode('standard')}>True is pass</button><button className={mode === 'inverted' ? 'mode-button active' : 'mode-button'} onClick={() => setMode('inverted')}>False is pass</button></div></section><section className="url-panel"><span className="panel-kicker">Process URL input</span><input aria-label="Callback URL" value={url} onChange={(e) => setUrl(e.target.value)} /><p>URL parameters are read for context only. Put OTP in JSON as <code>otpCode</code>, never in the URL.</p></section><section className="security-panel"><div><span className="panel-kicker">Security configuration</span><h2>Browser-safe requirements</h2></div><div className="security-options">{Object.entries(security).map(([key, value]) => <label key={key}><input type="checkbox" checked={value} onChange={() => setSecurity((s) => ({ ...s, [key]: !s[key as keyof typeof s] }))} /> {key === 'https' ? 'Require HTTPS' : key === 'redact' ? 'Redact card data' : key === 'origin' ? 'Check allowed origin' : 'Enforce OTP rule'}</label>)}</div></section><section className="lab-grid"><article className="panel"><div className="panel-head"><div><span className="panel-kicker">01 / JSON input</span><h2>Request payload</h2></div><span className="count">{stats.input} chars</span></div><textarea aria-label="JSON input" value={input} onChange={(e) => setInput(e.target.value)} /><p className="helper">{input.includes('otpRequired":true') ? 'OTP input required: enter a 6-digit otpCode here.' : 'No OTP input is required for this example.'}</p></article><article className="panel"><div className="panel-head"><div><span className="panel-kicker">02 / JSON output</span><h2>Process result</h2></div><span className="count">{stats.output} chars</span></div><pre>{output}</pre><div className="actions"><button className="primary-button" onClick={run}>Run process</button><button className="ghost-button" onClick={copy}>{copied ? 'Copied' : 'Copy output'}</button></div></article></section><section className="extension-panel"><div><span className="panel-kicker">Chrome API extension</span><h2>Use this validator in Chrome</h2><p className="muted">Download a Manifest V3 starter manifest for a browser extension. Keep secrets server-side and never store full card numbers.</p></div><button className="primary-button" onClick={downloadExtension}>Download extension manifest</button></section></main></div>
}

export default JsonWorkbench
