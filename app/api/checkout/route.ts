import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const body = await request.json().catch(() => ({}))
  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount < 1 || amount > 10000) return NextResponse.json({ error: 'Amount must be between $1 and $10,000.' }, { status: 400 })
  const origin = request.headers.get('origin') ?? process.env.V0_RUNTIME_URL ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Nimbus Pay authorization' }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
    success_url: `${origin}/?payment=success`,
    cancel_url: `${origin}/?payment=cancelled`,
    metadata: { otpRequired: 'true', websocketAuth: 'true' },
  })
  return NextResponse.json({ url: session.url })
}
